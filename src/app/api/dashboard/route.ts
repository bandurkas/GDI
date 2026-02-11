import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderService } from "@/services/order.service";
import { ExchangeRateService } from "@/services/exchange-rate.service";

import { PayoutService } from "@/services/payout.service";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5"); // Default to 5 for dashboard card

    const payoutPage = parseInt(searchParams.get("payout_page") || "1");
    const payoutLimit = parseInt(searchParams.get("payout_limit") || "5");



    try {
        const userId = session.user.id;

        // Parallel fetching for performance
        const [wallet, ordersResult, payoutsResult, exchangeRate, user, aggOrders, aggPendingPayouts, aggPaidPayouts] = await Promise.all([
            prisma.wallet.findUnique({ where: { userId } }),
            OrderService.getUserOrders(userId, page, limit),
            PayoutService.getUserPayouts(userId, payoutPage, payoutLimit),
            ExchangeRateService.getRate(),
            prisma.user.findUnique({ where: { id: userId }, select: { cashbackPercentage: true } }),

            // Aggregations for Strict Accuracy
            prisma.order.aggregate({
                _sum: { totalCents: true },
                where: { userId, status: 'COMPLETED' }
            }),
            prisma.payout.aggregate({
                _sum: { amountCents: true },
                where: {
                    userId,
                    status: { in: ['REQUESTED', 'PROCESSING', 'APPROVED'] } // Pending Payouts
                }
            }),
            prisma.payout.aggregate({
                _sum: { amountCents: true },
                where: { userId, status: 'PAID' }
            })
        ]);

        const totalSalesIDR = aggOrders._sum.totalCents || 0;
        const pendingPayoutsUSD = aggPendingPayouts._sum.amountCents || 0;
        const totalPaidUSD = aggPaidPayouts._sum.amountCents || 0;

        // Calculated Available based on formula: Earned - Paid - Pending
        // Note: Wallet.totalEarnedCents is strict accumulation of commission
        const calculatedAvailable = (wallet?.totalEarnedCents || 0) - totalPaidUSD - pendingPayoutsUSD;

        return NextResponse.json({
            exchangeRate, // Number (e.g. 16000)
            cashbackPercentage: user?.cashbackPercentage ?? 80.0,
            wallet,
            calculatedStats: {
                totalSalesIDR,
                pendingPayoutsUSD,
                totalPaidUSD,
                calculatedAvailableUSD: calculatedAvailable
            },
            orders: ordersResult.orders,
            ordersMeta: {
                total: ordersResult.total,
                page,
                limit,
                totalPages: Math.ceil(ordersResult.total / limit),
            },
            payouts: payoutsResult.payouts,
            payoutsMeta: {
                total: payoutsResult.total,
                page: payoutPage,
                limit: payoutLimit,
                totalPages: Math.ceil(payoutsResult.total / payoutLimit),
            },
            totalBills: totalSalesIDR // Use aggregated value instead of page sum
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
