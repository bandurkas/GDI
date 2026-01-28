/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPayout() {
    try {
        const user = await prisma.user.findFirst({ where: { email: 'test22@mail.com' } });
        if (!user) throw new Error("User test22@mail.com not found");

        const payout = await prisma.payout.create({
            data: {
                userId: user.id,
                amountCents: 3300, // $33.00
                status: 'REQUESTED',
                method: 'bank_transfer'
            }
        });
        console.log(`Created Payout ID: ${payout.id}, Amount: $33.00`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createTestPayout();
