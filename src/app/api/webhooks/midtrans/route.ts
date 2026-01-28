
import { NextResponse } from "next/server";
import { OrderService } from "@/services/order.service";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            order_id,
            status_code,
            gross_amount,
            signature_key,
            transaction_status,
            fraud_status
        } = body;

        // 1. Verify Signature
        // Signature = SHA512(order_id + status_code + gross_amount + server_key)
        const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
        const hash = crypto.createHash("sha512")
            .update(order_id + status_code + gross_amount + serverKey)
            .digest("hex");

        if (hash !== signature_key) {
            console.error("Invalid Midtrans Signature");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Handle Transaction Status
        console.log(`Midtrans Webhook: Order ${order_id}, Status: ${transaction_status}`);

        if (transaction_status === "capture" || transaction_status === "settlement") {
            if (fraud_status === "challenge") {
                // TODO: Handle challenge
            } else {
                await OrderService.completeOrder(order_id);
            }
        } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
            // Update order to FAILED
            // await OrderService.failOrder(order_id); // Not implemented yet but could be
        } else if (transaction_status === "pending") {
            // Still pending, do nothing
        }

        return NextResponse.json({ status: "OK" });
    } catch (error: unknown) {
        console.error("Webhook Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
