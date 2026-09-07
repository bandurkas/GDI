export interface BankDetails {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    swift?: string;
    note?: string;
}

// Bank requisites shown to customers for manual (offline) payment.
// Configure via env; placeholders are shown until real values are set.
export function getBankDetails(): BankDetails {
    return {
        bankName: process.env.BANK_NAME || "Bank (to be configured)",
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || "0000000000",
        accountHolder: process.env.BANK_ACCOUNT_HOLDER || "PT Global Digital Informasi",
        swift: process.env.BANK_SWIFT || undefined,
        note: process.env.BANK_PAYMENT_NOTE || undefined,
    };
}

export const isOnlinePaymentEnabled = () =>
    process.env.ONLINE_PAYMENT_ENABLED === "true" && !!process.env.MIDTRANS_SERVER_KEY;
