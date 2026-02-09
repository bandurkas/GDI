# Pre-Deployment Checklist

**Project:** Electric Sojourner  
**Date:** _______________  
**Deployed by:** _______________

---

## ☐ BEFORE YOU START

### VPS Access
- [ ] VPS provisioned (min 2GB RAM, 2 CPU cores)
- [ ] VPS IP address: `_________________`
- [ ] SSH access tested: `ssh root@YOUR_VPS_IP`
- [ ] VPS OS: Ubuntu 20.04+ or Debian 11+

### Domain Configuration
- [ ] Domain name: `_________________`
- [ ] DNS A record created pointing to VPS IP
- [ ] DNS propagated (test with `dig yourdomain.com`)
- [ ] Wait time: 10-30 minutes after DNS change

### Credentials Ready
- [ ] Midtrans Production Server Key: `_________________`
- [ ] Midtrans Production Client Key: `_________________`
- [ ] Email for SSL certificate: `_________________`
- [ ] Generated NEXTAUTH_SECRET: `_________________`
  - Generate with: `openssl rand -base64 32`

### Code Preparation
- [ ] All code committed to git
- [ ] Git repository accessible from VPS
- [ ] OR: Code packaged for SCP upload
- [ ] .env.example reviewed

---

## ☐ PHASE 1: VPS SETUP (30-40 min)

**Script:** `phase1-vps-setup.sh`

### Before Running
- [ ] SSH into VPS: `ssh root@YOUR_VPS_IP`
- [ ] Download script or clone repo

### Run Script
```bash
bash phase1-vps-setup.sh
```

### Validation
- [ ] Node.js installed: `node -v` shows v18+
- [ ] PostgreSQL running: `systemctl status postgresql`
- [ ] Nginx running: `systemctl status nginx`
- [ ] PM2 installed: `pm2 -v`
- [ ] App directory exists: `ls /var/www/electric-sojourner`

### Issues?
- [ ] Check error messages in script output
- [ ] Verify internet connection
- [ ] Ensure sufficient disk space: `df -h`

**Phase 1 Complete:** ☐ YES  
**Time taken:** _______ minutes

---

## ☐ PHASE 2: DATABASE SETUP (20-30 min)

**Script:** `phase2-database.sh`

### Before Running
- [ ] Phase 1 completed successfully
- [ ] PostgreSQL running

### Run Script
```bash
bash phase2-database.sh
```

### CRITICAL: Save Password
```
Database Password: _________________________________
(Script will display this - SAVE IT IMMEDIATELY!)
```

### Validation
- [ ] Database created: `sudo -u postgres psql -l | grep electric_sojourner`
- [ ] User created: `sudo -u postgres psql -c "\du" | grep appuser`
- [ ] Connection test passed (shown in script output)
- [ ] Credentials saved: `cat /root/electric-sojourner-config/db_credentials.txt`

### Issues?
- [ ] PostgreSQL not running: `sudo systemctl start postgresql`
- [ ] Permission denied: Ensure running as root

**Phase 2 Complete:** ☐ YES  
**Time taken:** _______ minutes

---

## ☐ PHASE 3: APPLICATION DEPLOYMENT (30-40 min)

**Script:** `phase3-deploy-app.sh`

### Before Running

#### Upload Code
**Option A: Git Clone**
```bash
cd /var/www/electric-sojourner
git clone YOUR_REPO_URL .
```
- [ ] Code cloned successfully

**Option B: SCP Upload**
```bash
# On local machine:
tar --exclude='node_modules' --exclude='.next' -czf deploy.tar.gz .
scp deploy.tar.gz root@YOUR_VPS_IP:/var/www/electric-sojourner/

# On VPS:
cd /var/www/electric-sojourner
tar -xzf deploy.tar.gz
```
- [ ] Code uploaded and extracted

#### Create .env File
```bash
cd /var/www/electric-sojourner
nano .env
```

Paste this (with YOUR values):
```env
DATABASE_URL="postgresql://appuser:YOUR_DB_PASSWORD@localhost:5432/electric_sojourner?connection_limit=20&pool_timeout=20"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"
MIDTRANS_SERVER_KEY="your-production-server-key"
MIDTRANS_CLIENT_KEY="your-production-client-key"
MIDTRANS_IS_PRODUCTION="true"
NODE_ENV="production"
```

- [ ] .env file created
- [ ] DATABASE_URL contains correct password from Phase 2
- [ ] NEXTAUTH_URL is your domain with https://
- [ ] NEXTAUTH_SECRET generated with `openssl rand -base64 32`
- [ ] Midtrans keys are PRODUCTION keys
- [ ] MIDTRANS_IS_PRODUCTION="true"

