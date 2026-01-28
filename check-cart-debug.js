const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkProducts() {
    try {
        const products = await prisma.product.findMany();
        console.log("Products in DB:");
        console.table(products.map(p => ({ id: p.id, name: p.name, price: p.priceCents })));

        const sessions = await prisma.user.findMany({
            where: { email: "bandurkas@gmail.com" },
            include: { cart: true, wallet: true }
        });
        console.log("\nUser check (bandurkas@gmail.com):");
        console.log(JSON.stringify(sessions, null, 2));
    } catch (error) {
        console.error("Error checking products:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProducts();
