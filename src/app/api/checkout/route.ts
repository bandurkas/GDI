import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { paymentMethod, guestEmail, guestName, items } = await req.json();

        if (session) {
            // Authenticated checkout
            const order = await OrderService.createOrder(session.user.id, paymentMethod || "MIDTRANS");
            return NextResponse.json(order);
        } else {
            // Guest checkout
            if (!guestEmail || !items || items.length === 0) {
                return NextResponse.json({ error: "Missing guest info or items" }, { status: 400 });
            }

            const order = await OrderService.createGuestOrder(guestEmail, guestName, items, paymentMethod || "MIDTRANS");
            return NextResponse.json(order);
        }
    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
    }
}
