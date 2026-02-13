
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CartService } from "@/services/cart.service";

export async function DELETE(
    request: Request,
    props: { params: Promise<{ productId: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const deleteAll = searchParams.get("all") === "true";
        await CartService.removeProduct(session.user.id, params.productId, deleteAll);
        return NextResponse.json({ message: "Item removed" });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
