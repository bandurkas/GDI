/* eslint-disable @typescript-eslint/no-require-imports */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Searching for User with specific metrics ---");
    const targetCashback = 161710; // $1617.10
    const targetSpent = 220700;    // $2207.00
    const tolerance = 500; // +/- $5.00 tolerance just in case

    const users = await prisma.user.findMany({
        include: {
            wallet: true,
            orders: { where: { status: "COMPLETED" } },
            cashbackTransactions: true
        }
    });

    for (const user of users) {
        const spent = user.orders.reduce((sum, o) => sum + o.totalCents, 0);
        const available = user.wallet?.availableBalanceCents || 0;

        console.log(`User: ${user.email} | Spent: $${spent / 100} | Available: $${available / 100}`);

        if (Math.abs(available - targetCashback) < tolerance || Math.abs(spent - targetSpent) < tolerance) {
            console.log("\n!!! FOUND MATCH !!!");
            console.log(`User ID: ${user.id}`);
            console.log(`Cashback Setting: ${user.cashbackPercentage}%`);

            console.log("Orders & Rates:");
            user.cashbackTransactions.forEach(tx => {
                const order = user.orders.find(o => o.id === tx.orderId);
                const orderTotal = order ? order.totalCents : 0;
                const actualRate = orderTotal > 0 ? (tx.amountCents / orderTotal) * 100 : 0;
                console.log(`- Order: $${orderTotal / 100} -> Cashback: $${tx.amountCents / 100} (Rate in DB: ${tx.rate}, Calc: ${actualRate.toFixed(2)}%)`);
            });
            break;
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
