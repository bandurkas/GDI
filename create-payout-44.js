const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestPayout() {
    try {
        const user = await prisma.user.findFirst({ where: { email: 'test22@mail.com' } });
        if (!user) throw new Error("User test22@mail.com not found");

        const payout = await prisma.payout.create({
            data: {
                userId: user.id,
                amountCents: 4400, // $44.00
                status: 'REQUESTED',
                method: 'bank_transfer'
            }
        });
        console.log(`PRE-TEST DB STATE: Created Payout ID: ${payout.id}, Amount: $44.00, Status: ${payout.status}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

createTestPayout();
