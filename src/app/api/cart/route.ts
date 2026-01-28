import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartService } from "@/services/cart.service";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cart = await CartService.getCart(session.user.id);
    return NextResponse.json(cart);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { productId, quantity } = await req.json();
        const item = await CartService.addToCart(session.user.id, productId, quantity);
        return NextResponse.json(item);
    } catch (error) {
        console.error("[API] Cart post error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await CartService.clearCart(session.user.id);
    return NextResponse.json({ message: "Cart cleared" });
}
