import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from './payout.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        wallet: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        payout: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            count: vi.fn(),
            findMany: vi.fn(),
        },
        cashbackTransaction: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn((cb) => cb(prisma)),
    },
}));

describe('PayoutService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requestPayout', () => {
        it('should create a payout if balance is sufficient', async () => {
            (prisma.wallet.findUnique as any).mockResolvedValue({ availableBalanceCents: 20000 });
            (prisma.payout.create as any).mockResolvedValue({ id: 'payout-1', amountCents: 15000 });

            const payout = await PayoutService.requestPayout('user-1', 15000);

            expect(payout.id).toBe('payout-1');
            expect(prisma.wallet.update).toHaveBeenCalled();
        });

        it('should throw error if balance is insufficient', async () => {
            (prisma.wallet.findUnique as any).mockResolvedValue({ availableBalanceCents: 5000 });

            await expect(PayoutService.requestPayout('user-1', 10000))
                .rejects.toThrow(/Insufficient balance/);
        });

        it('should throw error if amount is below minimum', async () => {
            (prisma.wallet.findUnique as any).mockResolvedValue({ availableBalanceCents: 20000 });

            await expect(PayoutService.requestPayout('user-1', 5000))
                .rejects.toThrow('Minimum payout amount is Rp 10.000');
        });
    });
});
