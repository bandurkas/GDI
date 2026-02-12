import { prisma } from "@/lib/prisma";

export class CartService {
    static async getCart(userId: string) {
        console.log(`[CartService] Getting cart for user: ${userId}`);
        try {
            let cart = await prisma.cart.findUnique({
                where: { userId },
                include: { items: { include: { product: true } } },
            });

            if (!cart) {
                console.log(`[CartService] No cart found for user ${userId}, creating one...`);
                cart = await prisma.cart.create({
                    data: { userId },
                    include: { items: { include: { product: true } } },
                });
            }

            return cart;
        } catch (error) {
            console.error(`[CartService] Error in getCart for user ${userId}:`, error);
            throw error;
        }
    }

    static async addToCart(userId: string, productId: string, quantity: number = 1) {
        console.log(`[CartService] Adding to cart: user=${userId}, product=${productId}, qty=${quantity}`);
        try {
            const cart = await this.getCart(userId);

            const existingItem = await prisma.cartItem.findFirst({
                where: { cartId: cart.id, productId },
            });

            if (existingItem) {
                console.log(`[CartService] Increasing quantity for existing item ${existingItem.id}`);
                return await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + quantity },
                });
            } else {
                console.log(`[CartService] Creating new cart item for product ${productId}`);
                return await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity,
                    },
                });
            }
        } catch (error) {
            console.error(`[CartService] Error in addToCart:`, error);
            throw error;
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

    static async removeProduct(userId: string, productId: string) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: productId
                }
            });
        }
    }
}
