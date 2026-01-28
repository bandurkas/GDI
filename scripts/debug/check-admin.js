/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAdmin() {
    console.log("Checking admin user...\n");

    try {
        const admin = await prisma.user.findUnique({
            where: { email: "admin@admin.com" },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!admin) {
            console.log("❌ Admin user NOT FOUND!");
            console.log("Creating admin user...");

            const bcrypt = require("bcrypt");
            const passwordHash = await bcrypt.hash("admin", 10);

            const newAdmin = await prisma.user.create({
                data: {
                    email: "admin@admin.com",
                    passwordHash,
                    role: "ADMIN",
                    wallet: { create: {} },
                    cart: { create: {} },
                },
            });

            console.log("✅ Admin user created:", newAdmin);
        } else {
            console.log("Admin user found. Forcing password reset...");
            const bcrypt = require("bcrypt");
            const passwordHash = await bcrypt.hash("admin", 10);

            await prisma.user.update({
                where: { email: "admin@admin.com" },
                data: {
                    role: "ADMIN",
                    passwordHash
                },
            });
            console.log("✅ Admin password reset to 'admin'");
        }

        // Check all users
        console.log("\n--- All Users ---");
        const allUsers = await prisma.user.findMany({
            select: { email: true, role: true },
        });
        allUsers.forEach(u => {
            console.log(`  ${u.email} - ${u.role}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
