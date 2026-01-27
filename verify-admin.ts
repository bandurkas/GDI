
import { PrismaClient } from "@prisma/client";
import { FinancialService } from "./src/services/financial.service";
import { PayoutService } from "./src/services/payout.service";
import { UserService } from "./src/services/user.service";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Verifying Admin Console Enhancements ---");

    // 1. Verify Financial Daily Stats
    console.log("\n1. Testing FinancialService.getDailyStatistics()...");
    const dailyStats = await FinancialService.getDailyStatistics();
    console.log("Daily Stats Result:", JSON.stringify(dailyStats, null, 2));
    if (dailyStats.todayOrdersSum !== undefined) {
        console.log("✅ Daily Stats format correct.");
    } else {
        console.error("❌ Daily Stats missing fields.");
    }

    // 2. Verify Payouts Extended Data
    console.log("\n2. Testing PayoutService.getAllPayouts()...");
    const payouts = await PayoutService.getAllPayouts();
    if (payouts.length > 0) {
        const firstPayout = payouts[0] as any;
        console.log("First Payout Sample:", {
            id: firstPayout.id,
            user: firstPayout.user.email,
            dayOrdersSum: firstPayout.dayOrdersSum,
            requestedAt: firstPayout.requestedAt
        });
        if (firstPayout.dayOrdersSum !== undefined) {
            console.log("✅ Payout contains 'dayOrdersSum' field.");
        } else {
            console.error("❌ Payout missing 'dayOrdersSum'.");
        }
    } else {
        console.log("⚠️ No payouts found to verify structure. Creating a dummy payout...");
        // Setup dummy data if needed, or just rely on manual test
    }

    // 3. Verify User Cashback Update
    console.log("\n3. Testing UserService.updateCashbackPercentage()...");
    const email = "test33@mail.com";
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        console.log(`Current Percentage: ${user.cashbackPercentage}%`);
        const newPercentage = user.cashbackPercentage === 80 ? 85 : 80;
        console.log(`Updating to ${newPercentage}%...`);
        const updated = await UserService.updateCashbackPercentage(user.id, newPercentage);
        console.log(`Updated Percentage: ${updated.cashbackPercentage}%`);
        if (updated.cashbackPercentage === newPercentage) {
            console.log("✅ User cashback updated successfully.");
        } else {
            console.error("❌ Update failed.");
        }
    } else {
        console.log("⚠️ User test33 not found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
