import { formatCurrency, formatUSD } from '@/lib/utils';

describe('Utility Functions', () => {
    describe('formatCurrency (IDR)', () => {
        it('should format IDR units', () => {
            // Updated logic: Input is treated as IDR Units, not cents
            expect(formatCurrency(10000).replace(/\u00A0/g, ' ')).toContain('10.000');
            expect(formatCurrency(12345).replace(/\u00A0/g, ' ')).toContain('12.345');
        });

        it('should handle zero', () => {
            expect(formatCurrency(0)).toContain('0');
        });

        it('should handle large amounts', () => {
            const result1 = formatCurrency(1000000).replace(/\u00A0/g, ' ');
            expect(result1).toContain('1.000.000');
        });

        it('should handle negative amounts', () => {
            const result = formatCurrency(-10000).replace(/\u00A0/g, ' ');
            expect(result).toContain('-');
            expect(result).toContain('10.000');
        });
    });

    describe('formatUSD', () => {
        it('should format USD cents', () => {
            // Input is USD Cents
            expect(formatUSD(100)).toBe('$1.00');
            expect(formatUSD(10000)).toBe('$100.00');
        });

        it('should handle zero', () => {
            expect(formatUSD(0)).toBe('$0.00');
        });

        it('should handle large amounts', () => {
            expect(formatUSD(1000000)).toBe('$10,000.00');
        });
    });
});
