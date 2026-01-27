import { prisma } from "@/lib/prisma";

export interface UserFinancialMetrics {
    totalSpent: number;
    cashbackEarned: number;
    pendingCashback: number;
    availableBalance: number;
    pendingBalance: number;
    totalEarned: number;
    paidOut: number;
}

export class FinancialService {
    /**
     * Get comprehensive financial metrics for a single user
     */
    static async getUserFinancialMetrics(userId: string): Promise<UserFinancialMetrics> {
        const [orders, cashback, wallet, payouts] = await Promise.all([
            prisma.order.findMany({
                where: { userId, status: "COMPLETED" },
                select: { totalCents: true },
            }),
            prisma.cashbackTransaction.findMany({
                where: { userId },
                select: { amountCents: true, status: true },
            }),
            prisma.wallet.findUnique({
                where: { userId },
            }),
            prisma.payout.findMany({
                where: { userId, status: "PAID" },
                select: { amountCents: true },
            }),
        ]);

        return {
            totalSpent: orders.reduce((sum, o) => sum + o.totalCents, 0),
            cashbackEarned: cashback.reduce((sum, c) => sum + c.amountCents, 0),
            pendingCashback: cashback
                .filter(c => c.status === "PENDING")
                .reduce((sum, c) => sum + c.amountCents, 0),
            availableBalance: wallet?.availableBalanceCents || 0,
            pendingBalance: wallet?.pendingBalanceCents || 0,
            totalEarned: wallet?.totalEarnedCents || 0,
            paidOut: wallet?.totalPaidOutCents || 0,
        };
    }

    /**
     * Get financial metrics for all users (for admin dashboard)
     */
    static async getAllUsersFinancialMetrics() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                orders: {
                    where: { status: "COMPLETED" },
                    select: { totalCents: true },
                },
                cashbackTransactions: {
                    select: { amountCents: true, status: true },
                },
                wallet: true,
            },
        });

        return users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            totalSpent: user.orders.reduce((sum, o) => sum + o.totalCents, 0),
            cashbackEarned: user.cashbackTransactions.reduce((sum, c) => sum + c.amountCents, 0),
            pendingCashback: user.cashbackTransactions
                .filter(c => c.status === "PENDING")
                .reduce((sum, c) => sum + c.amountCents, 0),
            availableBalance: user.wallet?.availableBalanceCents || 0,
            pendingBalance: user.wallet?.pendingBalanceCents || 0,
            paidOut: user.wallet?.totalPaidOutCents || 0,
        }));
    }

    /**
     * Get platform-wide financial statistics (for admin)
     */
    static async getPlatformStatistics() {
        const [
            totalUsers,
            totalOrders,
            totalRevenue,
            totalCashbackPaid,
            totalCashbackPending,
            pendingPayouts,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.order.count({ where: { status: "COMPLETED" } }),
            prisma.order.aggregate({
                where: { status: "COMPLETED" },
                _sum: { totalCents: true },
            }),
            prisma.cashbackTransaction.aggregate({
                where: { status: { in: ["PAID", "AVAILABLE"] } },
                _sum: { amountCents: true },
            }),
            prisma.cashbackTransaction.aggregate({
                where: { status: "PENDING" },
                _sum: { amountCents: true },
            }),
            prisma.payout.aggregate({
                where: { status: { in: ["REQUESTED", "APPROVED"] } },
                _sum: { amountCents: true },
            }),
        ]);

        return {
            totalUsers,
            totalOrders,
            totalRevenue: totalRevenue._sum.totalCents || 0,
            totalCashbackPaid: totalCashbackPaid._sum.amountCents || 0,
            totalCashbackPending: totalCashbackPending._sum.amountCents || 0,
            pendingPayouts: pendingPayouts._sum.amountCents || 0,
        };
    }

    /**
     * Get daily financial statistics (for admin dashboard "Today's" view)
     */
    static async getDailyStatistics() {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            ordersSum,
            cashbackRequested,
            cashbackPaid,
            pendingCashbackCount,
            totalCustomers,
            newCustomersToday,
            activeCustomersCount
        ] = await Promise.all([
            // Total orders sum today
            prisma.order.aggregate({
                where: { createdAt: { gte: startOfDay }, status: "COMPLETED" },
                _sum: { totalCents: true },
                _count: { totalCents: true },
            }),
            // Total cashback requested today (created today)
            prisma.cashbackTransaction.aggregate({
                where: { createdAt: { gte: startOfDay } },
                _sum: { amountCents: true },
            }),
            // Total cashback paid today (status changed to PAID today, or just Payouts paid today?)
            // Interpretation: "Total cashback paid today" usually refers to Payouts (withdrawals) processed.
            // OR it refers to Cashback becoming available? 
            // Given "Cashback requested -> Paid", "Paid" likely refers to Payouts.
            prisma.payout.aggregate({
                where: { updatedAt: { gte: startOfDay }, status: "PAID" },
                _sum: { amountCents: true },
            }),
            // Pending cashback requests count (Total pending currently, or created today?)
            // "Pending cashback requests count" - usually implies backlog size.
            prisma.cashbackTransaction.count({
                where: { status: "PENDING" },
            }),
            // Total customers count
            prisma.user.count(),
            // New customers today count
            prisma.user.count({
                where: { createdAt: { gte: startOfDay } },
            }),
            // Customers who made a purchase (ever) count
            prisma.user.count({
                where: { orders: { some: { status: "COMPLETED" } } },
            })
        ]);

        return {
            todayOrdersSum: ordersSum._sum.totalCents || 0,
            todayOrdersCount: ordersSum._count?.totalCents || 0,
            todayCashbackRequested: cashbackRequested._sum.amountCents || 0,
            todayCashbackPaid: cashbackPaid._sum.amountCents || 0,
            pendingCashbackCount: pendingCashbackCount,
            totalCustomers: totalCustomers,
            newCustomersToday: newCustomersToday,
            activeCustomersCount: activeCustomersCount,
        };
    }
}
