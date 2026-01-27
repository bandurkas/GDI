import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PayoutService } from "@/services/payout.service";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { amountCents } = await req.json();

        if (!amountCents || typeof amountCents !== "number" || amountCents <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const payout = await PayoutService.requestPayout(session.user.id, amountCents);

        return NextResponse.json(payout);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
    }
}
