import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { paymentMethod } = await req.json(); // "TEST" or "MIDTRANS"
        const order = await OrderService.createOrder(session.user.id, paymentMethod);
        return NextResponse.json(order);
    } catch (error: unknown) {
        console.error("Checkout error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
