import { prisma } from "@/lib/prisma";
import { formatCurrency, formatUSD } from "@/lib/utils";

export class PayoutService {
    /**
     * User requests a payout (withdrawal)
     */
    static async requestPayout(userId: string, amountCents: number, method?: string) {
        return await prisma.$transaction(async (tx: any) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (!wallet) {
                throw new Error("Wallet not found");
            }

            // Wallet stores USD Cents
            const availableCents = wallet.availableBalanceCents;

            if (availableCents < amountCents) {
                // Formatting as USD since wallet is USD
                throw new Error(`Insufficient balance. Available: ${formatUSD(availableCents)}, Requested: ${formatUSD(amountCents)}`);
            }

            if (amountCents < 1000) { // Minimum USD 10.00 (1000 Cents)
                throw new Error("Minimum payout amount is $10.00");
            }

            // Create payout request
            const payout = await tx.payout.create({
                data: {
                    userId,
                    amountCents,
                    status: "REQUESTED",
                    method: method || "bank_transfer",
                },
            });

            // Reserve the amount (deduct from available balance)
            // Atomic Update with Balance Check (Prevents Race Condition)
            const walletUpdate = await tx.wallet.updateMany({
                where: {
                    userId,
                    availableBalanceCents: { gte: amountCents }
                },
                data: {
                    pendingBalanceCents: { increment: amountCents },
                    availableBalanceCents: { decrement: amountCents },
                },
            });

            if (walletUpdate.count === 0) {
                // Fetch fresh wallet to show accurate error
                const currentWallet = await tx.wallet.findUnique({ where: { userId } });
                throw new Error(`Insufficient balance. Available: ${formatUSD(currentWallet?.availableBalanceCents || 0)}`);
            }

            return payout;
        });
    }

    /**
     * Update payout status (Generic)
     * Handles transitions and side effects
     */
    static async updatePayoutStatus(payoutId: string, status: string, details?: { reason?: string, receiptUrl?: string }) {
        // Enforce valid transitions
        const payout = await prisma.payout.findUnique({ where: { id: payoutId } });
        if (!payout) throw new Error("Payout not found");

        if (status === "PROCESSING") {
            if (payout.status !== "REQUESTED") {
                throw new Error(`Can only move to PROCESSING from REQUESTED. Current: ${payout.status}`);
            }
            return await prisma.payout.update({
                where: { id: payoutId },
                data: {
                    status: "PROCESSING",
                    notes: details?.reason,
                }
            });
        }

        if (status === "PAID") {
            // Allow paying from REQUESTED, PROCESSING, or APPROVED
            if (!["REQUESTED", "PROCESSING", "APPROVED"].includes(payout.status)) {
                throw new Error(`Cannot move to PAID from ${payout.status}`);
            }
            if (!details?.receiptUrl) {
                throw new Error("Receipt URL is required when marking as PAID");
            }
            // If strictly needing intermediate step, we can skip it, or implicit processing
            return await this.processPayout(payoutId, details.receiptUrl, details.reason);
        }

        if (status === "REFUSED" || status === "REJECTED") {
            if (payout.status === "PAID") {
                throw new Error("Cannot refuse a PAID payout");
            }
            if (!details?.reason) {
                throw new Error("Reason is required when REFUSING/REJECTING");
            }
            return await this.rejectPayout(payoutId, details.reason);
        }

        throw new Error(`Invalid status transition to ${status}`);
    }

    /**
     * Reject a payout request
     * Returns the amount back to available balance
     */
    static async rejectPayout(payoutId: string, reason: string) {
        return await prisma.$transaction(async (tx: any) => {
            const payout = await tx.payout.findUnique({
                where: { id: payoutId },
            });

            if (!payout) {
                throw new Error("Payout not found");
            }

            // Allow rejecting from REQUESTED, APPROVED, or PROCESSING
            if (!["REQUESTED", "APPROVED", "PROCESSING"].includes(payout.status)) {
                throw new Error(`Cannot reject payout with status ${payout.status}`);
            }

            // Update payout status
            await tx.payout.update({
                where: { id: payoutId },
                data: {
                    status: "REFUSED", // Using REFUSED per requirement
                    processedAt: new Date(),
                    notes: reason,
                },
            });

            // Return amount to available balance
            await tx.wallet.update({
                where: { userId: payout.userId },
                data: {
                    pendingBalanceCents: { decrement: payout.amountCents },
                    availableBalanceCents: { increment: payout.amountCents },
                },
            });

            return payout;
        });
    }

    /**
     * Approving is just specific update
     */
    static async approvePayout(payoutId: string, adminNotes?: string) {
        return this.updatePayoutStatus(payoutId, "PROCESSING", { reason: adminNotes });
    }

    /**
     * Process an approved payout (mark as paid)
     * This is called after the actual payment has been made
     */
    static async processPayout(payoutId: string, receiptUrl: string, notes?: string) {
        return await prisma.$transaction(async (tx: any) => {
            const payout = await tx.payout.findUnique({
                where: { id: payoutId },
            });

            if (!payout) {
                throw new Error("Payout not found");
            }

            // Allow paying from REQUESTED, PROCESSING or APPROVED
            if (!["REQUESTED", "PROCESSING", "APPROVED"].includes(payout.status)) {
                throw new Error(`Payout must be PROCESSING or APPROVED before processing. Current status: ${payout.status}`);
            }

            // Mark payout as paid
            await tx.payout.update({
                where: { id: payoutId },
                data: {
                    status: "PAID",
                    processedAt: new Date(),
                    receiptUrl,
                    notes: notes, // Save the comment/notes
                },
            });

            // Update wallet - remove from pending, add to total paid out
            await tx.wallet.update({
                where: { userId: payout.userId },
                data: {
                    pendingBalanceCents: { decrement: payout.amountCents },
                    totalPaidOutCents: { increment: payout.amountCents },
                },
            });

            // Mark related cashback transactions as PAID
            // (Find AVAILABLE cashback up to the payout amount)
            const availableCashback = await tx.cashbackTransaction.findMany({
                where: {
                    userId: payout.userId,
                    status: "AVAILABLE",
                },
                orderBy: { createdAt: "asc" },
            });

            let remaining = payout.amountCents;
            for (const cashback of availableCashback) {
                if (remaining <= 0) break;

                await tx.cashbackTransaction.update({
                    where: { id: cashback.id },
                    data: {
                        status: "PAID",
                        paidAt: new Date(),
                    },
                });

                remaining -= cashback.amountCents;
            }

            return payout;
        });
    }

    /**
     * Get all payouts for a user
     */
    static async getUserPayouts(userId: string, page: number = 1, limit: number = 5) {
        const skip = (page - 1) * limit;
        const [total, payouts] = await prisma.$transaction([
            prisma.payout.count({ where: { userId } }),
            prisma.payout.findMany({
                where: { userId },
                orderBy: { requestedAt: "desc" },
                skip,
                take: limit,
            })
        ]);
        return { payouts, total };
    }

    /**
     * Get all payouts (for admin)
     */
    static async getAllPayouts(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [total, payouts] = await prisma.$transaction([
            prisma.payout.count(),
            prisma.payout.findMany({
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                            role: true,
                            orders: {
                                where: { status: "COMPLETED" },
                                select: {
                                    totalCents: true,
                                    createdAt: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { requestedAt: "desc" },
            }),
        ]);

        // Transform to include calculated daily orders sum (orders on the requested day)
        const transformedPayouts = payouts.map((p: any) => {
            const requestDay = new Date(p.requestedAt);
            requestDay.setHours(0, 0, 0, 0);
            const nextDay = new Date(requestDay);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayOrdersSum = p.user.orders
                .filter((o: any) => {
                    const d = new Date(o.createdAt);
                    return d >= requestDay && d < nextDay;
                })
                .reduce((sum: number, o: any) => sum + o.totalCents, 0);

            return {
                ...p,
                user: {
                    email: p.user.email,
                    role: p.user.role,
                },
                dayOrdersSum,
            };
        });

        return { payouts: transformedPayouts, total };
    }
}
