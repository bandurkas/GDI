/* eslint-disable @typescript-eslint/no-require-imports */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = "test33@mail.com";
    console.log(`--- Checking Rate for: ${email} ---`);

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, cashbackPercentage: true }
    });

    if (!user) {
        console.error("User not found!");
        return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Current DB Cashback Percentage: ${user.cashbackPercentage}%`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
