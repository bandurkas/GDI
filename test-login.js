const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function test() {
    const user = await prisma.user.findUnique({
        where: { email: "admin@admin.com" }
    });

    if (!user) {
        console.log("User not found!");
        return;
    }

    console.log("User found:", user.email);
    console.log("Role:", user.role);

    const isValid = await bcrypt.compare("123456", user.passwordHash);
    console.log("Password '123456' valid:", isValid);

    const isValid2 = await bcrypt.compare("12345", user.passwordHash);
    console.log("Password '12345' valid:", isValid2);
}

test().finally(() => prisma.$disconnect());
