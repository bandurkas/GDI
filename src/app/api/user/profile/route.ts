
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await UserService.findByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Return profile fields
        return NextResponse.json({
            name: (user as any).name,
            email: user.email,
            usdtWallet: (user as any).usdtWallet,
            telegram: (user as any).telegram,
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, usdtWallet, telegram } = body;

        // Basic validation
        if (email && !email.includes("@")) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (usdtWallet !== undefined) data.usdtWallet = usdtWallet;
        if (telegram !== undefined) data.telegram = telegram;

        const updatedUser = await UserService.updateProfile(session.user.id, data);

        return NextResponse.json({
            name: (updatedUser as any).name,
            email: updatedUser.email,
            usdtWallet: (updatedUser as any).usdtWallet,
            telegram: (updatedUser as any).telegram,
        });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
