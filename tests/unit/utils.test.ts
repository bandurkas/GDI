import { formatCurrency, formatUSD } from '@/lib/utils';

describe('Utility Functions', () => {
    describe('formatCurrency (IDR)', () => {
        it('should format cents to IDR', () => {
            expect(formatCurrency(10000)).toContain('100');
            expect(formatCurrency(12345)).toContain('123');
            expect(formatCurrency(99)).toContain('1');
        });

        it('should handle zero', () => {
            expect(formatCurrency(0)).toContain('0');
        });

        it('should handle large amounts', () => {
            const result1 = formatCurrency(1000000);
            expect(result1).toContain('10');

            const result2 = formatCurrency(123456789);
            expect(result2).toContain('1.234');
        });

        it('should handle negative amounts', () => {
            const result = formatCurrency(-10000);
            expect(result).toContain('-');
            expect(result).toContain('100');
        });

        it('should round to whole numbers', () => {
            expect(formatCurrency(10050)).toContain('101');
            expect(formatCurrency(10005)).toContain('100');
        });
    });

    describe('formatUSD', () => {
        it('should convert IDR cents to USD', () => {
            // 10000 cents = 100 IDR = $0.01 (at 16000 rate)
            expect(formatUSD(10000)).toBe('$0.01');

            // 1600000 cents = 16000 IDR = $1.00
            expect(formatUSD(1600000)).toBe('$1.00');
        });

        it('should handle zero', () => {
            expect(formatUSD(0)).toBe('$0.00');
        });

        it('should handle large amounts', () => {
            // 160000000 cents = 1,600,000 IDR = $100.00
            expect(formatUSD(160000000)).toBe('$100.00');
        });
    });
});
