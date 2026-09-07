// @ts-ignore
import midtransClient from "midtrans-client";

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface PaymentResult {
    status: PaymentStatus;
    transactionId?: string;
    snapToken?: string;
    error?: string;
}

export interface PaymentProvider {
    processPayment(amountCents: number, orderId: string, customerDetails?: any): Promise<PaymentResult>;
}

export class TestPaymentProvider implements PaymentProvider {
    async processPayment(amountCents: number): Promise<PaymentResult> {
        return {
            status: "SUCCESS",
            transactionId: `test_${Date.now()}`,
        };
    }
}

export class MidtransPaymentProvider implements PaymentProvider {
    private snap: any;

    constructor() {
        this.snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });
    }

    async processPayment(amountCents: number, orderId: string, customerDetails?: any): Promise<PaymentResult> {
        try {
            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: Math.floor(amountCents),
                },
                credit_card: {
                    secure: true
                },
                customer_details: customerDetails
            };

            const transaction = await this.snap.createTransaction(parameter);
            return {
                status: "PENDING",
                snapToken: transaction.token,
            };
        } catch (error: any) {
            console.error("Midtrans Snap Error:", error);
            return {
                status: "FAILED",
                error: error.message
            };
        }
    }
}

// Offline payment: order stays PENDING until an admin confirms the transfer.
export class BankTransferPaymentProvider implements PaymentProvider {
    async processPayment(_amountCents: number, orderId: string): Promise<PaymentResult> {
        return { status: "PENDING", transactionId: `bank_${orderId}` };
    }
}

export type PaymentMode = "TEST" | "MIDTRANS" | "BANK_TRANSFER";

export class PaymentService {
    private provider: PaymentProvider;

    constructor(mode: PaymentMode) {
        if (mode === "TEST") {
            this.provider = new TestPaymentProvider();
        } else if (mode === "BANK_TRANSFER") {
            this.provider = new BankTransferPaymentProvider();
        } else {
            this.provider = new MidtransPaymentProvider();
        }
    }

    async pay(amountCents: number, orderId: string, customerDetails?: any): Promise<PaymentResult> {
        return this.provider.processPayment(amountCents, orderId, customerDetails);
    }
}
