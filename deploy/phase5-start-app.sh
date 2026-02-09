#!/bin/bash
set -e

echo "========================================="
echo "  PHASE 5: Application Start & Validation"
echo "  Electric Sojourner Deployment"
echo "========================================="
echo "Starting at: $(date)"
echo ""

cd /root/electric-sojourner

# Start application with PM2
echo "[1/5] Starting application with PM2..."
pm2 delete electric-sojourner 2>/dev/null || true  # Delete if exists
pm2 start npm --name "electric-sojourner" -- start -- -p 3001

echo "Waiting for application to start..."
sleep 10

# Check PM2 status
pm2 status
echo "✓ Application started"
echo ""

# Configure PM2 to start on boot
echo "[2/5] Configuring PM2 startup..."
pm2 startup systemd -u root --hp /root
pm2 save
echo "✓ PM2 configured to start on boot"
echo ""

# Set up log rotation
echo "[3/5] Setting up log rotation..."
pm2 install pm2-logrotate 2>/dev/null || true
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
echo "✓ Log rotation configured"
echo ""

# Test application
echo "[4/5] Testing application..."
sleep 5

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_CHECK=$(curl -s http://localhost:3001/api/health || echo "FAILED")
if echo "$HEALTH_CHECK" | grep -E -q "ok|healthy"; then
    echo "✓ Health check: PASSED"
else
    echo "❌ Health check: FAILED"
    echo "Response: $HEALTH_CHECK"
    echo ""
    echo "Checking logs..."
    pm2 logs electric-sojourner --lines 50 --nostream
    exit 1
fi
echo ""

# Seed database if needed
echo "[5/5] Seeding database..."
curl -X GET http://localhost:3001/api/seed 2>/dev/null || echo "⚠️  Seed endpoint not accessible (may be protected)"
echo "✓ Database seeding attempted"
echo ""

echo "========================================="
echo "  PHASE 5 COMPLETE!"
echo "========================================="
echo "Completed at: $(date)"
echo ""
echo "Application Status:"
pm2 status
echo ""

# Get domain from Nginx config
DOMAIN=$(grep "server_name" /etc/nginx/sites-available/gdi | awk '{print $2}' | sed 's/;//' | head -n1)

echo "========================================="
echo "  PRODUCTION VALIDATION TESTS"
echo "========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check (local)"
curl -f http://localhost:3001/api/health > /dev/null 2>&1 && echo "  ✓ PASS" || echo "  ❌ FAIL"

# Test 2: Health Check (HTTPS)
if [ ! -z "$DOMAIN" ]; then
    echo "Test 2: Health Check (HTTPS)"
    curl -f https://$DOMAIN/api/health > /dev/null 2>&1 && echo "  ✓ PASS" || echo "  ❌ FAIL"
    
    # Test 3: Homepage
    echo "Test 3: Homepage"
    curl -f https://$DOMAIN > /dev/null 2>&1 && echo "  ✓ PASS" || echo "  ❌ FAIL"
    
    # Test 4: Products API
    echo "Test 4: Products API"
    curl -f https://$DOMAIN/api/products > /dev/null 2>&1 && echo "  ✓ PASS" || echo "  ❌ FAIL"
fi

# Test 5: Database Connection
echo "Test 5: Database Connection"
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => console.log('  ✓ PASS')).catch(() => console.log('  ❌ FAIL'));" 2>/dev/null

# Test 6: PM2 Status
echo "Test 6: PM2 Running"
pm2 status | grep -q "online" && echo "  ✓ PASS" || echo "  ❌ FAIL"

# Test 7: Disk Space
echo "Test 7: Disk Space"
df -h / | awk 'NR==2 {if ($5+0 < 80) print "  ✓ PASS (Used: "$5")"; else print "  ❌ FAIL (Used: "$5")"}'

# Test 8: Memory Usage
echo "Test 8: Memory"
free -h | awk 'NR==2 {print "  ℹ️  Memory: "$3" / "$2}'

echo ""
echo "========================================="
echo "  DEPLOYMENT COMPLETE! 🎉"
echo "========================================="
echo ""

if [ ! -z "$DOMAIN" ]; then
    echo "Your application is now live at:"
    echo "  🌐 https://$DOMAIN"
    echo ""
fi

echo "Useful Commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs                - View application logs"
echo "  pm2 logs --err          - View error logs only"
echo "  pm2 restart all         - Restart application"
echo "  pm2 monit               - Monitor resources"
echo ""

echo "Next Steps:"
echo "  1. ✅ Test all critical user flows"
echo "  2. ✅ Configure Midtrans webhook:"
echo "     Dashboard > Settings > Notification URL:"
echo "     https://$DOMAIN/api/webhooks/midtrans"
echo "  3. ✅ Monitor logs for 24 hours"
echo "  4. ✅ Set up automated backups"
echo "  5. ✅ Plan security fixes from review"
echo ""

echo "Monitoring:"
echo "  View logs:     pm2 logs electric-sojourner"
echo "  View errors:   pm2 logs electric-sojourner --err"
echo "  Monitor:       pm2 monit"
echo "  Nginx logs:    tail -f /var/log/nginx/access.log"
echo ""

echo "Emergency Commands:"
echo "  Restart app:   pm2 restart electric-sojourner"
echo "  Restart DB:    sudo systemctl restart postgresql"
echo "  Restart Nginx: sudo systemctl restart nginx"
echo "  Full restart:  pm2 restart all && sudo systemctl restart postgresql nginx"
echo ""

echo "Backup Commands:"
echo "  Database:      pg_dump gdi_production > backup_\$(date +%Y%m%d).sql"
echo "  Application:   tar -czf app_backup_\$(date +%Y%m%d).tar.gz /root/electric-sojourner"
echo ""

echo "========================================="
echo "  Deployment successful! 🚀"
echo "========================================="
