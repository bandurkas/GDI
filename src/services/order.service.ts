import { prisma } from "@/lib/prisma";
import { PaymentService, PaymentMode } from "./payment.service";

export class OrderService {
    static async createOrder(userId: string, paymentMethod: PaymentMode) {
        const order = await prisma.$transaction(async (tx) => {
            // 1. Fetch cart items
            const cart = await tx.cart.findUnique({
                where: { userId },
                include: { items: { include: { product: true } } },
            });

            if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            // 2. Calculate total cents (using product price from DB as single source of truth)
            let totalCents = 0;
            for (const item of cart.items) {
                totalCents += item.product.priceCents * item.quantity;
            }

            // 3. Process Payment (via abstraction)
            const paymentService = new PaymentService(paymentMethod);
            const paymentResult = await paymentService.pay(totalCents);

            if (paymentResult.status !== "SUCCESS") {
                throw new Error("Payment failed");
            }

            // 4. Create Order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalCents,
                    status: "COMPLETED",
                    paymentMethod: paymentMethod === "TEST" ? "TEST" : "MIDTRANS",
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            productName: item.product.name,
                            priceCents: item.product.priceCents,
                            quantity: item.quantity,
                        })),
                    },
                },
            });

            // 5. Clear Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            // 6. Create PENDING Cashback Transaction
            // Fetch user's cashback percentage, default to 80% if not set
            const user = await tx.user.findUnique({ where: { id: userId } });
            const userPercentage = user?.cashbackPercentage ?? 80.0;
            const cashbackRate = userPercentage / 100; // Convert 80.0 -> 0.8

            const cashbackAmount = Math.floor(totalCents * cashbackRate);

            await tx.cashbackTransaction.create({
                data: {
                    userId,
                    orderId: order.id,
                    amountCents: cashbackAmount,
                    rate: cashbackRate,
                    status: "PENDING",  // Starts as PENDING
                },
            });

            // 7. Update Wallet - Add to PENDING balance
            await tx.wallet.upsert({
                where: { userId },
                create: {
                    userId,
                    availableBalanceCents: 0,
                    pendingBalanceCents: cashbackAmount,
                    totalEarnedCents: cashbackAmount,
                    totalPaidOutCents: 0,
                },
                update: {
                    pendingBalanceCents: { increment: cashbackAmount },
                    totalEarnedCents: { increment: cashbackAmount },
                },
            });

            return order;
        });

        // 8. Auto-Approve Cashback (Instant Rewards)
        // We do this outside the main transaction to avoid nested transaction complexity
        // If this fails, the user still has PENDING cashback, which is a safe fallback.
        try {
            const { CashbackService } = await import("./cashback.service");
            await CashbackService.approveCashback(order.id);
        } catch (error) {
            console.error("Failed to auto-approve cashback:", error);
        }

        return order;
    }

    static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [total, orders] = await prisma.$transaction([
            prisma.order.count({ where: { userId } }),
            prisma.order.findMany({
                where: { userId },
                include: { items: true },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
        ]);

        return { orders, total };
    }

    static async getAllOrders() {
        return await prisma.order.findMany({
            include: {
                user: { select: { email: true } },
                items: true
            },
            orderBy: { createdAt: "desc" },
        });
    }
}
