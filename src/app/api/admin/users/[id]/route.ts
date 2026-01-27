
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { cashbackPercentage } = body;

        if (typeof cashbackPercentage === "number") {
            const updatedUser = await UserService.updateCashbackPercentage(id, cashbackPercentage);
            return NextResponse.json(updatedUser);
        }

        return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}
