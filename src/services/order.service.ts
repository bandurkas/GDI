import { prisma } from "@/lib/prisma";
import { PaymentService, PaymentMode } from "./payment.service";

export class OrderService {
    static async createOrder(userId: string, paymentMethod: PaymentMode) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        const order = await prisma.$transaction(async (tx: any) => {
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
                        create: cart.items.map((item: any) => ({
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
        console.log(`[OrderService] Completing order: ${orderId}`);
        return await prisma.$transaction(async (tx: any) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true },
            });

            if (!order) {
                console.error(`[OrderService] Order not found: ${orderId}`);
                throw new Error("Order not found");
            }
            if (order.status === "COMPLETED") {
                console.log(`[OrderService] Order already completed: ${orderId}. Checking cashback status...`);
                return order;
            }

            // 1. Update Order Status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: "COMPLETED" },
            });
            console.log(`[OrderService] Order status updated to COMPLETED`);

            // 2. Create PENDING Cashback Transaction
            const user = await tx.user.findUnique({ where: { id: order.userId } });

            // Use safe default logic clearly
            let userPercentage = 80.0;
            if (user?.cashbackPercentage !== null && user?.cashbackPercentage !== undefined) {
                userPercentage = user.cashbackPercentage;
            }
            console.log(`[OrderService] User: ${order.userId}, Cashback %: ${userPercentage} (Raw DB: ${user?.cashbackPercentage})`);

            const cashbackRate = userPercentage / 100;
            const cashbackAmount = Math.floor(order.totalCents * cashbackRate);

            console.log(`[OrderService] Calculated Cashback: ${cashbackAmount} cents (Rate: ${cashbackRate}, Total: ${order.totalCents})`);

            const cashbackTx = await tx.cashbackTransaction.create({
                data: {
                    userId: order.userId,
                    orderId: order.id,
                    amountCents: cashbackAmount,
                    rate: cashbackRate,
                    status: "PENDING",
                },
            });
            console.log(`[OrderService] Created PENDING cashback transaction: ${cashbackTx.id}`);

            // 3. Update Wallet - Add to PENDING balance
            const wallet = await tx.wallet.upsert({
                where: { userId: order.userId },
                create: {
                    userId: order.userId,
                    availableBalanceCents: 0,
                    // DB stores IDR, so divide cents by 100
                    pendingBalanceCents: Math.floor(cashbackAmount / 100),
                    totalEarnedCents: Math.floor(cashbackAmount / 100),
                    totalPaidOutCents: 0,
                },
                update: {
                    pendingBalanceCents: { increment: Math.floor(cashbackAmount / 100) },
                    totalEarnedCents: { increment: Math.floor(cashbackAmount / 100) },
                },
            });
            console.log(`[OrderService] Updated wallet pending balance. New pending: ${wallet.pendingBalanceCents}`);

            return updatedOrder;
        }).then(async (order: any) => {
            console.log(`[OrderService] Transaction committed. Attempting auto-approve...`);
            // 4. Auto-Approve Cashback (Instant Rewards)
            try {
                // Check if cashback is still pending before approving
                // This call is idempotent but let's be safe.
                const { CashbackService } = await import("./cashback.service");

                // We approve immediately. The service checks status internally.
                const result = await CashbackService.approveCashback(order.id);
                console.log(`[OrderService] Auto-approve SUCCESS. Cashback ID: ${result.id}, Status: ${result.status}`);
            } catch (error: any) {
                // Ignore "Cashback is already AVAILABLE/PAID" errors as success
                if (error.message && (error.message.includes("Cashback is already AVAILABLE") || error.message.includes("Cashback is already PAID"))) {
                    console.log(`[OrderService] Cashback already processed.`);
                } else {
                    console.error("[OrderService] Failed to auto-approve cashback:", error);
                }
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

    static async createGuestOrder(email: string, name: string | null, items: { productId: string, quantity: number }[], paymentMethod: PaymentMode) {
        // 1. Find or create user
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Create a "shadow" user for the guest
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    passwordHash: "", // No password yet
                    role: "USER",
                    mustChangePassword: true,
                }
            });
        }

        const order = await prisma.$transaction(async (tx: any) => {
            // 2. Fetch products to get prices
            const productIds = items.map(i => i.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } }
            });

            // 3. Calculate total
            let totalCents = 0;
            const orderItems = items.map(item => {
                const product = products.find((p: any) => p.id === item.productId);
                if (!product) throw new Error(`Product ${item.productId} not found`);
                totalCents += product.priceCents * item.quantity;
                return {
                    productId: item.productId,
                    productName: product.name,
                    priceCents: product.priceCents,
                    quantity: item.quantity,
                };
            });

            // 4. Create Order
            return await tx.order.create({
                data: {
                    userId: user!.id,
                    totalCents,
                    status: "PENDING",
                    paymentMethod: paymentMethod === "TEST" ? "TEST" : "MIDTRANS",
                    items: {
                        create: orderItems,
                    },
                },
            });
        });

        // 5. Process Payment
        const paymentService = new PaymentService(paymentMethod);
        const customerDetails = {
            first_name: user.name || user.email.split("@")[0],
            email: user.email,
        };

        const paymentResult = await paymentService.pay(order.totalCents, order.id, customerDetails);

        if (paymentResult.status === "FAILED") {
            await prisma.order.update({
                where: { id: order.id },
                data: { status: "FAILED" },
            });
            throw new Error(paymentResult.error || "Payment initialization failed");
        }

        if (paymentMethod === "TEST") {
            await this.completeOrder(order.id);
            return { ...order, status: "COMPLETED" };
        }

        return {
            ...order,
            snapToken: paymentResult.snapToken
        };
    }
}
