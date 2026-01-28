/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProofPayout() {
    try {
        const payout = await prisma.payout.findUnique({
            where: { id: 'cmkvf1437000l9kwpjqyl0cl6' }
        });

        if (!payout) {
            console.log("FINAL PROOF: Payout NOT FOUND");
            return;
        }

        console.log(`FINAL PROOF RESULT:`);
        console.log(`  ID: ${payout.id}`);
        console.log(`  Amount: $${(payout.amountCents / 100).toFixed(2)}`);
        console.log(`  Status: ${payout.status}`);
        console.log(`  Receipt: ${payout.receiptUrl}`);
        console.log(`  ProcessedAt: ${payout.processedAt}`);

        if (payout.status === 'PAID') {
            console.log("SUCCESS: Payout is authentically PAID in Database.");
        } else {
            console.log("FAILURE: Payout status mismatch.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyProofPayout();
