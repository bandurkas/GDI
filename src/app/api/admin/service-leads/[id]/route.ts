import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUSES = ["NEW", "CONTACTED", "QUOTED", "WON", "LOST"] as const;

// PATCH /api/admin/service-leads/[id]  { status }
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    const { id } = await params;
    const { status } = await req.json();
    if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const lead = await prisma.serviceLead.update({ where: { id }, data: { status } });
    return NextResponse.json(lead);
}
