/* eslint-disable @typescript-eslint/no-require-imports */

import { PrismaClient } from "@prisma/client";
import { CashbackService } from "./src/services/cashback.service";

const prisma = new PrismaClient();

async function main() {
    const email = "test33@mail.com";
    console.log(`--- Approving Cashback for User: ${email} ---`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            cashbackTransactions: {
                where: { status: "PENDING" }
            }
        },
    });

    if (!user) {
        console.error("User not found!");
        return;
    }

    if (user.cashbackTransactions.length === 0) {
        console.log("No pending cashback found.");
        return;
    }

    for (const tx of user.cashbackTransactions) {
        console.log(`Approving Tx: ${tx.id} (Order: ${tx.orderId}, Amount: ${tx.amountCents})`);
        await CashbackService.approveCashback(tx.orderId);
        console.log("Approved!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
