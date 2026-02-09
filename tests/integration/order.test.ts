import { OrderService } from '@/services/order.service';
import { prisma, cleanDatabase, createTestUser, createTestProduct, addToCart } from '../helpers/db';

describe('OrderService - Critical Financial Flow', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    describe('createOrder', () => {
        it('should create order with correct total', async () => {
            // Arrange
            const { user } = await createTestUser();
            const product = await createTestProduct({ priceCents: 10000 }); // $100
            await addToCart(user.id, product.id, 2); // 2 items

            // Act
            const order = await OrderService.createOrder(user.id, 'TEST');

            // Assert
            expect(order).toBeDefined();
            expect(order.totalCents).toBe(20000); // $200
            expect(order.status).toBe('PENDING');
            expect(order.userId).toBe(user.id);
        });

        it('should calculate cashback correctly', async () => {
            // Arrange
            const { user } = await createTestUser({ cashbackPercentage: 80.0 });
            const product = await createTestProduct({ priceCents: 10000 }); // $100
            await addToCart(user.id, product.id, 1);

            // Act
            const order = await OrderService.createOrder(user.id, 'TEST');

            // Assert
            const cashback = await prisma.cashbackTransaction.findFirst({
                where: { orderId: order.id },
            });

            expect(cashback).toBeDefined();
            expect(cashback?.amountCents).toBe(8000); // 80% of $100 = $80
            expect(cashback?.status).toBe('PENDING');
            expect(cashback?.rate).toBe(0.8);
        });

        it('should update wallet balance atomically', async () => {
            // Arrange
            const { user, wallet } = await createTestUser();
            const product = await createTestProduct({ priceCents: 10000 });
            await addToCart(user.id, product.id, 1);

            const initialBalance = wallet.availableBalanceCents;

            // Act
            await OrderService.createOrder(user.id, 'TEST');

            // Assert
            const updatedWallet = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });

            expect(updatedWallet?.availableBalanceCents).toBe(initialBalance + 8000); // +$80 cashback
            expect(updatedWallet?.totalEarnedCents).toBe(8000);
        });

        it('should clear cart after order creation', async () => {
            // Arrange
            const { user } = await createTestUser();
            const product = await createTestProduct({ priceCents: 10000 });
            await addToCart(user.id, product.id, 1);

            // Verify cart has items
            const cartBefore = await prisma.cart.findUnique({
                where: { userId: user.id },
                include: { items: true },
            });
            expect(cartBefore?.items.length).toBe(1);

            // Act
            await OrderService.createOrder(user.id, 'TEST');

            // Assert
            const cartAfter = await prisma.cart.findUnique({
                where: { userId: user.id },
                include: { items: true },
            });
            expect(cartAfter?.items.length).toBe(0);
        });

        it('should snapshot product prices at purchase time', async () => {
            // Arrange
            const { user } = await createTestUser();
            const product = await createTestProduct({ priceCents: 10000 });
            await addToCart(user.id, product.id, 1);

            // Act
            const order = await OrderService.createOrder(user.id, 'TEST');

            // Change product price
            await prisma.product.update({
                where: { id: product.id },
                data: { priceCents: 20000 }, // Double the price
            });

            // Assert - order should still have original price
            const orderItems = await prisma.orderItem.findMany({
                where: { orderId: order.id },
            });

            expect(orderItems[0].priceCents).toBe(10000); // Original price
        });

        it('should handle multiple products in cart', async () => {
            // Arrange
            const { user } = await createTestUser();
            const product1 = await createTestProduct({ priceCents: 10000 });
            const product2 = await createTestProduct({ priceCents: 5000 });
            await addToCart(user.id, product1.id, 2);
            await addToCart(user.id, product2.id, 3);

            // Act
            const order = await OrderService.createOrder(user.id, 'TEST');

            // Assert
            expect(order.totalCents).toBe(35000); // (10000 * 2) + (5000 * 3)

            const orderItems = await prisma.orderItem.findMany({
                where: { orderId: order.id },
            });
            expect(orderItems.length).toBe(2);
        });

        it('should rollback on error (transaction atomicity)', async () => {
            // Arrange
            const { user } = await createTestUser();
            const product = await createTestProduct({ priceCents: 10000 });
            await addToCart(user.id, product.id, 1);

            // Mock a failure in the middle of transaction
            // This is tricky - we'd need to inject a failure point
            // For now, we'll test that if the whole transaction fails, nothing is created

            // Delete wallet to cause failure
            await prisma.wallet.delete({ where: { userId: user.id } });

            // Act & Assert
            await expect(
                OrderService.createOrder(user.id, 'TEST')
            ).rejects.toThrow();

            // Verify nothing was created
            const orders = await prisma.order.findMany({
                where: { userId: user.id },
            });
            expect(orders.length).toBe(0);

            const cashbacks = await prisma.cashbackTransaction.findMany({
                where: { userId: user.id },
            });
            expect(cashbacks.length).toBe(0);
        });

        it('should handle custom cashback percentage', async () => {
            // Arrange
            const { user } = await createTestUser({ cashbackPercentage: 50.0 }); // 50% cashback
            const product = await createTestProduct({ priceCents: 10000 });
            await addToCart(user.id, product.id, 1);

            // Act
            await OrderService.createOrder(user.id, 'TEST');

            // Assert
            const cashback = await prisma.cashbackTransaction.findFirst({
                where: { userId: user.id },
            });

            expect(cashback?.amountCents).toBe(5000); // 50% of $100 = $50
        });

        it('should throw error if cart is empty', async () => {
            // Arrange
            const { user } = await createTestUser();
            // Cart is empty

            // Act & Assert
            await expect(
                OrderService.createOrder(user.id, 'TEST')
            ).rejects.toThrow();
        });

        it('should create order items with product names', async () => {
            // Arrange
            const { user } = await createTestUser();
            const product = await createTestProduct({ name: 'Premium Widget' });
            await addToCart(user.id, product.id, 1);

            // Act
            const order = await OrderService.createOrder(user.id, 'TEST');

            // Assert
            const orderItems = await prisma.orderItem.findMany({
                where: { orderId: order.id },
            });

            expect(orderItems[0].productName).toBe('Premium Widget');
        });
    });
});
