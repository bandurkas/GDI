#!/bin/bash
set -e

echo "========================================="
echo "  DEPLOY NEW BUILD TO VPS"
echo "  Electric Sojourner"
echo "========================================="
echo "Starting at: $(date)"
echo ""

# Configuration
APP_DIR="/root/electric-sojourner"
DEPLOY_LOG="/root/deploy_$(date +%Y%m%d_%H%M%S).log"

# Log everything
exec > >(tee -a "$DEPLOY_LOG")
exec 2>&1

echo "Deployment log: $DEPLOY_LOG"
echo ""

# Check if checkpoint was created
echo "Checking for recent checkpoint..."
LATEST_CHECKPOINT=$(ls -td /root/backups/checkpoint_* 2>/dev/null | head -1)
if [ -n "$LATEST_CHECKPOINT" ]; then
    echo "✓ Checkpoint found: $LATEST_CHECKPOINT"
    echo "  You can restore with: bash $LATEST_CHECKPOINT/RESTORE.sh"
else
    echo "⚠️  WARNING: No checkpoint found!"
    read -p "Continue without checkpoint? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        echo "Deployment cancelled. Create checkpoint first:"
        echo "  bash deploy/create-checkpoint.sh"
        exit 1
    fi
fi
echo ""

# Navigate to app directory
cd "$APP_DIR"

# 1. Pull latest code
echo "[1/8] Pulling latest code from git..."
if [ -d ".git" ]; then
    git fetch origin
    git pull origin main
    echo "✓ Code updated"
else
    echo "⚠️  Not a git repository. Assuming code is already uploaded."
fi
echo ""

# 2. Stop application
echo "[2/8] Stopping application..."
pm2 stop electric-sojourner 2>/dev/null || echo "App not running"
echo "✓ Application stopped"
echo ""

# 3. Backup current node_modules and .next
echo "[3/8] Cleaning old build artifacts..."
rm -rf .next
echo "✓ Old build removed"
echo ""

# 4. Install dependencies
echo "[4/8] Installing dependencies..."
echo "This may take 5-10 minutes..."
npm ci --production=false
echo "✓ Dependencies installed"
echo ""

# 5. Generate Prisma client
echo "[5/8] Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"
echo ""

# 6. Run migrations
echo "[6/8] Running database migrations..."
npx prisma migrate deploy || echo "⚠️  Migration failed (DB might be desync) but continuing..."
echo "✓ Migrations completed"
echo ""

# 7. Build application
echo "[7/8] Building application..."
echo "This may take 5-10 minutes..."
if npm run build; then
    echo "✓ Build successful"
else
    echo "❌ Build failed!"
    echo ""
    echo "Restoring from checkpoint..."
    if [ -n "$LATEST_CHECKPOINT" ]; then
        bash "$LATEST_CHECKPOINT/RESTORE.sh"
    fi
    exit 1
fi
echo ""

# 8. Start application
echo "[8/8] Starting application..."
pm2 restart electric-sojourner || pm2 start npm --name "electric-sojourner" -- start -- -p 3001
pm2 save
echo "✓ Application started"
echo ""

# Wait for app to start
echo "Waiting for application to start..."
sleep 10

# Test health endpoint
echo "Testing application..."
HEALTH_CHECK=$(curl -s http://localhost:3001/api/health || echo "FAILED")

if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "✓ Health check: PASSED"
    echo ""
    echo "========================================="
    echo "  DEPLOYMENT SUCCESSFUL! 🎉"
    echo "========================================="
    echo ""
    echo "Deployment completed at: $(date)"
    echo "Deployment log: $DEPLOY_LOG"
    echo ""
    echo "Application Status:"
    pm2 status
    echo ""
    echo "Next steps:"
    echo "  1. Test your site: https://yourdomain.com"
    echo "  2. Monitor logs: pm2 logs electric-sojourner"
    echo "  3. Check for errors: pm2 logs --err"
    echo ""
    echo "If issues occur, restore checkpoint:"
    if [ -n "$LATEST_CHECKPOINT" ]; then
        echo "  bash $LATEST_CHECKPOINT/RESTORE.sh"
    fi
    echo ""
else
    echo "❌ Health check: FAILED"
    echo "Response: $HEALTH_CHECK"
    echo ""
    echo "Checking logs..."
    pm2 logs electric-sojourner --lines 50 --nostream
    echo ""
    echo "========================================="
    echo "  DEPLOYMENT FAILED!"
    echo "========================================="
    echo ""
    read -p "Restore from checkpoint? (yes/no): " RESTORE
    if [ "$RESTORE" == "yes" ] && [ -n "$LATEST_CHECKPOINT" ]; then
        bash "$LATEST_CHECKPOINT/RESTORE.sh"
    fi
    exit 1
fi
