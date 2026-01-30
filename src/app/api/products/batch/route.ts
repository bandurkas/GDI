
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { productIds } = await req.json();

        if (!productIds || !Array.isArray(productIds)) {
            return NextResponse.json({ error: "Invalid product IDs" }, { status: 400 });
        }

        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds }
            }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Batch product fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
