import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";
import { isOnlinePaymentEnabled } from "@/lib/bank";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json().catch(() => ({}));
        let paymentMethod = body?.paymentMethod || "BANK_TRANSFER";
        if (paymentMethod === "TEST" && process.env.NODE_ENV === "production") paymentMethod = "BANK_TRANSFER";
        if (paymentMethod === "MIDTRANS" && !isOnlinePaymentEnabled()) {
            return NextResponse.json({ error: "Online payment is not available. Please use bank transfer." }, { status: 400 });
        }
        const order = await OrderService.createOrder(session.user.id, paymentMethod);
        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
