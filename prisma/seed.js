const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create products
    const products = [
        {
            id: "start-ai",
            name: "Start AI Pack",
            description: "Essential automation for beginners.",
            priceCents: 8500000,
            active: true
        },
        {
            id: "middle-scale",
            name: "Middle Scale AI",
            description: "Secure, context-aware GenAI for teams.",
            priceCents: 17500000,
            active: true
        },
        {
            id: "automation-platform",
            name: "AI Automation Platform",
            description: "Turn raw data into strategic assets.",
            priceCents: 26000000,
            active: true
        },
        {
            id: "ent-assistant",
            name: "Enterprise AI Assistant",
            description: "Scalable cloud foundations for AI.",
            priceCents: 34000000,
            active: true
        }
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: product,
            create: product,
        });
    }

    // Create Admin user
    const adminEmail = "ceo@gdi.com";
    const adminPassword = "J@K@rta2026";
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: "SUPER_ADMIN",
        },
        create: {
            email: adminEmail,
            passwordHash: adminPasswordHash,
            role: "SUPER_ADMIN",
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
