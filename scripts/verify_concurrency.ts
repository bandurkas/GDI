
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Replicating PayoutService.requestPayout logic exactly to test the pattern
async function requestPayoutSimulated(userId: string, amountCents: number) {
    return await prisma.$transaction(async (tx) => {
        // 1. Read
        const wallet = await tx.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) throw new Error("Wallet not found");

        const availableCents = wallet.availableBalanceCents;

        // 2. Check
        // Simulate slight delay to widen race window (DB latency)
        await new Promise(r => setTimeout(r, 50));

        if (availableCents < amountCents) {
            throw new Error(`Insufficient balance.`);
        }

        // 3. Write
        await tx.wallet.update({
            where: { userId },
            data: {
                pendingBalanceCents: { increment: amountCents },
                availableBalanceCents: { decrement: amountCents },
            },
        });
    });
}

async function main() {
    console.log("Starting Concurrency Verification (Race Condition Check)...");

    // 1. Setup User
    const email = `race_${Date.now()}@test.com`;
    // Clean up if exists (unlikely)
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: "hash",
            wallet: {
                create: {
                    availableBalanceCents: 10000, // $100.00
                    totalEarnedCents: 10000
                }
            }
        },
        include: { wallet: true }
    });

    console.log(`Created user ${user.id} with $100.00`);

    // 2. Launch 2 simultaneous requests for $100
    console.log("Launching 2 simultaneous requests for $100...");

    // Using the simulated function which uses the same Prisma Transaction pattern
    const p1 = requestPayoutSimulated(user.id, 10000);
    const p2 = requestPayoutSimulated(user.id, 10000);

    const results = await Promise.allSettled([p1, p2]);

    // 3. Analyze
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Success: ${successCount}, Failed: ${failCount}`);

    const finalWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    console.log(`Final Balance: ${finalWallet?.availableBalanceCents}`);

    if (finalWallet?.availableBalanceCents! < 0) {
        console.error("CRITICAL FAILURE: Race Condition Detected! Balance went negative.");
        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
        process.exit(1);
    } else if (successCount > 1) {
        console.error("FAILURE: Multiple payouts succeeded!");
        await prisma.user.delete({ where: { id: user.id } });
        process.exit(1);
    } else {
        console.log("PASSED: Transaction Isolation prevented Race Condition.");
        await prisma.user.delete({ where: { id: user.id } });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
