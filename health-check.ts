
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🏥 Running VPS Health Check...");

    // 1. Check Environment
    const nodeEnv = process.env.NODE_ENV;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    console.log(`\n--- Environment ---`);
    console.log(`NODE_ENV: ${nodeEnv}`);
    console.log(`MIDTRANS_SERVER_KEY: ${serverKey ? "✅ Present (" + serverKey.substring(0, 5) + "***)" : "❌ MISSING"}`);
    console.log(`MIDTRANS_CLIENT_KEY: ${clientKey ? "✅ Present (" + clientKey.substring(0, 5) + "***)" : "❌ MISSING"}`);

    if (!serverKey || !clientKey) {
        console.error("❌ CRITICAL: Midtrans keys are missing!");
    }

    // 2. Check Database Connectivity
    console.log(`\n--- Database Connectivity ---`);
    try {
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count();
        const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
        const completedOrders = await prisma.order.count({ where: { status: "COMPLETED" } });

        console.log(`✅ DB Connection Successful!`);
        console.log(`Total Users: ${userCount}`);
        console.log(`Total Orders: ${orderCount}`);
        console.log(`  - Pending: ${pendingOrders}`);
        console.log(`  - Completed: ${completedOrders}`);

    } catch (error: any) {
        console.error("❌ DB Connection FAILED:", error.message);
    }

    // 3. Check Recent Activity (Last 24h)
    console.log(`\n--- Recent Activity (Last 24h) ---`);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newOrders = await prisma.order.count({
        where: { createdAt: { gte: oneDayAgo } }
    });
    console.log(`New Orders in last 24h: ${newOrders}`);

    console.log("\n✅ Health Check Complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
