import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
    it('should format cents to IDR correctly', () => {
        // Intl.NumberFormat often uses non-breaking space (u00A0)
        expect(formatCurrency(100000).replace(/\u00A0/g, ' ')).toBe('Rp 1.000');
    });

    it('should handle zero correctly', () => {
        expect(formatCurrency(0).replace(/\u00A0/g, ' ')).toBe('Rp 0');
    });

    it('should handle large amounts', () => {
        expect(formatCurrency(100000000).replace(/\u00A0/g, ' ')).toBe('Rp 1.000.000');
    });
});
