
describe('Dashboard Logic Verification', () => {
    // Constants
    const EXCHANGE_RATE = 16000;
    const COMMISSION_RATE = 80; // 80%

    // Mock Data
    const mockOrders = [
        { id: '1', totalCents: 5_000_000, status: 'COMPLETED' }, // 5M IDR
        { id: '2', totalCents: 3_500_000, status: 'COMPLETED' }, // 3.5M IDR
        { id: '3', totalCents: 1_000_000, status: 'FAILED' }     // Should be ignored
    ];

    const mockPayouts = [
        { id: 'p1', amountCents: 10000, status: 'PAID' },        // $100
        { id: 'p2', amountCents: 5000, status: 'REQUESTED' },    // $50
        { id: 'p3', amountCents: 5000, status: 'PROCESSING' },   // $50
        { id: 'p4', amountCents: 2000, status: 'REFUSED' },      // $20 (Ignored / Returned)
        { id: 'p5', amountCents: 1000, status: 'CANCELLED' }     // $10 (Ignored)
    ];

    // Source of Truth for Earnings (Simulating Wallet State)
    // 8.5M IDR Sales -> ~531.25 USD -> 80% -> 425 USD -> 42500 Cents
    const mockWallet = {
        totalEarnedCents: 42500
    };

    test('1. Total Sales Calculation (IDR)', () => {
        // Logic: SUM(totalCents) WHERE status = 'COMPLETED'
        const totalSalesIDR = mockOrders
            .filter(o => o.status === 'COMPLETED')
            .reduce((sum, o) => sum + o.totalCents, 0);

        expect(totalSalesIDR).toBe(8_500_000); // 5M + 3.5M
    });

    test('2. Payout Aggregation (USD)', () => {
        // Logic: Total Paid = SUM(amountCents) WHERE status = 'PAID'
        const totalPaidUSD = mockPayouts
            .filter(p => p.status === 'PAID')
            .reduce((sum, p) => sum + p.amountCents, 0);

        expect(totalPaidUSD).toBe(10000); // $100

        // Logic: Pending = SUM(amountCents) WHERE status IN ['REQUESTED', 'PROCESSING', 'APPROVED']
        const pendingPayoutsUSD = mockPayouts
            .filter(p => ['REQUESTED', 'PROCESSING', 'APPROVED'].includes(p.status))
            .reduce((sum, p) => sum + p.amountCents, 0);

        // $50 + $50 = $100
        expect(pendingPayoutsUSD).toBe(10000);
    });

    test('3. Available Commission Formula', () => {
        const totalEarned = mockWallet.totalEarnedCents; // 42500
        const totalPaid = 10000;
        const pending = 10000;

        // Formula: Earned - Paid - Pending
        const available = totalEarned - totalPaid - pending;

        // 42500 - 10000 - 10000 = 22500 ($225)
        expect(available).toBe(22500);
    });

    test('4. Order of Operations for Strict Logic', () => {
        // Verify that we do NOT include FAILED orders in Sales
        const allOrdersSum = mockOrders.reduce((sum, o) => sum + o.totalCents, 0);
        expect(allOrdersSum).not.toBe(8_500_000); // It would be 9.5M

        const correctSales = mockOrders
            .filter(o => o.status === 'COMPLETED')
            .reduce((sum, o) => sum + o.totalCents, 0);
        expect(correctSales).toBe(8_500_000);

        // Verify that REFUSED payouts are excluded from Pending/Paid
        const refusedAmount = mockPayouts.find(p => p.status === 'REFUSED')?.amountCents || 0;
        expect(refusedAmount).toBe(2000);

        // Ensure it's not in pending sum
        const pendingSum = mockPayouts
            .filter(p => ['REQUESTED', 'PROCESSING', 'APPROVED'].includes(p.status))
            .reduce((sum, p) => sum + p.amountCents, 0);

        expect(pendingSum).toBe(10000); // Still 10000
    });
});
