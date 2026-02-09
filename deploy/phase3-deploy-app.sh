#!/bin/bash
set -e

echo "========================================="
echo "  PHASE 3: Application Deployment"
echo "  Electric Sojourner Deployment"
echo "========================================="
echo "Starting at: $(date)"
echo ""

cd /root/electric-sojourner

# Check if .env exists
echo "[1/7] Checking environment file..."
if [ ! -f .env ]; then
    echo "❌ ERROR: .env file not found!"
    echo ""
    echo "Please create .env file with:"
    echo "  1. DATABASE_URL from phase 2"
    echo "  2. NEXTAUTH_URL (https://yourdomain.com)"
    echo "  3. NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "  4. MIDTRANS_SERVER_KEY (production key)"
    echo "  5. MIDTRANS_CLIENT_KEY (production key)"
    echo "  6. MIDTRANS_IS_PRODUCTION=true"
    echo ""
    echo "Example .env file:"
    cat /root/electric-sojourner-config/db_credentials.txt 2>/dev/null || true
    echo ""
    exit 1
fi
echo "✓ .env file found"
echo ""

# Verify required environment variables
echo "Checking required environment variables..."
source .env
[ -z "$DATABASE_URL" ] && echo "❌ DATABASE_URL missing" && exit 1
[ -z "$NEXTAUTH_URL" ] && echo "❌ NEXTAUTH_URL missing" && exit 1
[ -z "$NEXTAUTH_SECRET" ] && echo "❌ NEXTAUTH_SECRET missing" && exit 1
[ -z "$MIDTRANS_SERVER_KEY" ] && echo "❌ MIDTRANS_SERVER_KEY missing" && exit 1
[ -z "$MIDTRANS_CLIENT_KEY" ] && echo "❌ MIDTRANS_CLIENT_KEY missing" && exit 1
echo "✓ All required environment variables present"
echo ""

# Install dependencies
echo "[2/7] Installing dependencies..."
echo "This may take 5-10 minutes..."
npm ci --production=false
echo "✓ Dependencies installed"
echo ""

# Generate Prisma client
echo "[3/7] Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"
echo ""

# Run database migrations
echo "[4/7] Running database migrations..."
npx prisma migrate deploy
echo "✓ Migrations completed"
echo ""

# Seed database
echo "[5/7] Seeding database..."
if [ -f "src/app/api/seed/route.ts" ]; then
    # Try to run seed via API endpoint (requires app to be running)
    # For now, we'll skip this and seed after app starts
    echo "⚠️  Skipping seed (will run after app starts)"
else
    echo "⚠️  No seed script found"
fi
echo ""

# Build application
echo "[6/7] Building application..."
echo "This may take 5-10 minutes..."
npm run build
if [ $? -eq 0 ]; then
    echo "✓ Application built successfully"
else
    echo "❌ Build failed!"
    exit 1
fi
echo ""

# Set permissions
echo "[7/7] Setting permissions..."
chown -R $USER:$USER /root/electric-sojourner
chmod -R 755 /root/electric-sojourner
echo "✓ Permissions set"
echo ""

echo "========================================="
echo "  PHASE 3 COMPLETE!"
echo "========================================="
echo "Completed at: $(date)"
echo ""
echo "Application deployed to: /root/electric-sojourner"
echo ""
echo "Validation:"
[ -d ".next" ] && echo "  ✓ Build output: exists (.next/)" || echo "  ❌ Build output: missing"
[ -d "node_modules/.prisma/client" ] && echo "  ✓ Prisma client: generated" || echo "  ❌ Prisma client: missing"
[ -f "package.json" ] && echo "  ✓ Package.json: exists" || echo "  ❌ Package.json: missing"
echo ""
echo "Testing database connection..."
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('  ✓ Database: connected')).catch((e) => console.log('  ❌ Database: connection failed -', e.message));"
echo ""
echo "Next step: Run phase4-ssl-nginx.sh"
echo "========================================="
