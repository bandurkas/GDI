import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Test database utilities
 */

export async function cleanDatabase() {
    // Delete in reverse order of dependencies
    await prisma.orderItem.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cashbackTransaction.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
}

export async function createTestUser(overrides: any = {}) {
    const user = await prisma.user.create({
        data: {
            email: overrides.email || `test-${Date.now()}@example.com`,
            passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Dummy hash
            role: overrides.role || 'USER',
            cashbackPercentage: overrides.cashbackPercentage || 80.0,
            ...overrides,
        },
    });

    // Create wallet for user
    const wallet = await prisma.wallet.create({
        data: {
            userId: user.id,
            availableBalanceCents: overrides.walletBalance || 0,
            totalEarnedCents: 0,
            totalPaidOutCents: 0,
        },
    });

    // Create cart for user
    const cart = await prisma.cart.create({
        data: {
            userId: user.id,
        },
    });

    return { user, wallet, cart };
}

export async function createTestProduct(overrides: any = {}) {
    return await prisma.product.create({
        data: {
            name: overrides.name || 'Test Product',
            description: overrides.description || 'Test Description',
            priceCents: overrides.priceCents || 10000, // $100
            active: overrides.active !== undefined ? overrides.active : true,
            ...overrides,
        },
    });
}

export async function addToCart(userId: string, productId: string, quantity: number = 1) {
    const cart = await prisma.cart.findUnique({
        where: { userId },
    });

    if (!cart) {
        throw new Error('Cart not found');
    }

    return await prisma.cartItem.create({
        data: {
            cartId: cart.id,
            productId,
            quantity,
        },
    });
}

export { prisma };

// Cleanup after all tests
afterAll(async () => {
    await prisma.$disconnect();
});
