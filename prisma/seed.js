/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create products
    const products = [
        {
            name: "Cloud Hosting Pro",
            description: "Scale your application with ease. High performance guaranteed.",
            priceCents: 2900,
        },
        {
            name: "AI Analytics Suite",
            description: "Gain deep insights into your business with our AI-powered tool.",
            priceCents: 5900,
        },
        {
            name: "Security Shield Plus",
            description: "Enterprise-grade security for your digital assets.",
            priceCents: 1500,
        },
        {
            name: "Developer API Access",
            description: "Full access to our robust developer endpoints.",
            priceCents: 9900,
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.name.replace(/\s+/g, '-').toLowerCase() },
            update: product,
            create: {
                id: product.name.replace(/\s+/g, '-').toLowerCase(),
                ...product,
            },
        });
    }

    // Create Admin user
    const adminEmail = "admin@admin.com";
    const adminPassword = "12345";
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash: adminPasswordHash,
            role: "ADMIN",
            wallet: { create: {} },
            cart: { create: {} },
        },
    });

    // Create Test User 1
    const user1Email = "user1@example.com";
    const user1Password = "password123";
    const user1PasswordHash = await bcrypt.hash(user1Password, 10);

    await prisma.user.upsert({
        where: { email: user1Email },
        update: {},
        create: {
            email: user1Email,
            passwordHash: user1PasswordHash,
            role: "USER",
            wallet: { create: {} },
            cart: { create: {} },
        },
    });

    // Create Test User 2
    const user2Email = "user2@example.com";
    const user2Password = "password123";
    const user2PasswordHash = await bcrypt.hash(user2Password, 10);

    await prisma.user.upsert({
        where: { email: user2Email },
        update: {},
        create: {
            email: user2Email,
            passwordHash: user2PasswordHash,
            role: "USER",
            wallet: { create: {} },
            cart: { create: {} },
        },
    });

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
