import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PayoutService } from "@/services/payout.service";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    try {
        const { payouts, total } = await PayoutService.getAllPayouts(page, limit);
        return NextResponse.json({
            data: payouts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("[API] Admin payouts fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
