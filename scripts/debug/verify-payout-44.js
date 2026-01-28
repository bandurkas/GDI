/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTestPayout() {
    try {
        const payouts = await prisma.payout.findMany({
            where: { amountCents: 4400 },
            orderBy: { requestedAt: 'desc' },
            take: 1
        });

        if (payouts.length === 0) {
            console.log("POST-TEST DB STATE: Payout $44.00 NOT FOUND");
            return;
        }

        const payout = payouts[0];
        console.log(`POST-TEST DB STATE: Payout ID: ${payout.id}`);
        console.log(`  Amount: $${(payout.amountCents / 100).toFixed(2)}`);
        console.log(`  Status: ${payout.status}`);
        console.log(`  Receipt: ${payout.receiptUrl ? payout.receiptUrl : "NONE"}`);
        console.log(`  Processed At: ${payout.processedAt}`);

        if (payout.status === 'PAID' && payout.receiptUrl) {
            console.log("RESULT: SUCCESS - Payout updated correctly.");
        } else {
            console.log("RESULT: FAILURE - Status mismatch.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyTestPayout();
