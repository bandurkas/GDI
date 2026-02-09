/**
 * API Input Validation Schemas using Zod
 * 
 * These schemas validate incoming request data to prevent:
 * - Type errors (expecting string, got number)
 * - Invalid data (negative amounts, malformed emails)
 * - Missing required fields
 * - Injection attacks
 */

import { z } from "zod";

// ============================================================================
// CHECKOUT VALIDATION
// ============================================================================

export const CheckoutSchema = z.object({
    paymentMethod: z.enum(["TEST", "MIDTRANS"]),
    // Guest checkout fields (optional)
    guestEmail: z.string().email("Invalid email address").optional(),
    guestName: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .optional(),
    items: z.array(z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number()
            .int("Quantity must be a whole number")
            .positive("Quantity must be positive")
            .max(100, "Maximum quantity is 100")
    })).optional(),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;

// ============================================================================
// PAYOUT REQUEST VALIDATION
// ============================================================================

export const PayoutRequestSchema = z.object({
    amountCents: z.number()
        .int("Amount must be a whole number")
        .positive("Amount must be positive")
        .min(1000000, "Minimum withdrawal is Rp 10,000") // 10k IDR in cents
        .max(1000000000, "Maximum withdrawal is Rp 10,000,000"), // 10M IDR
});

export type PayoutRequestInput = z.infer<typeof PayoutRequestSchema>;

// ============================================================================
// PROFILE UPDATE VALIDATION
// ============================================================================

export const ProfileUpdateSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .optional(),

    usdtWallet: z.string()
        .regex(/^T[A-Za-z0-9]{33}$/, "Invalid USDT TRC20 wallet address")
        .optional()
        .or(z.literal("")), // Allow empty string to clear wallet

    telegram: z.string()
        .regex(/^@?[A-Za-z0-9_]{5,32}$/, "Invalid Telegram username (5-32 characters, letters/numbers/underscore)")
        .optional()
        .or(z.literal("")), // Allow empty string to clear telegram
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

// ============================================================================
// ADMIN: UPDATE CASHBACK PERCENTAGE
// ============================================================================

export const CashbackPercentageSchema = z.object({
    percentage: z.number()
        .min(0, "Percentage cannot be negative")
        .max(100, "Percentage cannot exceed 100"),
});

export type CashbackPercentageInput = z.infer<typeof CashbackPercentageSchema>;

// ============================================================================
// REGISTRATION VALIDATION
// ============================================================================

export const RegisterSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .min(5, "Email is too short")
        .max(255, "Email is too long"),

    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================================================
// FORGOT PASSWORD VALIDATION
// ============================================================================

export const ForgotPasswordSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .min(5, "Email is too short")
        .max(255, "Email is too long"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

// ============================================================================
// HELPER: Format Zod Errors for API Response
// ============================================================================

export function formatZodError(error: z.ZodError) {
    return {
        error: "Invalid request data",
        details: error.issues.map((e: z.ZodIssue) => ({
            field: e.path.join("."),
            message: e.message
        }))
    };
}
