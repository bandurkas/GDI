/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function migrateFinancialData() {
    console.log("=== FINTECH SCHEMA MIGRATION ===\n");

    console.log("Step 1: Migrating Wallet balances...");

    // Add new columns
    await prisma.$executeRaw`
    ALTER TABLE "Wallet" 
    ADD COLUMN IF NOT EXISTS "availableBalanceCents" INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "pendingBalanceCents" INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "totalPaidOutCents" INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT NOW();
  `;

    console.log("  ✓ New wallet columns added");

    // Check if old column exists and migrate if needed
    const result = await prisma.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'Wallet' AND column_name = 'balanceCents';
  `;

    if (result.length > 0) {
        console.log("  → Found old balanceCents column, migrating data...");

        await prisma.$executeRaw`
      UPDATE "Wallet" 
      SET "availableBalanceCents" = "balanceCents"
      WHERE "balanceCents" IS NOT NULL;
    `;

        console.log("  ✓ Migrated balanceCents → availableBalanceCents");

        await prisma.$executeRaw`
      ALTER TABLE "Wallet" DROP COLUMN "balanceCents";
    `;

        console.log("  ✓ Removed old balanceCents column");
    } else {
        console.log("  ✓ Wallet already migrated (no balanceCents column found)");
    }

    console.log("\nStep 2: Migrating CashbackTransaction statuses...");

    // Create CashbackStatus enum
    await prisma.$executeRaw`
    DO $$ BEGIN
      CREATE TYPE "CashbackStatus" AS ENUM ('PENDING', 'AVAILABLE', 'PAID', 'REVERSED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

    // Add status column
    await prisma.$executeRaw`
    ALTER TABLE "CashbackTransaction"
    ADD COLUMN IF NOT EXISTS "status" "CashbackStatus" DEFAULT 'AVAILABLE';
  `;

    // Add timestamp columns
    await prisma.$executeRaw`
    ALTER TABLE "CashbackTransaction"
    ADD COLUMN IF NOT EXISTS "availableAt" TIMESTAMP;
  `;

    await prisma.$executeRaw`
    ALTER TABLE "CashbackTransaction"
    ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP;
  `;

    await prisma.$executeRaw`
    ALTER TABLE "CashbackTransaction"
    ADD COLUMN IF NOT EXISTS "reversedAt" TIMESTAMP;
  `;

    await prisma.$executeRaw`
    ALTER TABLE "CashbackTransaction"
    ADD COLUMN IF NOT EXISTS "notes" TEXT;
  `;

    console.log("  ✓ New cashback columns added");

    // Set existing cashback to AVAILABLE
    await prisma.$executeRaw`
    UPDATE "CashbackTransaction"
    SET 
      "status" = 'AVAILABLE'::"CashbackStatus",
      "availableAt" = "createdAt"
    WHERE "availableAt" IS NULL;
  `;

    console.log("  ✓ Migrated existing cashback to AVAILABLE status");

    console.log("\nStep 3: Creating Payout table...");

    // Create PayoutStatus enum
    await prisma.$executeRaw`
    DO $$ BEGIN
      CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

    // Create Payout table
    await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Payout" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "amountCents" INTEGER NOT NULL,
      "status" "PayoutStatus" DEFAULT 'REQUESTED',
      "method" TEXT,
      "reference" TEXT,
      "requestedAt" TIMESTAMP DEFAULT NOW(),
      "processedAt" TIMESTAMP,
      "notes" TEXT,
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
  `;

    // Create index
    await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "Payout_userId_status_idx" ON "Payout"("userId", "status");
  `;

    console.log("  ✓ Payout table created");

    console.log("\nStep 4: Adding REFUNDED status to OrderStatus...");

    await prisma.$executeRaw`
    DO $$ BEGIN
      ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'REFUNDED';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

    console.log("  ✓ REFUNDED status added to OrderStatus");

    console.log("\nStep 5: Verifying migration...");

    const wallets = await prisma.wallet.findMany({
        select: {
            userId: true,
            availableBalanceCents: true,
            pendingBalanceCents: true,
            totalEarnedCents: true,
            totalPaidOutCents: true,
        },
    });

    console.log(`  ✓ ${wallets.length} wallets migrated successfully`);

    wallets.forEach((w, i) => {
        if (i < 3) { // Show first 3
            console.log(`    - Available: $${(w.availableBalanceCents / 100).toFixed(2)}, Pending: $${(w.pendingBalanceCents / 100).toFixed(2)}`);
        }
    });

    const cashback = await prisma.cashbackTransaction.findMany({
        select: {
            id: true,
            status: true,
            availableAt: true,
        },
    });

    console.log(`  ✓ ${cashback.length} cashback transactions migrated successfully`);
    console.log(`    - All set to AVAILABLE status: ${cashback.every(c => c.status === 'AVAILABLE')}`);

    console.log("\n=== MIGRATION COMPLETE ===\n");
    console.log("Summary:");
    console.log(`  • Wallets migrated: ${wallets.length}`);
    console.log(`  • Cashback transactions migrated: ${cashback.length}`);
    console.log(`  • Payout table created: ✓`);
    console.log(`  • New enums added: ✓`);
    console.log("\nNext steps:");
    console.log("  1. Run: npx prisma generate");
    console.log("  2. Restart your dev server");

    await prisma.$disconnect();
}

migrateFinancialData().catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
});
