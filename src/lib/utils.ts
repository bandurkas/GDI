import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Classname merger (Standard)
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- CURRENCY FORMATTERS ---

/**
 * Format IDR (Indonesian Rupiah)
 * Input: IDR Units (e.g. 50000)
 * Output: "Rp 50.000" (No cents)
 */
export function formatCurrency(amountIDR: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amountIDR);
}

/**
 * Format USD (US Dollar)
 * Input: USD Cents (e.g. 1000 -> $10.00)
 * Output: "$10.00" (With cents)
 */
export function formatUSD(amountUSDCents: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amountUSDCents / 100);
}

// --- CONVERSION HELPERS ---

/**
 * Convert USD Cents to IDR Units
 * Input: USD Cents (e.g. 1000)
 * Output: IDR Units (e.g. 160000)
 */
export function convertUSDCentsToIDR(usdCents: number, rate = 16000): number {
    // Cents / 100 = USD Units. Units * Rate = IDR.
    return Math.round((usdCents / 100) * rate);
}

/**
 * Convert IDR Units to USD Cents
 * Input: IDR Units (e.g. 16000)
 * Output: USD Cents (e.g. 100)
 */
export function convertIDRToUSDCents(idrAmount: number, rate = 16000): number {
    // IDR / Rate = USD Units. USD Units * 100 = Cents.
    return Math.floor((idrAmount / rate) * 100);
}

// --- INPUT HELPERS ---

export function formatNumberInput(value: string): string {
    // Remove non-digits
    return value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseFormattedNumber(value: string): number {
    const cleaned = value.replace(/\./g, '');
    return parseInt(cleaned, 10) || 0;
}

// Backward compatibility (Deprecated, map to new)
export const convertUSDtoIDR = (usdUnits: number, rate = 16000) => Math.round(usdUnits * rate);
export const convertIDRtoUSD = (idrUnits: number, rate = 16000) => idrUnits / rate;
