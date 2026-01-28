/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProofPayout66() {
    try {
        // Find the payout we created for $66.00
        const payout = await prisma.payout.findFirst({
            where: { amountCents: 6600 },
            orderBy: { requestedAt: 'desc' }
        });

        if (!payout) {
            console.log("FINAL PROOF 66: Payout NOT FOUND");
            return;
        }

        console.log(`FINAL PROOF 66 RESULT:`);
        console.log(`  ID: ${payout.id}`);
        console.log(`  Amount: $${(payout.amountCents / 100).toFixed(2)}`);
        console.log(`  Status: ${payout.status}`);
        console.log(`  Receipt: ${payout.receiptUrl}`);
        console.log(`  Notes (Comment): ${payout.notes}`); // Backend maps comment -> notes or keeps 'comment' if field exists. Service stored it in 'notes' in our refactor.

        if (payout.status === 'PAID' && payout.receiptUrl === 'https://modal-proof.com' && payout.notes && payout.notes.includes('Verified manually via Modal')) {
            console.log("SUCCESS: Payout is authentically PAID with COMMENT in Database.");
        } else {
            console.log("FAILURE: Payout state mismatch.");
            console.log(`Expected: PAID, https://modal-proof.com, Verified manually via Modal`);
            console.log(`Actual: ${payout.status}, ${payout.receiptUrl}, ${payout.notes}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyProofPayout66();
