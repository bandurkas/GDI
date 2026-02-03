
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Mock DB
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            count: vi.fn(),
            findMany: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
        wallet: { create: vi.fn(), deleteMany: vi.fn() },
        cart: { create: vi.fn(), deleteMany: vi.fn() },
        cashbackTransaction: { deleteMany: vi.fn() },
        orderItem: { deleteMany: vi.fn() },
        order: { deleteMany: vi.fn() },
        payout: { deleteMany: vi.fn() },
    },
}));

// Mock Bcrypt
vi.mock('bcrypt', () => ({
    default: {
        hash: vi.fn().mockResolvedValue('hashed_password_123'),
        compare: vi.fn().mockResolvedValue(true),
    },
}));

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user with nested wallet and cart atomically', async () => {
            const email = 'test@example.com';
            const password = 'rawpassword';

            // Mock DB response
            const mockUser = { id: 'user-123', email, role: 'USER' };
            (prisma.user.create as any).mockResolvedValue(mockUser);

            const result = await UserService.createUser(email, password);

            // Assertions
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email,
                    passwordHash: 'hashed_password_123',
                    role: 'USER',
                    wallet: { create: {} },
                    cart: { create: {} },
                },
            });
            expect(result).toEqual(mockUser);
        });

        it('should propagate DB errors', async () => {
            (prisma.user.create as any).mockRejectedValue(new Error('DB Error'));
            await expect(UserService.createUser('fail@test.com', 'p')).rejects.toThrow('DB Error');
        });
    });

    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const mockUser = { id: '1', email: 'find@me.com' };
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            const result = await UserService.findByEmail('find@me.com');
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'find@me.com' }
            });
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);
            const result = await UserService.findByEmail('ghost@me.com');
            expect(result).toBeNull();
        });
    });

    describe('requestPasswordReset', () => {
        it('should return success if user exists', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ id: '1' });

            // Spy on console to avoid polluting output
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const result = await UserService.requestPasswordReset('extant@test.com');

            expect(result.success).toBe(true);
            consoleSpy.mockRestore();
        });

        it('should return error if user does not exist', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const result = await UserService.requestPasswordReset('nobody@test.com');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email not found');
            consoleSpy.mockRestore();
        });
    });
});
