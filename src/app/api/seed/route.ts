import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const products = [
        {
            id: "start-ai",
            name: "Start AI Pack",
            description: "Essential automation for beginners.",
            priceCents: 8500000,
            active: true
        },
        {
            id: "middle-scale",
            name: "Middle Scale AI",
            description: "Secure, context-aware GenAI for teams.",
            priceCents: 17500000,
            active: true
        },
        {
            id: "automation-platform",
            name: "AI Automation Platform",
            description: "Turn raw data into strategic assets.",
            priceCents: 26000000,
            active: true
        },
        {
            id: "ent-assistant",
            name: "Enterprise AI Assistant",
            description: "Scalable cloud foundations for AI.",
            priceCents: 34000000,
            active: true
        }
    ];

    const results = [];

    for (const p of products) {
        const result = await prisma.product.upsert({
            where: { id: p.id },
            update: p,
            create: p,
        });
        results.push(result);
    }

    return NextResponse.json({ message: "Seeded", results });
}
