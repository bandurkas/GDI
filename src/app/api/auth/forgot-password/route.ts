import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { checkRateLimit, getClientIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
    // Rate limiting check
    const ip = getClientIP(req.headers);
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many password reset requests. Please try again later." },
            { status: 429 }
        );
    }

    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const result = await UserService.requestPasswordReset(email);

        if (!result.success) {
            // We return 200 even if user not found for security (to prevent email enumeration)
            // But for this project, let's keep it simple as per implementation plan
            return NextResponse.json(
                { message: "If an account exists, a reset link has been sent." },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { message: "Reset link sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
