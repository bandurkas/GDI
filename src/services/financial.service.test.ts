import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FinancialService } from './financial.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findMany: vi.fn(),
            count: vi.fn(),
            aggregate: vi.fn(),
        },
        cashbackTransaction: {
            findMany: vi.fn(),
            aggregate: vi.fn(),
            count: vi.fn(),
        },
        wallet: {
            findUnique: vi.fn(),
        },
        payout: {
            findMany: vi.fn(),
            aggregate: vi.fn(),
        },
        user: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

describe('FinancialService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserFinancialMetrics', () => {
        it('should calculate metrics for a user correctly', async () => {
            (prisma.order.findMany as any).mockResolvedValue([{ totalCents: 1000 }, { totalCents: 2000 }]);
            (prisma.cashbackTransaction.findMany as any).mockResolvedValue([
                { amountCents: 500, status: 'AVAILABLE' },
                { amountCents: 200, status: 'PENDING' }
            ]);
            (prisma.wallet.findUnique as any).mockResolvedValue({
                availableBalanceCents: 300,
                pendingBalanceCents: 200,
                totalEarnedCents: 700,
                totalPaidOutCents: 400
            });
            (prisma.payout.findMany as any).mockResolvedValue([{ amountCents: 400 }]);

            const metrics = await FinancialService.getUserFinancialMetrics('user-1');

            expect(metrics).toEqual({
                totalSpent: 3000,
                cashbackEarned: 700,
                pendingCashback: 200,
                availableBalance: 300,
                pendingBalance: 200,
                totalEarned: 700,
                paidOut: 400
            });
        });
    });

    describe('getPlatformStatistics', () => {
        it('should return platform-wide stats', async () => {
            (prisma.user.count as any).mockResolvedValue(10);
            (prisma.order.count as any).mockResolvedValue(5);
            (prisma.order.aggregate as any).mockResolvedValue({ _sum: { totalCents: 50000 } });
            (prisma.cashbackTransaction.aggregate as any)
                .mockResolvedValueOnce({ _sum: { amountCents: 5000 } }) // paid/available
                .mockResolvedValueOnce({ _sum: { amountCents: 1000 } }); // pending
            (prisma.payout.aggregate as any).mockResolvedValue({ _sum: { amountCents: 2000 } });

            const stats = await FinancialService.getPlatformStatistics();

            expect(stats).toEqual({
                totalUsers: 10,
                totalOrders: 5,
                totalRevenue: 50000,
                totalCashbackPaid: 5000,
                totalCashbackPending: 1000,
                pendingPayouts: 2000
            });
        });
    });
});
