import { prisma } from "@/lib/prisma";
import { PaymentService, PaymentMode } from "./payment.service";

export class OrderService {
    static async createOrder(userId: string, paymentMethod: PaymentMode) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const order = await prisma.$transaction(async (tx) => {
            // 1. Fetch cart items
            const cart = await tx.cart.findUnique({
                where: { userId },
                include: { items: { include: { product: true } } },
            });

            if (!cart || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }

            // 2. Calculate total cents
            let totalCents = 0;
            for (const item of cart.items) {
                totalCents += item.product.priceCents * item.quantity;
            }

            // 3. Create PENDING Order
            const order = await tx.order.create({
                data: {
                    userId,
                    totalCents,
                    status: "PENDING", // Always starts as PENDING for Midtrans
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

            // 4. Clear Cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return order;
        });

        // 5. Process Payment (Request Snap Token)
        const paymentService = new PaymentService(paymentMethod);
        const customerDetails = {
            first_name: (user as any).name || user.email.split("@")[0],
            email: user.email,
        };

        const paymentResult = await paymentService.pay(order.totalCents, order.id, customerDetails);

        if (paymentResult.status === "FAILED") {
            // Update order status to FAILED if token generation fails
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "FAILED" },
            });
            throw new Error(paymentResult.error || "Payment initialization failed");
        }

        // If TEST mode, we can auto-complete if we want, or just leave as is.
        // Actually for TEST mode, let's auto-complete so it still works as before.
        if (paymentMethod === "TEST") {
            await this.completeOrder(order.id);
            return { ...order, status: "COMPLETED" };
        }

        return {
            ...order,
            snapToken: paymentResult.snapToken
        };
    }

    static async completeOrder(orderId: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (!order) throw new Error("Order not found");
            if (order.status === "COMPLETED") return order;

            // 1. Update Order Status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: "COMPLETED" },
            });

            // 2. Create PENDING Cashback Transaction
            const user = await tx.user.findUnique({ where: { id: order.userId } });
            const userPercentage = user?.cashbackPercentage ?? 80.0;
            const cashbackRate = userPercentage / 100;
            const cashbackAmount = Math.floor(order.totalCents * cashbackRate);

            await tx.cashbackTransaction.create({
                data: {
                    userId: order.userId,
                    orderId: order.id,
                    amountCents: cashbackAmount,
                    rate: cashbackRate,
                    status: "PENDING",
                },
            });

            // 3. Update Wallet - Add to PENDING balance
            await tx.wallet.upsert({
                where: { userId: order.userId },
                create: {
                    userId: order.userId,
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

            return updatedOrder;
        }).then(async (order) => {
            // 4. Auto-Approve Cashback (Instant Rewards)
            try {
                const { CashbackService } = await import("./cashback.service");
                await CashbackService.approveCashback(order.id);
            } catch (error) {
                console.error("Failed to auto-approve cashback:", error);
            }
            return order;
        });
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
