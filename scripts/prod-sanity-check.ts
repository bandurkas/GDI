
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Production Data Sanity Check...");

    // 1. Check Exchange Rate
    const rateSetting = await prisma.systemSetting.findUnique({ where: { key: "USD_TO_IDR" } });
    const rateValue = rateSetting ? parseFloat(rateSetting.value) : 0;

    // If rate is skewed (e.g. 1.6M or 0)
    if (rateValue > 100000 || rateValue < 1000) {
        console.warn(`⚠️  Suspicious Exchange Rate found: ${rateValue}. Resetting to 16,000...`);
        await prisma.systemSetting.upsert({
            where: { key: "USD_TO_IDR" },
            update: { value: "16000", updatedAt: new Date() },
            create: {
                key: "USD_TO_IDR",
                value: "16000",
                description: "Daily USD to IDR Exchange Rate (Auto-Reset)"
            }
        });
        console.log("✅ Exchange Rate reset to 16,000.");
    } else {
        console.log(`✅ Exchange Rate looks sane: ${rateValue}`);
    }

    // 2. Wallet Consistency Check (Example: Check for extremely low totals that might be missing the x100 factor)
    const wallets = await prisma.wallet.findMany();
    let fixedCount = 0;

    for (const wallet of wallets) {
        // If a wallet has totalEarned < 100 (less than $1) but has COMPLETED orders
        // This is a heuristic that might indicate missing x100 factor in legacy migration
        if (wallet.totalEarnedCents > 0 && wallet.totalEarnedCents < 1000) {
            const userOrders = await prisma.order.count({
                where: { userId: wallet.userId, status: 'COMPLETED' }
            });

            // If they have orders but their total earned is very small (e.g. 4.25 cents)
            if (userOrders > 0) {
                console.warn(`⚠️  Potential skewed wallet detected for user ${wallet.userId}. Total Earned: ${wallet.totalEarnedCents} cents.`);
                // We don't auto-fix this as it's destructive/dangerous without confirmation
                // but we report it.
            }
        }
    }

    console.log("🏁 Production sanity check complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
