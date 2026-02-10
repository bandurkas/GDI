
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixWallet(email: string) {
    console.log(`Fixing wallet for ${email}...`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error("User not found");
        return;
    }

    console.log(`User ID: ${user.id}`);

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

    console.log('Cashback Summary (Cents):');
    console.log(`- Pending: ${pendingCashbackCents}`);
    console.log(`- Available: ${availableCashbackCents}`);
    console.log(`- Paid: ${paidCashbackCents}`);
    console.log(`- Reversed: ${reversedCashbackCents}`);

    // 2. Get Payouts
    const payouts = await prisma.payout.findMany({
        where: { userId: user.id }
    });

    let requestedPayoutCents = 0;
    let processingPayoutCents = 0;
    let paidPayoutCents = 0;
    let refusedPayoutCents = 0;

    for (const p of payouts) {
        if (p.status === 'REQUESTED') requestedPayoutCents += p.amountCents;
        if (p.status === 'PROCESSING') processingPayoutCents += p.amountCents;
        if (p.status === 'PAID') paidPayoutCents += p.amountCents;
        if (p.status === 'REFUSED' || p.status === 'REJECTED') refusedPayoutCents += p.amountCents;
    }

    console.log('Payouts Summary (Cents):');
    console.log(`- Requested: ${requestedPayoutCents}`);
    console.log(`- Processing: ${processingPayoutCents}`);
    console.log(`- Paid: ${paidPayoutCents}`);
    console.log(`- Refused: ${refusedPayoutCents}`);

    // 3. Calculate Correct Balances (converting to IDR / 100)
    // Wallet stores IDR
    const pendingCashbackIDR = Math.floor(pendingCashbackCents / 100);
    const availableCashbackIDR = Math.floor(availableCashbackCents / 100);
    const paidCashbackIDR = Math.floor(paidCashbackCents / 100);

    // Active Payouts (Requested + Processing) are held in Pending Balance
    // Payouts are stored as CENTS. Divided by 100 for IDR wallet ops.
    const activePayoutsIDR = Math.floor((requestedPayoutCents + processingPayoutCents) / 100);
    const paidPayoutsIDR = Math.floor(paidPayoutCents / 100);

    // New Balances Logic:
    // Pending Balance = (Pending Cashback) + (Active Payouts)
    // NOTE: If Payouts logic previously multiplied by 100, then pending balance might be huge.
    // We are resetting based on actual transaction status.
    const newPendingBalance = pendingCashbackIDR + activePayoutsIDR;

    // Available Balance = (Available Cashback Transactions) - (Active Payouts reserved from it)
    // Money is "reserved" in Pending when payout is requested.
    // So Available Balance should be whatever cashback is available minus requested payouts.
    // But wait, if cashback is AVAILABLE status, does it mean it's NOT yet used for payout?
    // Payout Service marks cashback as PAID only when Payout is PAID.
    // So requested payouts ARE still marked as AVAILABLE cashback.
    // So we subtract ActivePayouts from AvailableCashback.
    const newAvailableBalance = availableCashbackIDR - activePayoutsIDR;

    // Total Earned
    const newTotalEarned = pendingCashbackIDR + availableCashbackIDR + paidCashbackIDR;

    const newTotalPaidOut = paidPayoutsIDR;

    console.log('\n--- CALCULATED WALLET STATE (IDR) ---');
    console.log(`Pending Balance: ${newPendingBalance}`);
    console.log(`Available Balance: ${newAvailableBalance}`);
    console.log(`Total Earned: ${newTotalEarned}`);
    console.log(`Total Paid Out: ${newTotalPaidOut}`);

    // Validate calculations
    if (newAvailableBalance < 0) {
        console.error("WARNING: Calculated available balance is NEGATIVE!");
    }

    // 4. Update Wallet
    const currentWallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    console.log('\n--- CURRENT WALLET STATE (IDR) ---');
    if (currentWallet) {
        console.log(`Pending Balance: ${currentWallet.pendingBalanceCents}`);
        console.log(`Available Balance: ${currentWallet.availableBalanceCents}`);
        console.log(`Total Earned: ${currentWallet.totalEarnedCents}`);
        console.log(`Total Paid Out: ${currentWallet.totalPaidOutCents}`);
    } else {
        console.log("No wallet found.");
    }

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
    .catch(ex => {
        console.error(ex);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
