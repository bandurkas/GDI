import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, role } = body;

        // Update role if provided
        if (role) {
            await UserService.updateRole(id, role);
        }

        // Update profile if name provided
        if (name) {
            await UserService.updateProfile(id, { name });
        }

        // Fetch updated user
        const updatedUser = await UserService.findById(id);

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Prevent deleting yourself
        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        await UserService.deleteUser(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
