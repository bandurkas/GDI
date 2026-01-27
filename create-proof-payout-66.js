const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createProofPayout66() {
    try {
        const user = await prisma.user.findFirst({ where: { email: 'test22@mail.com' } });
        if (!user) throw new Error("User test22@mail.com not found");

        const payout = await prisma.payout.create({
            data: {
                userId: user.id,
                amountCents: 6600, // $66.00
                status: 'REQUESTED',
                method: 'bank_transfer'
            }
        });
        console.log(`PROOF 66 START: Created Payout ID: ${payout.id}`);
        console.log(`PROOF 66 START: Amount: $66.00`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createProofPayout66();
