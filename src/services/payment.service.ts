export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface PaymentResult {
    status: PaymentStatus;
    transactionId: string;
}

export interface PaymentProvider {
    processPayment(amountCents: number): Promise<PaymentResult>;
}

export class TestPaymentProvider implements PaymentProvider {
    async processPayment(amountCents: number): Promise<PaymentResult> {
        // In test mode, we just succeed

        return {
            status: "SUCCESS",
            transactionId: `test_${Date.now()}`,
        };
    }
}

export class MidtransPaymentProvider implements PaymentProvider {
    async processPayment(amountCents: number): Promise<PaymentResult> {
        // Future implementation
        throw new Error("Midtrans not implemented yet");
    }
}

export type PaymentMode = "TEST" | "MIDTRANS";

export class PaymentService {
    private provider: PaymentProvider;

    constructor(mode: PaymentMode) {
        if (mode === "TEST") {
            this.provider = new TestPaymentProvider();
        } else {
            this.provider = new MidtransPaymentProvider();
        }
    }

    async pay(amountCents: number): Promise<PaymentResult> {
        return this.provider.processPayment(amountCents);
    }
}
