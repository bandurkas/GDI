#!/bin/bash

# Production Deployment Script for Electric Sojourner
# This script ensures a clean deployment without conflicts from old processes

set -e  # Exit on any error

echo "🚀 Starting deployment to production VPS..."

# Navigate to project directory
cd /root/electric-sojourner || exit 1

echo "📦 Pulling latest changes from GitHub..."
git fetch --all
git checkout feat/forgot-password-and-auth-fixes
git pull origin feat/forgot-password-and-auth-fixes

echo "📋 Installing/updating dependencies..."
npm install --production=false

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🗄️  Syncing database schema..."
npx prisma db push

echo "🏗️  Building production bundle..."
npm run build

echo "🛑 Stopping old PM2 processes..."
# Stop and delete ALL instances to prevent conflicts
pm2 delete all || true

echo "✨ Starting application on port 3001..."
pm2 start npm --name electric-sojourner -- start -- -p 3001

echo "💾 Saving PM2 process list..."
pm2 save

echo "🔍 Verifying application health..."
sleep 3  # Wait for app to start

# Check if app is running
if pm2 list | grep -q "electric-sojourner.*online"; then
    echo "✅ Application is running!"
else
    echo "❌ Application failed to start. Check logs:"
    pm2 logs electric-sojourner --lines 20
    exit 1
fi

# Check if app is listening on port 3001
if netstat -tlnp | grep -q ":3001"; then
    echo "✅ Application is listening on port 3001!"
else
    echo "❌ Application is not listening on port 3001"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Current PM2 Status:"
pm2 list

echo ""
echo "🌐 Application URLs:"
echo "  - Direct: http://31.97.105.238:3001"
echo "  - Domain: https://gdiconsult.online"
echo ""
echo "📝 To view logs: pm2 logs electric-sojourner"
echo "📝 To restart: pm2 restart electric-sojourner"
