/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestPayout() {
    try {
        const payout = await prisma.payout.findFirst({
            orderBy: { requestedAt: 'desc' },
            include: { user: true }
        });

        if (!payout) {
            console.log("No payouts found.");
            return;
        }

        console.log("---------------------------------------------------");
        console.log(`LATEST PAYOUT: ${payout.id}`);
        console.log(`User: ${payout.user.email}`);
        console.log(`Amount: $${(payout.amountCents / 100).toFixed(2)}`);
        console.log(`STATUS: ${payout.status}`);
        console.log(`Receipt: ${payout.receiptUrl || 'None'}`);
        console.log("---------------------------------------------------");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkLatestPayout();
