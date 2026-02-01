import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export class UserService {
    static async createUser(email: string, passwordRaw: string, role: Role = "USER") {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);

        return await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    role,
                },
            });

            // Initialize wallet
            await tx.wallet.create({
                data: {
                    userId: user.id,
                },
            });

            // Initialize empty cart
            await tx.cart.create({
                data: {
                    userId: user.id,
                },
            });

            return user;
        });
    }

    static async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    static async getAllUsersWithStats(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [total, users] = await prisma.$transaction([
            prisma.user.count(),
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            orders: {
                                where: { status: "COMPLETED" }
                            }
                        },
                    },
                    orders: {
                        where: { status: "COMPLETED" },
                        select: {
                            totalCents: true,
                            status: true,
                        },
                    },
                    wallet: true,
                    cashbackTransactions: {
                        select: { amountCents: true, status: true },
                    },
                    cashbackPercentage: true,
                },
            }),
        ]);

        // Calculate total spent for each user (only COMPLETED orders)
        // Calculate total spent for each user (only COMPLETED orders)
        const transformedUsers = users.map((user: any) => ({
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            _count: user._count,
            totalSpentCents: user.orders.reduce((sum: number, order: { totalCents: number }) => sum + order.totalCents, 0),
            totalEarnedCents: user.wallet?.totalEarnedCents || 0,
            availableBalanceCents: user.wallet?.availableBalanceCents || 0,
            cashbackPercentage: user.cashbackPercentage ?? 80.0,
        }));

        return { users: transformedUsers, total };
    }

    static async updateCashbackPercentage(userId: string, percentage: number) {
        return await prisma.user.update({
            where: { id: userId },
            data: { cashbackPercentage: percentage },
        });
    }

    static async updateProfile(userId: string, data: { name?: string, email?: string, usdtWallet?: string, telegram?: string }) {
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    static async findById(userId: string) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                usdtWallet: true,
                telegram: true,
                createdAt: true,
                cashbackPercentage: true,
            } as any
        });
    }

    static async requestPasswordReset(email: string) {
        console.log(`[UserService] Password reset requested for: ${email}`);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log(`[UserService] Reset requested for non-existent email: ${email}`);
            return { success: false, error: "Email not found" };
        }

        // In a real app, we would:
        // 1. Generate a secure token
        // 2. Save it to the DB with an expiry
        // 3. Send an email with a link like /auth/reset-password?token=XYZ

        console.log(`[UserService] Reset link would be sent to: ${email}`);
        return { success: true };
    }

    static async resetUserPassword(userId: string, newPassword: string) {
        const passwordHash = await bcrypt.hash(newPassword, 10);

        return await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });
    }

    static async deleteUser(userId: string) {
        return await prisma.$transaction(async (tx: any) => {
            // Delete associated data first
            await tx.wallet.deleteMany({ where: { userId } });
            await tx.cart.deleteMany({ where: { userId } });
            await tx.cashbackTransaction.deleteMany({ where: { userId } });
            await tx.orderItem.deleteMany({ where: { order: { userId } } });
            await tx.order.deleteMany({ where: { userId } });
            await tx.payout.deleteMany({ where: { userId } });

            return await tx.user.delete({
                where: { id: userId }
            });
        });
    }

    static async updateRole(userId: string, role: Role) {
        return await prisma.user.update({
            where: { id: userId },
            data: { role }
        });
    }
}
