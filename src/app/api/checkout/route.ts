import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { checkRateLimit, getClientIP } from "@/lib/ratelimit";
import { CheckoutSchema, formatZodError } from "@/lib/validation";
import { formatErrorResponse } from "@/lib/errors";
import { z } from "zod";

export async function POST(req: Request) {
    // Rate limiting check
    const ip = getClientIP(req.headers);
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again in a few seconds." },
            { status: 429 }
        );
    }

    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();

        // Validate input
        const validated = CheckoutSchema.parse(body);
        const { paymentMethod, guestEmail, guestName, items } = validated;

        if (session) {
            // Authenticated checkout
            const order = await OrderService.createOrder(session.user.id, paymentMethod || "MIDTRANS");
            return NextResponse.json(order);
        } else {
            // Guest checkout
            if (!guestEmail || !items || items.length === 0) {
                return NextResponse.json({ error: "Missing guest info or items" }, { status: 400 });
            }

            const order = await OrderService.createGuestOrder(guestEmail, guestName ?? null, items, paymentMethod || "MIDTRANS");
            return NextResponse.json(order);
        }
    } catch (error: any) {
        // Handle validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(formatZodError(error), { status: 400 });
        }

        console.error("Checkout error:", error);
        return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
    }
}
