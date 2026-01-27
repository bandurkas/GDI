import { prisma } from "@/lib/prisma";

export class CartService {
    static async getCart(userId: string) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } },
            });
        }

        return cart;
    }

    static async addToCart(userId: string, productId: string, quantity: number = 1) {
        const cart = await this.getCart(userId);

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId },
        });

        if (existingItem) {
            return await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            return await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                },
            });
        }
    }

    static async clearCart(userId: string) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
    }

    static async getCartCount(userId: string) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { _count: { select: { items: true } } },
        });
        return cart?._count.items ?? 0;
    }
}