### Run Script
```bash
bash phase3-deploy-app.sh
```

### Validation
- [ ] Dependencies installed (node_modules exists)
- [ ] Prisma client generated
- [ ] Migrations completed (no errors)
- [ ] Application built (.next directory exists)
- [ ] Database connection test passed

### Issues?
- [ ] Missing .env: Create it first
- [ ] Build fails: Check Node.js version and memory
- [ ] Migration fails: Check DATABASE_URL

**Phase 3 Complete:** ☐ YES  
**Time taken:** _______ minutes

---

## ☐ PHASE 4: SSL & NGINX (20-30 min)

**Script:** `phase4-ssl-nginx.sh`

### Before Running
- [ ] DNS A record points to VPS IP
- [ ] DNS propagated: `dig yourdomain.com` shows VPS IP
- [ ] Domain: `_________________`

### Run Script
```bash
bash phase4-ssl-nginx.sh
```

### During Script
You'll be asked for:
- [ ] Domain name: Enter your domain
- [ ] Email: Enter email for SSL renewal notifications
- [ ] Agree to terms: Press Y
- [ ] Share email with EFF: Press N (optional)
- [ ] Redirect HTTP to HTTPS: Press 2 (Yes)

### Validation
- [ ] Nginx configured: `nginx -t` shows OK
- [ ] SSL certificate installed: `sudo certbot certificates`
- [ ] HTTPS works: `curl -I https://yourdomain.com`
- [ ] HTTP redirects to HTTPS

### Issues?
- [ ] DNS not propagated: Wait 10-30 minutes
- [ ] Certbot fails: Check domain spelling
- [ ] Nginx test fails: Check config syntax

**Phase 4 Complete:** ☐ YES  
**Time taken:** _______ minutes

---

## ☐ PHASE 5: START APPLICATION (20-30 min)

**Script:** `phase5-start-app.sh`

### Before Running
- [ ] All previous phases completed
- [ ] Application built successfully

### Run Script
```bash
bash phase5-start-app.sh
```

### Validation Tests
The script will run these tests:

- [ ] Health check (local): PASS
- [ ] Health check (HTTPS): PASS
- [ ] Homepage: PASS
- [ ] Products API: PASS
- [ ] Database connection: PASS
- [ ] PM2 running: PASS
- [ ] Disk space: <80%
- [ ] Memory: Noted

### Manual Validation
Visit your site and test:

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] Can view products
- [ ] Can register user
- [ ] Can login
- [ ] Can add to cart
- [ ] Can view cart

### Issues?
- [ ] 502 error: Check `pm2 logs --err`
- [ ] Health check fails: Check .env file
- [ ] App crashes: Check memory and logs

**Phase 5 Complete:** ☐ YES  
**Time taken:** _______ minutes

---

## ☐ POST-DEPLOYMENT

### Configure Midtrans Webhook
- [ ] Login to Midtrans Dashboard: https://dashboard.midtrans.com
- [ ] Go to: Settings > Configuration
- [ ] Set Notification URL: `https://yourdomain.com/api/webhooks/midtrans`
- [ ] Save configuration

### Test Webhook
- [ ] Create test transaction in Midtrans
- [ ] Verify webhook received: `pm2 logs | grep webhook`
- [ ] Check order status updated in database

### Test Critical Flows

**User Registration:**
- [ ] Can register new user
- [ ] User receives correct role (USER)
- [ ] Wallet created automatically
- [ ] Cart created automatically

**Shopping Flow:**
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Cart persists
- [ ] Can update quantities
- [ ] Can remove items

**Checkout Flow:**
- [ ] Can proceed to checkout
- [ ] Midtrans payment page loads
- [ ] Can complete test transaction
- [ ] Order created with PENDING status

**Webhook Processing:**
- [ ] Webhook received after payment
- [ ] Order status updated to COMPLETED
- [ ] Cashback calculated correctly
- [ ] Wallet balance updated
- [ ] Cart cleared

**Payout Flow:**
- [ ] Can request payout
- [ ] Balance deducted correctly
- [ ] Admin can see payout request
- [ ] Admin can approve/reject
- [ ] Status updates correctly

### Set Up Monitoring
- [ ] PM2 monitoring active: `pm2 monit`
- [ ] Log rotation configured
- [ ] Uptime monitoring (optional): UptimeRobot, Pingdom
- [ ] Error tracking (optional): Sentry

### Set Up Backups
- [ ] Database backup script created
- [ ] Cron job scheduled for daily backups
- [ ] Test backup restoration

