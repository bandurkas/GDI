import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { FinancialService } from "@/services/financial.service";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const url = new URL(req.url);
        if (url.searchParams.get("stats") === "daily") {
            const dailyStats = await FinancialService.getDailyStatistics();
            return NextResponse.json(dailyStats);
        }

        if (url.searchParams.get("stats") === "new_users") {
            const users = await FinancialService.getNewUsersDetails();
            return NextResponse.json(users, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
        }

        const metrics = await FinancialService.getAllUsersFinancialMetrics();
        return NextResponse.json(metrics);
    } catch (error) {
        console.error("Admin financial API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
