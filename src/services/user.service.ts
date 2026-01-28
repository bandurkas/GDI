import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export class UserService {
    static async createUser(email: string, passwordRaw: string, role: Role = "USER") {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);

        return await prisma.$transaction(async (tx) => {
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
        const transformedUsers = users.map(user => ({
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
}
