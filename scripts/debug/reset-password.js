/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetPassword() {
    try {
        const hashedPassword = await bcrypt.hash('12345', 10);

        await prisma.user.upsert({
            where: { email: 'test22@mail.com' },
            create: {
                email: 'test22@mail.com',
                passwordHash: hashedPassword,
                role: 'USER'
            },
            update: {
                passwordHash: hashedPassword
            }
        });

        console.log("Password reset successfully for test22@mail.com");
    } catch (error) {
        console.error("Error resetting password:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
