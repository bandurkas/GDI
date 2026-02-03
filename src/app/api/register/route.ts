import { NextResponse } from "next/server";
import { UserService } from "@/services/user.service";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENT_MSG_EN } from "@/lib/constants";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Password Complexity (Must match frontend regex)
        if (!PASSWORD_REGEX.test(password)) {
            return NextResponse.json(
                { error: PASSWORD_REQUIREMENT_MSG_EN },
                { status: 400 }
            );
        }

        // Optimistic creation: Try to create directly. 
        // If it fails due to duplicate email, the DB will throw a P2002 error.
        try {
            const user = await UserService.createUser(email, password);

            return NextResponse.json(
                { message: "User created successfully", userId: user.id },
                { status: 201 }
            );
        } catch (dbError: any) {
            // Handle Prisma unique constraint violation (P2002)
            if (dbError.code === 'P2002') {
                return NextResponse.json(
                    { error: "User already exists" },
                    { status: 400 }
                );
            }
            // Re-throw other errors to be caught by the outer catch
            throw dbError;
        }
    } catch (error: any) {
        // Structured logging for observability
        console.error(JSON.stringify({
            level: "error",
            event: "registration_failed",
            message: error.message,
            stack: error.stack
        }));

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
