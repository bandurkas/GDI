
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "test33@mail.com";
    console.log(`--- Debugging User: ${email} ---`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            wallet: true,
            orders: true,
            cashbackTransactions: true,
        },
    });

    if (!user) {
        console.error("User not found!");
        return;
    }

    console.log("User Profile:");
    console.log(`ID: ${user.id}`);
    console.log(`Cashback Percentage: ${user.cashbackPercentage} (Raw value in DB)`);

    console.log("\nWallet:");
    console.log(`Available: ${user.wallet?.availableBalanceCents}`);
    console.log(`Pending: ${user.wallet?.pendingBalanceCents}`);
    console.log(`Total Earned: ${user.wallet?.totalEarnedCents}`);

    console.log("\nOrders:");
    user.orders.forEach(o => {
        console.log(`- Order ${o.id}: $${o.totalCents / 100} (Status: ${o.status})`);
    });

    console.log("\nCashback Transactions:");
    user.cashbackTransactions.forEach(c => {
        console.log(`- Tx ${c.id}: $${c.amountCents / 100} (Rate: ${c.rate}, Status: ${c.status})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
