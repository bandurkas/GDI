/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProofPayout() {
    try {
        const user = await prisma.user.findFirst({ where: { email: 'test22@mail.com' } });
        if (!user) throw new Error("User test22@mail.com not found");

        const payout = await prisma.payout.create({
            data: {
                userId: user.id,
                amountCents: 5500, // $55.00
                status: 'REQUESTED',
                method: 'bank_transfer'
            }
        });
        console.log(`PROOF START: Created Payout ID: ${payout.id}`);
        console.log(`PROOF START: Amount: $55.00`);
        console.log(`PROOF START: Status: ${payout.status}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createProofPayout();
