
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWallet(email: string) {
    console.log(`Fixing wallet for ${email}...`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error("User not found");
        return;
    }

    // 1. Get Cashback Transactions
    const cashbackTxs = await prisma.cashbackTransaction.findMany({
        where: { userId: user.id }
    });

    let pendingCashbackCents = 0;
    let availableCashbackCents = 0;
    let paidCashbackCents = 0;
    let reversedCashbackCents = 0;

    for (const tx of cashbackTxs) {
        if (tx.status === 'PENDING') pendingCashbackCents += tx.amountCents;
        if (tx.status === 'AVAILABLE') availableCashbackCents += tx.amountCents;
        if (tx.status === 'PAID') paidCashbackCents += tx.amountCents;
        if (tx.status === 'REVERSED') reversedCashbackCents += tx.amountCents;
    }

    // 2. Get Payouts
    const payouts = await prisma.payout.findMany({
        where: { userId: user.id }
    });

    let requestedPayoutCents = 0;
    let processingPayoutCents = 0;
    let paidPayoutCents = 0;

    for (const p of payouts) {
        if (p.status === 'REQUESTED') requestedPayoutCents += p.amountCents;
        if (p.status === 'PROCESSING') processingPayoutCents += p.amountCents;
        if (p.status === 'PAID') paidPayoutCents += p.amountCents;
    }

    // 3. Calculate Correct Balances (converting to IDR / 100)
    const pendingCashbackIDR = Math.floor(pendingCashbackCents / 100);
    const availableCashbackIDR = Math.floor(availableCashbackCents / 100);
    const paidCashbackIDR = Math.floor(paidCashbackCents / 100);

    const activePayoutsIDR = Math.floor((requestedPayoutCents + processingPayoutCents) / 100);
    const paidPayoutsIDR = Math.floor(paidPayoutCents / 100);

    // ROBUST FORMULAS:

    // Total Earned = Net Valid Earnings (Pending + Available + Paid)
    const newTotalEarned = pendingCashbackIDR + availableCashbackIDR + paidCashbackIDR;

    // Total Paid Out = Actual Paid Payouts
    const newTotalPaidOut = paidPayoutsIDR;

    // Pending Balance = (Pending In-Flow) + (Pending Out-Flow)
    const newPendingBalance = pendingCashbackIDR + activePayoutsIDR;

    // Available Balance = Total Earned - Total Paid Out - Pending Balance
    // logic: (Everything I earned) - (Everything that left) - (Everything waiting to leave or waiting to enter)
    // Wait, Pending Balance (In-Flow part) should NOT be subtracted from Available if it was never added to Available.
    // Let's decompose:
    // Available = (Total Earned) - (Total Paid Out) - (Active Payouts) - (Pending Cashback)
    // 68,000 - 15,000 - 12,000 - 0 = 41,000.
    const newAvailableBalance = newTotalEarned - newTotalPaidOut - activePayoutsIDR - pendingCashbackIDR;

    console.log('\n--- CALCULATED WALLET STATE (IDR) ---');
    console.log(`Pending Balance: ${newPendingBalance}`);
    console.log(`Available Balance: ${newAvailableBalance}`);
    console.log(`Total Earned: ${newTotalEarned}`);
    console.log(`Total Paid Out: ${newTotalPaidOut}`);

    // Update
    await prisma.wallet.update({
        where: { userId: user.id },
        data: {
            pendingBalanceCents: newPendingBalance,
            availableBalanceCents: newAvailableBalance,
            totalEarnedCents: newTotalEarned,
            totalPaidOutCents: newTotalPaidOut
        }
    });

    console.log("\n✅ Wallet updated successfully!");
}

fixWallet('bandurkass@gmail.com')
    .catch(console.error)
    .finally(() => prisma.$disconnect());
