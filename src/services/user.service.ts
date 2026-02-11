import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export class UserService {
    static async createUser(email: string, passwordRaw: string, role: Role = "USER") {
        const passwordHash = await bcrypt.hash(passwordRaw, 10);

        // Optimized: Atomic creation using nested writes
        // This is faster and ensures all related records are created or none at all
        return await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
                wallet: {
                    create: {} // Create empty wallet
                },
                cart: {
                    create: {} // Create empty cart
                }
            }
        });
    }

    static async findByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    static async getAllUsersWithStats(
        page: number = 1,
        limit: number = 10,
        search?: string,
        role?: string,
        sortBy: string = 'createdAt',
        sortDir: 'asc' | 'desc' = 'desc'
    ) {
        const skip = (page - 1) * limit;

        // Build Where Clause
        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (role && role !== 'ALL') {
            where.role = role as Role;
        }

        // Special handling for 'totalSpent' (Computed Field)
        if (sortBy === 'totalSpent') {
            // Fetch all matching users (lightweight select)
            const allUsers = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    wallet: true,
                    cashbackPercentage: true,
                },
            });

            // Fetch aggregates for all matching users
            const orderStats = await prisma.order.groupBy({
                by: ['userId'],
                where: {
                    userId: { in: allUsers.map(u => u.id) },
                    status: 'COMPLETED'
                },
                _sum: { totalCents: true },
                _count: true
            });

            // Merge and Map
            const mapped = allUsers.map(u => {
                const stats = orderStats.find(s => s.userId === u.id);
                return {
                    id: u.id,
                    email: u.email,
                    role: u.role,
                    createdAt: u.createdAt,
                    _count: { orders: stats?._count || 0 },
                    totalSpentCents: stats?._sum.totalCents || 0,
                    totalEarnedCents: u.wallet?.totalEarnedCents || 0,
                    totalPaidOutCents: u.wallet?.totalPaidOutCents || 0,
                    availableBalanceCents: u.wallet?.availableBalanceCents || 0,
                    cashbackPercentage: u.cashbackPercentage ?? 80.0,
                    wallet: u.wallet // Keep wallet for consistency if needed
                };
            });

            // Sort in memory
            mapped.sort((a, b) => {
                const valA = a.totalSpentCents;
                const valB = b.totalSpentCents;
                return sortDir === 'asc' ? valA - valB : valB - valA;
            });

            // Paginate
            const paginated = mapped.slice(skip, skip + limit);
            return { users: paginated, total: allUsers.length };
        }

        // Build OrderBy Clause for DB Sorting
        let orderBy: any[] = [];
        if (sortBy) {
            if (sortBy === 'email') orderBy.push({ email: sortDir });
            else if (sortBy === 'createdAt') orderBy.push({ createdAt: sortDir });
            else if (sortBy === 'role') orderBy.push({ role: sortDir });
            else if (sortBy === 'cashbackPercentage') orderBy.push({ cashbackPercentage: sortDir });
            else if (sortBy === 'balance') orderBy.push({ wallet: { availableBalanceCents: sortDir } });
            else if (sortBy === 'earned') orderBy.push({ wallet: { totalEarnedCents: sortDir } });
            else if (sortBy === 'paid') orderBy.push({ wallet: { totalPaidOutCents: sortDir } });
        }
        // Fallback or ensure createdAt is used if nothing else
        if (orderBy.length === 0) orderBy.push({ createdAt: 'desc' });

        // Always add ID as tie-breaker for stable sort
        orderBy.push({ id: 'asc' });

        // Get users with basic info and wallet
        const [total, users] = await prisma.$transaction([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    wallet: true,
                    cashbackPercentage: true,
                },
            }),
        ]);

        // Get order aggregates efficiently (single query)
        const orderStats = await prisma.order.groupBy({
            by: ['userId'],
            where: {
                userId: { in: users.map(u => u.id) },
                status: 'COMPLETED'
            },
            _sum: {
                totalCents: true
            },
            _count: true
        });

        // Map stats to users
        const transformedUsers = users.map((user: any) => {
            const stats = orderStats.find(s => s.userId === user.id);
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                _count: {
                    orders: stats?._count || 0
                },
                totalSpentCents: stats?._sum.totalCents || 0,
                totalEarnedCents: user.wallet?.totalEarnedCents || 0,
                totalPaidOutCents: user.wallet?.totalPaidOutCents || 0,
                availableBalanceCents: user.wallet?.availableBalanceCents || 0,
                cashbackPercentage: user.cashbackPercentage ?? 80.0,
            };
        });

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
