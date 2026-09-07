import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/order.service";

// PATCH /api/admin/orders/[id]  { action: "confirm" | "cancel" }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    try {
        const { id } = await params;
        const { action } = await req.json();
        if (action === "confirm") {
            const order = await OrderService.completeOrder(id);
            return NextResponse.json(order);
        }
        if (action === "cancel") {
            const order = await OrderService.cancelOrder(id);
            return NextResponse.json(order);
        }
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("[API] Order update error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
