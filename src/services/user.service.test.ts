import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            count: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findByEmail', () => {
        it('should return a user if found', async () => {
            const mockUser = { id: '1', email: 'test@example.com' };
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            const user = await UserService.findByEmail('test@example.com');
            expect(user).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });
    });

    describe('getAllUsersWithStats', () => {
        it('should return transformed users with stats', async () => {
            const mockUsers = [
                {
                    id: '1',
                    email: 'user1@example.com',
                    role: 'USER',
                    createdAt: new Date(),
                    orders: [{ totalCents: 1000 }, { totalCents: 2000 }],
                    wallet: { totalEarnedCents: 500, availableBalanceCents: 300 },
                    cashbackPercentage: 85,
                    _count: { orders: 2 }
                }
            ];

            (prisma.$transaction as any).mockResolvedValue([1, mockUsers]);

            const result = await UserService.getAllUsersWithStats(1, 10);

            expect(result.users).toHaveLength(1);
            expect(result.users[0]).toMatchObject({
                email: 'user1@example.com',
                totalSpentCents: 3000,
                totalEarnedCents: 500,
                availableBalanceCents: 300,
                cashbackPercentage: 85
            });
            expect(result.total).toBe(1);
        });

        it('should use default cashback percentage if none set', async () => {
            const mockUsers = [
                {
                    id: '2',
                    email: 'user2@example.com',
                    role: 'USER',
                    createdAt: new Date(),
                    orders: [],
                    wallet: null,
                    cashbackPercentage: null,
                    _count: { orders: 0 }
                }
            ];

            (prisma.$transaction as any).mockResolvedValue([1, mockUsers]);

            const result = await UserService.getAllUsersWithStats(1, 10);
            expect(result.users[0].cashbackPercentage).toBe(80.0);
        });
    });
});
