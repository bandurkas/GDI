const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function testPostgreSQL() {
    console.log("=== Testing PostgreSQL Setup ===\n");

    // Test 1: Check user exists
    const admin = await prisma.user.findUnique({
        where: { email: "admin@admin.com" },
        include: { wallet: true, cart: true }
    });

    if (!admin) {
        console.log("❌ Admin user not found!");
        return;
    }

    console.log("✅ Admin user found");
    console.log("  Email:", admin.email);
    console.log("  Role:", admin.role);
    console.log("  Has wallet:", !!admin.wallet);
    console.log("  Has cart:", !!admin.cart);

    // Test 2: Check password
    const passwordValid = await bcrypt.compare("123456", admin.passwordHash);
    console.log("\n✅ Password validates:", passwordValid);

    // Test 3: Check products
    const products = await prisma.product.findMany();
    console.log("\n✅ Products loaded:", products.length);
    products.forEach(p => console.log(`  - ${p.name} (${p.id})`));

    // Test 4: Test cart operation
    if (admin.cart) {
        const cartItem = await prisma.cartItem.create({
            data: {
                cartId: admin.cart.id,
                productId: products[0].id,
                quantity: 1
            }
        });
        console.log("\n✅ Cart item created:", cartItem.id);

        // Clean up
        await prisma.cartItem.delete({ where: { id: cartItem.id } });
        console.log("✅ Cart item deleted (cleanup)");
    }

    console.log("\n=== All PostgreSQL tests passed! ===");
}

testPostgreSQL()
    .catch(e => {
        console.error("❌ Test failed:", e.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
