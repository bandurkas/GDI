# 5-Phase VPS Deployment Scripts

This directory contains the deployment scripts for Electric Sojourner.

## 📋 Prerequisites

Before starting:
- VPS with Ubuntu 20.04+ or Debian 11+
- Root SSH access
- Domain name pointed to VPS IP
- Midtrans production keys ready

## 🚀 Deployment Steps

### Phase 1: VPS Preparation (30-40 min)
Installs Node.js, PostgreSQL, Nginx, Certbot, PM2, Git

```bash
ssh root@YOUR_VPS_IP
bash phase1-vps-setup.sh
```

**Success criteria:**
- ✅ All services installed and running
- ✅ App directory created

---

### Phase 2: Database Setup (20-30 min)
Creates database, user, and configures PostgreSQL

```bash
bash phase2-database.sh
```

**Important:** Save the database password shown in output!

**Success criteria:**
- ✅ Database created
- ✅ User created
- ✅ Connection test passed
- ✅ Credentials saved

---

### Phase 3: Application Deployment (30-40 min)
Deploys code, installs dependencies, runs migrations, builds app

**First, upload your code:**

```bash
# Option A: Using Git
cd /var/www/electric-sojourner
git clone YOUR_REPO_URL .

# Option B: Using SCP (from local machine)
tar --exclude='node_modules' --exclude='.next' -czf deploy.tar.gz .
scp deploy.tar.gz root@YOUR_VPS_IP:/var/www/electric-sojourner/
ssh root@YOUR_VPS_IP
cd /var/www/electric-sojourner
tar -xzf deploy.tar.gz
```

**Create .env file:**

```bash
cd /var/www/electric-sojourner
nano .env
```

Paste this (replace with your values):

```env
DATABASE_URL="postgresql://appuser:YOUR_PASSWORD@localhost:5432/electric_sojourner?connection_limit=20&pool_timeout=20"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="YOUR_GENERATED_SECRET"
MIDTRANS_SERVER_KEY="your-production-server-key"
MIDTRANS_CLIENT_KEY="your-production-client-key"
MIDTRANS_IS_PRODUCTION="true"
NODE_ENV="production"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

**Run deployment:**

```bash
bash phase3-deploy-app.sh
```

**Success criteria:**
- ✅ Dependencies installed
- ✅ Prisma client generated
- ✅ Migrations completed
- ✅ Application built
- ✅ Database connection works

---

### Phase 4: SSL & Nginx (20-30 min)
Configures Nginx reverse proxy and installs SSL certificate

**Before running:** Ensure DNS A record points to your VPS IP

```bash
bash phase4-ssl-nginx.sh
```

You'll be prompted for:
- Domain name
- Email (for SSL renewal notifications)
- Agreement to terms

**Success criteria:**
- ✅ Nginx configured
- ✅ SSL certificate installed
- ✅ HTTPS accessible
- ✅ Auto-renewal configured

---

### Phase 5: Start Application (20-30 min)
Starts app with PM2, runs validation tests

```bash
bash phase5-start-app.sh
```

**Success criteria:**
- ✅ Application running
- ✅ PM2 configured for auto-start
- ✅ Health check passes
- ✅ All validation tests pass

---

## ✅ Post-Deployment

### Configure Midtrans Webhook

1. Go to Midtrans Dashboard: https://dashboard.midtrans.com
2. Settings > Configuration
3. Set Notification URL: `https://yourdomain.com/api/webhooks/midtrans`
4. Save

### Test Critical Flows

1. User registration
2. Product browsing
3. Add to cart
4. Checkout (test transaction)
5. Webhook processing
6. Payout request

### Monitoring Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs electric-sojourner

# View errors only
pm2 logs electric-sojourner --err

# Monitor resources
pm2 monit

# Restart application
pm2 restart electric-sojourner
```

### Backup Commands

```bash
# Backup database
pg_dump electric_sojourner > /root/backup_$(date +%Y%m%d).sql

# Backup application
tar -czf /root/app_backup_$(date +%Y%m%d).tar.gz /var/www/electric-sojourner
```

---

## 🚨 Troubleshooting

### Application won't start
```bash
pm2 logs electric-sojourner --err --lines 100
# Check for missing env vars or build errors
```

### Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
cat /root/electric-sojourner-config/db_credentials.txt
# Use credentials to test manually
```

### 502 Bad Gateway
```bash
# App not running
pm2 restart electric-sojourner

# Check logs
pm2 logs --err
```

### SSL issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate
sudo certbot certificates
```

---

## 📊 Success Metrics

After deployment, verify:

- ✅ Site accessible via HTTPS
- ✅ Health endpoint returns 200
- ✅ Can complete test transaction
- ✅ Webhook processes correctly
- ✅ No errors in logs for 1 hour
- ✅ All critical flows work

---

## 🔄 Rollback Procedures

### Rollback Phase 5 (App)
```bash
pm2 stop electric-sojourner
pm2 delete electric-sojourner
```

### Rollback Phase 4 (SSL/Nginx)
```bash
rm /etc/nginx/sites-enabled/electric-sojourner
sudo systemctl reload nginx
sudo certbot delete --cert-name yourdomain.com
```

### Rollback Phase 3 (App Deployment)
```bash
cd /var/www/electric-sojourner
rm -rf node_modules .next
```

### Rollback Phase 2 (Database)
```bash
sudo -u postgres psql -c "DROP DATABASE electric_sojourner;"
sudo -u postgres psql -c "DROP USER appuser;"
```

---

## 📞 Support

If you encounter issues:

1. Check logs: `pm2 logs --err`
2. Check services: `systemctl status postgresql nginx`
3. Check disk: `df -h`
4. Check memory: `free -h`
5. Restart: `pm2 restart all`

---

**Total deployment time:** 2-3 hours  
**Difficulty:** Medium  
**Risk:** Medium (financial application)

**Good luck with your deployment! 🚀**