**Backup script:**
```bash
cat > /etc/cron.daily/backup-electric-sojourner << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump electric_sojourner > /root/backups/db_$DATE.sql
find /root/backups -name "db_*.sql" -mtime +7 -delete
EOF

chmod +x /etc/cron.daily/backup-electric-sojourner
mkdir -p /root/backups
```

- [ ] Backup script created
- [ ] Backup directory created
- [ ] Test backup: `pg_dump electric_sojourner > test_backup.sql`

---

## ☐ SECURITY REVIEW

### Environment Variables
- [ ] All secrets are unique (not from .env.example)
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] Database password is strong
- [ ] .env file permissions: `chmod 600 .env`

### Firewall
- [ ] UFW enabled: `sudo ufw status`
- [ ] Port 22 (SSH) allowed
- [ ] Port 80 (HTTP) allowed
- [ ] Port 443 (HTTPS) allowed
- [ ] All other ports blocked

### SSH Security
- [ ] SSH key-based auth configured (recommended)
- [ ] Password auth disabled (optional but recommended)
- [ ] Root login restricted (optional)

### SSL Certificate
- [ ] Certificate valid: `sudo certbot certificates`
- [ ] Auto-renewal configured: `sudo certbot renew --dry-run`
- [ ] HTTPS enforced (HTTP redirects)

---

## ☐ PERFORMANCE CHECK

### Response Times
Test with: `curl -w "@-" -o /dev/null -s https://yourdomain.com`

- [ ] Homepage: <1s
- [ ] API endpoints: <500ms
- [ ] Health check: <100ms

### Resource Usage
- [ ] CPU usage: <60% (`top`)
- [ ] Memory usage: <70% (`free -h`)
- [ ] Disk usage: <70% (`df -h`)
- [ ] Database connections: <15 (`pm2 monit`)

### Load Test (Optional)
```bash
# Install Apache Bench
apt install apache2-utils

# Test 100 requests, 10 concurrent
ab -n 100 -c 10 https://yourdomain.com/
```

- [ ] Load test completed
- [ ] No errors
- [ ] Response times acceptable

---

## ☐ DOCUMENTATION

### Save Important Information
Create a deployment record with:

- [ ] VPS IP: `_________________`
- [ ] Domain: `_________________`
- [ ] Database password: `_________________` (secure location!)
- [ ] NEXTAUTH_SECRET: `_________________` (secure location!)
- [ ] Deployment date: `_________________`
- [ ] Deployed by: `_________________`

### Document Locations
- [ ] Database credentials: `/root/electric-sojourner-config/db_credentials.txt`
- [ ] Application: `/var/www/electric-sojourner`
- [ ] Nginx config: `/etc/nginx/sites-available/electric-sojourner`
- [ ] SSL certificates: `/etc/letsencrypt/live/yourdomain.com/`
- [ ] Backups: `/root/backups/`

### Useful Commands Documented
- [ ] Restart app: `pm2 restart electric-sojourner`
- [ ] View logs: `pm2 logs electric-sojourner`
- [ ] Backup DB: `pg_dump electric_sojourner > backup.sql`
- [ ] Renew SSL: `sudo certbot renew`

---

## ☐ HANDOFF

### Team Notification
- [ ] Notify team deployment is complete
- [ ] Share production URL
- [ ] Share monitoring dashboard (if any)
- [ ] Share emergency procedures

### Known Issues Documented
From security review:

- [ ] CSRF protection disabled (for Midtrans)
- [ ] In-memory rate limiting (single server only)
- [ ] 8 security vulnerabilities to fix (see review)
- [ ] Performance optimizations needed (see review)

### Next Steps Planned
- [ ] Monitor for 24 hours
- [ ] Fix critical security issues (Week 1)
- [ ] Migrate to Redis (Month 1)
- [ ] Performance optimizations (Month 1)
- [ ] Regular security audits (Quarterly)

---

## ✅ DEPLOYMENT COMPLETE

**Deployment Status:** ☐ SUCCESS  
**Production URL:** https://_______________  
**Deployment Date:** _______________  
**Total Time:** _______ hours

**Signed off by:** _______________  
**Date:** _______________

---

## 📞 EMERGENCY CONTACTS

**VPS Provider:**
- Name: `_________________`
- Support: `_________________`
- Account: `_________________`

**Domain Registrar:**
- Name: `_________________`
- Support: `_________________`
- Account: `_________________`

**Midtrans:**
- Support: https://midtrans.com/contact-us
- Account: `_________________`

**Team:**
- Technical Lead: `_________________`
- DevOps: `_________________`
- On-call: `_________________`

---

**Checklist Version:** 1.0  
**Last Updated:** 2026-02-09  
**For:** Electric Sojourner VPS Deployment
