import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PayoutService } from "@/services/payout.service";
import { checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { PayoutRequestSchema, formatZodError } from "@/lib/validation";
import { formatErrorResponse } from "@/lib/errors";
import { z } from "zod";

export async function POST(req: Request) {
    // Rate limiting check
    const ip = getClientIP(req.headers);
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many payout requests. Please slow down." },
            { status: 429 }
        );
    }

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        // Validate input
        const validated = PayoutRequestSchema.parse(body);
        const { amountCents } = validated;

        const payout = await PayoutService.requestPayout(session.user.id, amountCents);

        return NextResponse.json(payout);
    } catch (error: any) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(formatZodError(error), { status: 400 });
        }

        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 400 });
    }
}
