import { prisma } from "@/lib/prisma";

export class CashbackService {
    /**
     * Approve pending cashback - moves from PENDING to AVAILABLE
     * This makes the cashback available for withdrawal
     */
    static async approveCashback(orderId: string) {
        return await prisma.$transaction(async (tx: any) => {
            const cashback = await tx.cashbackTransaction.findUnique({
                where: { orderId },
            });

            if (!cashback) {
                throw new Error("Cashback transaction not found");
            }

            if (cashback.status !== "PENDING") {
                throw new Error(`Cashback is already ${cashback.status}`);
            }

            // Update cashback status to AVAILABLE
            await tx.cashbackTransaction.update({
                where: { orderId },
                data: {
                    status: "AVAILABLE",
                    availableAt: new Date(),
                },
            });

            // Move from pending to available in wallet
            await tx.wallet.update({
                where: { userId: cashback.userId },
                data: {
                    pendingBalanceCents: { decrement: Math.floor(cashback.amountCents / 100) },
                    availableBalanceCents: { increment: Math.floor(cashback.amountCents / 100) },
                },
            });

            return cashback;
        });
    }

    /**
     * Reverse cashback - used for refunds or chargebacks
     * Removes cashback and adjusts wallet balances
     */
    static async reverseCashback(orderId: string, reason: string) {
        return await prisma.$transaction(async (tx: any) => {
            const cashback = await tx.cashbackTransaction.findUnique({
                where: { orderId },
            });

            if (!cashback) {
                throw new Error("Cashback transaction not found");
            }

            if (cashback.status === "REVERSED") {
                throw new Error("Cashback already reversed");
            }

            if (cashback.status === "PAID") {
                throw new Error("Cannot reverse paid cashback");
            }

            // Update cashback status to REVERSED
            await tx.cashbackTransaction.update({
                where: { orderId },
                data: {
                    status: "REVERSED",
                    reversedAt: new Date(),
                    notes: reason,
                },
            });

            // Deduct from wallet based on current status
            if (cashback.status === "PENDING") {
                await tx.wallet.update({
                    where: { userId: cashback.userId },
                    data: {
                        pendingBalanceCents: { decrement: Math.floor(cashback.amountCents / 100) },
                        totalEarnedCents: { decrement: Math.floor(cashback.amountCents / 100) },
                    },
                });
            } else if (cashback.status === "AVAILABLE") {
                await tx.wallet.update({
                    where: { userId: cashback.userId },
                    data: {
                        availableBalanceCents: { decrement: Math.floor(cashback.amountCents / 100) },
                        totalEarnedCents: { decrement: Math.floor(cashback.amountCents / 100) },
                    },
                });
            }

            return cashback;
        });
    }

    /**
     * Get cashback summary for a user
     */
    static async getUserCashbackSummary(userId: string) {
        const transactions = await prisma.cashbackTransaction.findMany({
            where: { userId },
            include: {
                order: {
                    select: {
                        id: true,
                        totalCents: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const summary = {
            total: 0,
            pending: 0,
            available: 0,
            paid: 0,
            reversed: 0,
            transactions: transactions.length,
        };

        transactions.forEach((t: any) => {
            summary.total += t.amountCents;
            if (t.status === "PENDING") summary.pending += t.amountCents;
            if (t.status === "AVAILABLE") summary.available += t.amountCents;
            if (t.status === "PAID") summary.paid += t.amountCents;
            if (t.status === "REVERSED") summary.reversed += t.amountCents;
        });

        return {
            summary,
            transactions,
        };
    }

    /**
     * Auto-approve cashback after X days (can be run as a cron job)
     */
    static async autoApprovePendingCashback(daysOld: number = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const pendingCashback = await prisma.cashbackTransaction.findMany({
            where: {
                status: "PENDING",
                createdAt: {
                    lte: cutoffDate,
                },
            },
        });

        const results = [];
        for (const cashback of pendingCashback) {
            try {
                await this.approveCashback(cashback.orderId);
                results.push({ orderId: cashback.orderId, success: true });
            } catch (error) {
                results.push({ orderId: cashback.orderId, success: false, error });
            }
        }

        return results;
    }
}
