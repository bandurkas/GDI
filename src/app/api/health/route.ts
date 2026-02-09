import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check endpoint for monitoring and load balancer
 * Returns 200 if healthy, 503 if unhealthy
 */
export async function GET() {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            services: {
                database: "connected",
                api: "operational"
            }
        }, { status: 200 });
    } catch (error) {
        console.error("Health check failed:", error);

        return NextResponse.json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            services: {
                database: "disconnected",
                api: "operational"
            },
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 503 });
    }
}
