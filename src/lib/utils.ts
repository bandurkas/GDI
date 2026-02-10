export const formatCurrency = (amountInCents: number) => {
    // Convert cents to whole units
    const units = amountInCents / 100;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(units);
};

export const formatUSD = (amountInCents: number) => {
    const IDR_TO_USD_RATE = 16000;
    // content is in cents, so we divide by 100 to get IDR units
    const amountIDR = amountInCents / 100;
    const amountUSD = amountIDR / IDR_TO_USD_RATE;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amountUSD);
};

/**
 * Format currency with USD estimate
 * @param amountInCents - Amount in cents (e.g., 10000000 = Rp 100,000)
 * @returns Formatted string like "Rp 100.000 (~$6.25)"
 */
export const formatCurrencyWithUSD = (amountInCents: number): string => {
    const idr = formatCurrency(amountInCents);
    const usd = formatUSD(amountInCents);
    return `${idr} (~${usd})`;
};

/**
 * Format number input with thousand separators (Indonesian style)
 * @param value - Raw input string
 * @returns Formatted string with dots as thousand separators
 */
export function formatNumberInput(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add thousand separators (dots for Indonesian format)
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse formatted number back to integer
 * @param value - Formatted string like "100.000"
 * @returns Integer like 100000
 */
export function parseFormattedNumber(value: string): number {
    const cleaned = value.replace(/\./g, '');
    return parseInt(cleaned, 10) || 0;
}

/**
 * Convert IDR to USD (approximate)
 * @param idrAmount - Amount in IDR (not cents)
 * @returns USD amount as number
 */
export function convertIDRtoUSD(idrAmount: number): number {
    const IDR_TO_USD_RATE = 16000;
    return idrAmount / IDR_TO_USD_RATE;
}
