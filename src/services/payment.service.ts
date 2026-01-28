// @ts-expect-error midtrans-client does not have @types
import midtransClient from "midtrans-client";

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface PaymentResult {
    status: PaymentStatus;
    transactionId?: string;
    snapToken?: string;
    error?: string;
}

export interface CustomerDetails {
    first_name: string;
    email: string;
}

export interface PaymentProvider {
    processPayment(amountCents: number, orderId: string, customerDetails?: CustomerDetails): Promise<PaymentResult>;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private snap: any;

    constructor() {
        this.snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
        });
    }

    async processPayment(amountCents: number, orderId: string, customerDetails?: CustomerDetails): Promise<PaymentResult> {
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const transaction = await (this.snap as any).createTransaction(parameter);
            return {
                status: "PENDING",
                snapToken: transaction.token,
            };
        } catch (error: unknown) {
            console.error("Midtrans Snap Error:", error);
            return {
                status: "FAILED",
                error: error instanceof Error ? error.message : "Payment failed"
            };
        }
    }
}

export type PaymentMode = "TEST" | "MIDTRANS";

export class PaymentService {
    private provider: PaymentProvider;

    constructor(mode: PaymentMode) {
        this.provider = mode === "TEST" ? new TestPaymentProvider() : new MidtransPaymentProvider();
    }

    async pay(amountCents: number, orderId: string, customerDetails?: CustomerDetails): Promise<PaymentResult> {
        return this.provider.processPayment(amountCents, orderId, customerDetails);
    }
}
