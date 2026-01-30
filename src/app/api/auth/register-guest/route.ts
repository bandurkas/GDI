
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.mustChangePassword) {
            return NextResponse.json({ error: "User already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { email },
            data: {
                passwordHash: hashedPassword,
                mustChangePassword: false,
            }
        });

        return NextResponse.json({ message: "Registration completed successfully" });
    } catch (error) {
        console.error("Guest registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
