import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartService } from './cart.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        cart: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        cartItem: {
            findFirst: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

describe('CartService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCart', () => {
        it('should return existing cart', async () => {
            const mockCart = { id: 'cart-1', userId: 'user-1', items: [] };
            (prisma.cart.findUnique as any).mockResolvedValue(mockCart);

            const cart = await CartService.getCart('user-1');
            expect(cart).toEqual(mockCart);
        });

        it('should create cart if not exists', async () => {
            (prisma.cart.findUnique as any).mockResolvedValue(null);
            (prisma.cart.create as any).mockResolvedValue({ id: 'cart-new', userId: 'user-1', items: [] });

            const cart = await CartService.getCart('user-1');
            expect(cart.id).toBe('cart-new');
            expect(prisma.cart.create).toHaveBeenCalled();
        });
    });

    describe('addToCart', () => {
        it('should increment quantity if item exists', async () => {
            const mockCart = { id: 'cart-1', userId: 'user-1' };
            (prisma.cart.findUnique as any).mockResolvedValue(mockCart);
            (prisma.cartItem.findFirst as any).mockResolvedValue({ id: 'item-1', productId: 'prod-1', quantity: 1 });

            await CartService.addToCart('user-1', 'prod-1', 2);

            expect(prisma.cartItem.update).toHaveBeenCalledWith({
                where: { id: 'item-1' },
                data: { quantity: 3 },
            });
        });
    });
});
