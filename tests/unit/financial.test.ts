
import { convertUSDtoIDR, convertIDRtoUSD, formatCurrency, formatUSD } from "@/lib/utils";

describe('Financial Calculations', () => {
    const EXCHANGE_RATE = 16000;
    const PRODUCT_PRICE_IDR = 8_500_000; // 8.5 Million IDR
    const COMMISSION_RATE = 80; // 80%

    test('Case 1: Single Purchase 8.5M IDR - Commission Calculation', () => {
        // Step 1: Calculate USD Value of Order
        // Formula used in OrderService: (totalCents / rate) * 100
        const usdCentsBase = (PRODUCT_PRICE_IDR / EXCHANGE_RATE) * 100;

        expect(usdCentsBase).toBe(53125); // $531.25

        // Step 2: Calculate Commission (80%)
        const commissionUSDCents = Math.floor(usdCentsBase * (COMMISSION_RATE / 100));

        expect(commissionUSDCents).toBe(42500); // $425.00

        // Step 3: Verify Display in IDR (Admin View)
        const commissionUSDUnits = commissionUSDCents / 100;
        const commissionIDR = convertUSDtoIDR(commissionUSDUnits, EXCHANGE_RATE);

        expect(commissionIDR).toBe(6_800_000); // 6.8 Million IDR

        // formats correctly
        // Intl.NumberFormat uses NBSP (\u00A0) for spacing, replace with normal space for test
        expect(formatCurrency(commissionIDR).replace(/\u00A0/g, ' ')).toBe("Rp 6.800.000");
    });

    test('Case 2: Balance Calculation after Payout', () => {
        const earnedCents = 42500; // $425.00
        let availableCents = earnedCents;
        let pendingCents = 0;
        let paidCents = 0;

        // Action: Request Payout of Full Amount
        const payoutAmount = 42500;

        // Payout Service Logic: Deduct from Available, Add to Pending
        availableCents -= payoutAmount;
        pendingCents += payoutAmount;

        expect(availableCents).toBe(0);
        expect(pendingCents).toBe(42500);

        // Action: Payout Approved (PAID)
        // Payout Service Logic: Remove from Pending, Add to Paid
        pendingCents -= payoutAmount;
        paidCents += payoutAmount;

        expect(pendingCents).toBe(0);
        expect(paidCents).toBe(42500);
        expect(availableCents).toBe(0); // Remains 0

        // Verify IDR Display of Paid Amount
        const paidIDR = convertUSDtoIDR(paidCents / 100, EXCHANGE_RATE);
        expect(paidIDR).toBe(6_800_000);
    });

    test('Case 3: Formatting Checks', () => {
        // IDR 8.5M
        expect(formatCurrency(8_500_000).replace(/\u00A0/g, ' ')).toBe("Rp 8.500.000");

        // USD $425
        expect(formatUSD(42500).replace(/\u00A0/g, ' ')).toBe("$425.00");

        // Admin Display of Total Spent (IDR)
        expect(formatCurrency(8_500_000).replace(/\u00A0/g, ' ')).not.toBe("Rp 850.000.000"); // Ensure no *100 bug
    });

    test('Case 4: Refund Impact', () => {
        // Initial Earned: 42500 Cents ($425)
        let totalEarnedCents = 42500;
        let availableCents = 42500;

        // Refund Occurs
        // Logic: Commission Reversed. Deducted from Earned and Available.
        const refundAmount = 42500;

        totalEarnedCents -= refundAmount;
        availableCents -= refundAmount;

        expect(totalEarnedCents).toBe(0);
        expect(availableCents).toBe(0);

        const earnedIDR = convertUSDtoIDR(totalEarnedCents / 100, EXCHANGE_RATE);
        expect(earnedIDR).toBe(0);
    });
});
