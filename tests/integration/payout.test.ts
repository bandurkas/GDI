import { PayoutService } from '@/services/payout.service';
import { prisma, cleanDatabase, createTestUser } from '../helpers/db';

describe('PayoutService - Financial Operations', () => {
    beforeEach(async () => {
        await cleanDatabase();
    });

    describe('requestPayout', () => {
        it('should create payout request with correct amount', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 }); // $1000

            // Act
            const payout = await PayoutService.requestPayout(user.id, 50000); // Request $500

            // Assert
            expect(payout).toBeDefined();
            expect(payout.amountCents).toBe(50000);
            expect(payout.status).toBe('REQUESTED');
            expect(payout.userId).toBe(user.id);
        });

        it('should deduct amount from available balance', async () => {
            // Arrange
            const { user, wallet } = await createTestUser({ walletBalance: 100000 });

            // Act
            await PayoutService.requestPayout(user.id, 50000);

            // Assert
            const updatedWallet = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });

            expect(updatedWallet?.availableBalanceCents).toBe(50000); // $1000 - $500 = $500
        });

        it('should reject payout if insufficient funds', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 10000 }); // $100

            // Act & Assert
            await expect(
                PayoutService.requestPayout(user.id, 50000) // Request $500
            ).rejects.toThrow(/insufficient/i);
        });

        it('should reject payout below minimum amount', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 });

            // Act & Assert
            await expect(
                PayoutService.requestPayout(user.id, 500) // $5 (below minimum)
            ).rejects.toThrow(/minimum/i);
        });

        it('should handle concurrent payout requests safely', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 }); // $1000

            // Act - Try to request two payouts simultaneously
            const promises = [
                PayoutService.requestPayout(user.id, 60000), // $600
                PayoutService.requestPayout(user.id, 60000), // $600
            ];

            // Assert - One should succeed, one should fail
            const results = await Promise.allSettled(promises);
            const succeeded = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            expect(succeeded).toBe(1);
            expect(failed).toBe(1);

            // Final balance should be $400 (only one $600 payout)
            const wallet = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });
            expect(wallet?.availableBalanceCents).toBe(40000);
        });

        it('should update totalPaidOutCents', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 });

            // Act
            await PayoutService.requestPayout(user.id, 50000);

            // Assert
            const wallet = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });

            expect(wallet?.totalPaidOutCents).toBe(50000);
        });

        it('should allow multiple payouts if balance sufficient', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 }); // $1000

            // Act
            await PayoutService.requestPayout(user.id, 30000); // $300
            await PayoutService.requestPayout(user.id, 20000); // $200

            // Assert
            const wallet = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });

            expect(wallet?.availableBalanceCents).toBe(50000); // $500 remaining
            expect(wallet?.totalPaidOutCents).toBe(50000); // $500 total paid out

            const payouts = await prisma.payout.findMany({
                where: { userId: user.id },
            });
            expect(payouts.length).toBe(2);
        });
    });

    describe('approvePayout', () => {
        it('should approve pending payout', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 });
            const payout = await PayoutService.requestPayout(user.id, 50000);

            // Act
            const approved = await PayoutService.approvePayout(payout.id);

            // Assert
            expect(approved.status).toBe('APPROVED');
            expect(approved.processedAt).toBeDefined();
        });

        it('should not allow approving already approved payout', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 });
            const payout = await PayoutService.requestPayout(user.id, 50000);
            await PayoutService.approvePayout(payout.id);

            // Act & Assert
            await expect(
                PayoutService.approvePayout(payout.id)
            ).rejects.toThrow(/already/i);
        });
    });

    describe('rejectPayout', () => {
        it('should reject payout and refund balance', async () => {
            // Arrange
            const { user } = await createTestUser({ walletBalance: 100000 });
            const payout = await PayoutService.requestPayout(user.id, 50000);

            const walletBefore = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });

            // Act
            await PayoutService.rejectPayout(payout.id);

            // Assert
            const rejected = await prisma.payout.findUnique({
                where: { id: payout.id },
            });
            expect(rejected?.status).toBe('REJECTED');

            const walletAfter = await prisma.wallet.findUnique({
                where: { userId: user.id },
            });

            // Balance should be refunded
            expect(walletAfter?.availableBalanceCents).toBe(100000); // Back to $1000
            expect(walletAfter?.totalPaidOutCents).toBe(0); // Reset
        });
    });
});
