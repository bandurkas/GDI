/* eslint-disable @typescript-eslint/no-require-imports */

import { PrismaClient } from "@prisma/client";
import { OrderService } from "./src/services/order.service";
import { PaymentMode } from "./src/services/payment.service";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Starting Cashback Verification ---");

    // 1. Create a user with Default Percentage (should be 80%)
    const defaultUserEmail = `default-cashback-${Date.now()}@test.com`;
    const defaultUser = await prisma.user.create({
        data: {
            email: defaultUserEmail,
            passwordHash: "dummy",
            role: "USER",
            // cashbackPercentage is not set, defaults to 80.0
        },
    });
    console.log(`Created Default User: ${defaultUser.id}`);

    // Create Cart & Order for Default User
    const product = await prisma.product.create({
        data: { name: "Test Product", priceCents: 10000, active: true }, // $100.00
    });

    await prisma.cart.create({
        data: {
            userId: defaultUser.id,
            items: {
                create: { productId: product.id, quantity: 1 }
            }
        }
    });

    const defaultOrder = await OrderService.createOrder(defaultUser.id, "TEST");

    // Check Cashback
    const defaultCashback = await prisma.cashbackTransaction.findUnique({
        where: { orderId: defaultOrder.id }
    });

    console.log(`Default User Order Total: ${defaultOrder.totalCents}`);
    console.log(`Default User Cashback: ${defaultCashback?.amountCents} (Expected: 8000)`);
    console.log(`Default User Rate: ${defaultCashback?.rate} (Expected: 0.8)`);

    if (defaultCashback?.amountCents !== 8000) throw new Error("Default cashback calculation failed");


    // 2. Create a user with CUSTOM Percentage (e.g., 7%)
    const customUserEmail = `custom-cashback-${Date.now()}@test.com`;
    const customUser = await prisma.user.create({
        data: {
            email: customUserEmail,
            passwordHash: "dummy",
            role: "USER",
            cashbackPercentage: 7.0, // 7%
        },
    });
    console.log(`Created Custom User: ${customUser.id} with 7%`);

    await prisma.cart.create({
        data: {
            userId: customUser.id,
            items: {
                create: { productId: product.id, quantity: 1 }
            }
        }
    });

    const customOrder = await OrderService.createOrder(customUser.id, "TEST");

    // Check Cashback
    const customCashback = await prisma.cashbackTransaction.findUnique({
        where: { orderId: customOrder.id }
    });

    console.log(`Custom User Order Total: ${customOrder.totalCents}`);
    console.log(`Custom User Cashback: ${customCashback?.amountCents} (Expected: 700)`);
    console.log(`Custom User Rate: ${customCashback?.rate} (Expected: 0.07)`);

    if (customCashback?.amountCents !== 700) throw new Error("Custom cashback calculation failed");

    console.log("--- Verification SUCCESS ---");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
