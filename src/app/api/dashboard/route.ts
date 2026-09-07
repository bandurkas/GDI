import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderService } from "@/services/order.service";

import { PayoutService } from "@/services/payout.service";
import { getBankDetails } from "@/lib/bank";

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
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        const { orders, total: ordersTotal } = await OrderService.getUserOrders(userId, page, limit);
        const { payouts, total: payoutsTotal } = await PayoutService.getUserPayouts(userId, payoutPage, payoutLimit);

        return NextResponse.json({
            wallet,
            bankDetails: getBankDetails(),
            orders,
            ordersMeta: {
                total: ordersTotal,
                page,
                limit,
                totalPages: Math.ceil(ordersTotal / limit),
            },
            payouts,
            payoutsMeta: {
                total: payoutsTotal,
                page: payoutPage,
                limit: payoutLimit,
                totalPages: Math.ceil(payoutsTotal / payoutLimit),
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
