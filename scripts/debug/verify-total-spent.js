/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function verifyTotalSpent() {
    console.log("=== VERIFYING TOTAL SPENT CALCULATION ===\n");

    // Get all users with their orders
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            orders: {
                select: {
                    id: true,
                    totalCents: true,
                    status: true,
                    createdAt: true,
                },
            },
        },
    });

    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
        console.log(`\n📧 ${user.email} (${user.role})`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Total Orders: ${user.orders.length}`);

        if (user.orders.length === 0) {
            console.log(`   ✅ No orders - Total Spent: $0.00`);
            continue;
        }

        console.log(`\n   Orders:`);
        let totalAll = 0;
        let totalCompleted = 0;
        let completedCount = 0;

        user.orders.forEach((order, idx) => {
            const amount = order.totalCents / 100;
            console.log(`   ${idx + 1}. Order ${order.id.slice(0, 8)}...`);
            console.log(`      Amount: $${amount.toFixed(2)}`);
            console.log(`      Status: ${order.status}`);
            console.log(`      Date: ${order.createdAt.toISOString().split('T')[0]}`);

            totalAll += order.totalCents;
            if (order.status === "COMPLETED") {
                totalCompleted += order.totalCents;
                completedCount++;
            }
        });

        console.log(`\n   📊 Summary:`);
        console.log(`      All Orders: ${user.orders.length} orders = $${(totalAll / 100).toFixed(2)}`);
        console.log(`      COMPLETED Orders: ${completedCount} orders = $${(totalCompleted / 100).toFixed(2)}`);
        console.log(`      ✅ Total Spent (COMPLETED only): $${(totalCompleted / 100).toFixed(2)}`);
    }

    console.log("\n\n=== TESTING API RESPONSE ===\n");

    // Test the actual service method
    const { UserService } = require("./src/services/user.service");
    const usersWithStats = await UserService.getAllUsersWithStats();

    console.log("API Response:");
    usersWithStats.forEach(user => {
        console.log(`\n${user.email}:`);
        console.log(`  Orders Count: ${user._count.orders}`);
        console.log(`  Total Spent: $${(user.totalSpent / 100).toFixed(2)}`);
    });

    await prisma.$disconnect();
}

verifyTotalSpent().catch(console.error);
