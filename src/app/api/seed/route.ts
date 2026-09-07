import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SERVICE_PACKAGES, PACKAGE_NAMES } from "@/lib/services/config";
import { servicesContent } from "@/lib/services/content";

// GET /api/seed — upserts the service packages as products (names/prices from src/lib/services/config.ts).
export async function GET() {
    const results = [];
    for (const p of SERVICE_PACKAGES) {
        const data = { id: p.id, name: PACKAGE_NAMES[p.id], description: servicesContent.en.packages[p.id].tagline, priceCents: p.priceIdr, active: true };
        results.push(await prisma.product.upsert({ where: { id: p.id }, update: data, create: data }));
    }
    return NextResponse.json({ message: "Seeded", results });
}
