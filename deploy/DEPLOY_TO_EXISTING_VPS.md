# Quick Deployment to Existing VPS

**Date:** 2026-02-09  
**Purpose:** Deploy new build to existing VPS with rollback capability

---

## 🎯 DEPLOYMENT STEPS

### Step 1: Create Checkpoint (Backup Current State)

**On VPS:**

```bash
ssh root@YOUR_VPS_IP
cd /var/www/electric-sojourner
bash deploy/create-checkpoint.sh
```

**What it backs up:**
- ✅ Database (complete dump)
- ✅ Application files (excluding node_modules, .next)
- ✅ Environment variables (.env)
- ✅ Nginx configuration
- ✅ PM2 state
- ✅ SSL certificate info

**Output:**
```
Checkpoint created: /root/backups/checkpoint_20260209_220000
Total size: ~50MB
Restore command: bash /root/backups/checkpoint_20260209_220000/RESTORE.sh
```

**⚠️ IMPORTANT:** Save the checkpoint path!

---

### Step 2: Upload New Code

**Option A: Using Git (Recommended)**

```bash
# On local machine
git add .
git commit -m "Deploy new build - $(date +%Y%m%d)"
git push origin main

# VPS will pull in next step
```

**Option B: Using SCP**

```bash
# On local machine
cd /path/to/electric-sojourner

# Create deployment package
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='deploy/create-checkpoint.sh' \
    --exclude='deploy/deploy-new-build.sh' \
    -czf deploy-$(date +%Y%m%d).tar.gz .

# Upload to VPS
scp deploy-$(date +%Y%m%d).tar.gz root@YOUR_VPS_IP:/tmp/

# On VPS
ssh root@YOUR_VPS_IP
cd /var/www/electric-sojourner
tar -xzf /tmp/deploy-$(date +%Y%m%d).tar.gz
rm /tmp/deploy-$(date +%Y%m%d).tar.gz
```

---

### Step 3: Deploy New Build

**On VPS:**

```bash
cd /var/www/electric-sojourner
bash deploy/deploy-new-build.sh
```

**What it does:**
1. Pulls latest code (if using git)
2. Stops application
3. Cleans old build
4. Installs dependencies
5. Generates Prisma client
6. Runs database migrations
7. Builds application
8. Starts application
9. Tests health endpoint

**Expected output:**
```
[1/8] Pulling latest code... ✓
[2/8] Stopping application... ✓
[3/8] Cleaning old build... ✓
[4/8] Installing dependencies... ✓ (5-10 min)
[5/8] Generating Prisma client... ✓
[6/8] Running migrations... ✓
[7/8] Building application... ✓ (5-10 min)
[8/8] Starting application... ✓

Health check: PASSED ✓

DEPLOYMENT SUCCESSFUL! 🎉
```

**Total time:** 15-20 minutes

---

### Step 4: Validate Deployment

**Run these tests:**

```bash
# 1. Check application status
pm2 status

# 2. Test health endpoint
curl http://localhost:3000/api/health

# 3. Test HTTPS
curl https://yourdomain.com/api/health

# 4. Check logs for errors
pm2 logs electric-sojourner --lines 50

# 5. Monitor for 5 minutes
pm2 monit
```

**Manual testing:**
- [ ] Visit homepage: https://yourdomain.com
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can login
- [ ] Test checkout flow
- [ ] Verify webhook processing

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails or issues occur:

### Automatic Rollback

The deployment script will offer to rollback automatically if health check fails.

### Manual Rollback

```bash
# Find latest checkpoint
ls -lt /root/backups/checkpoint_*

# Restore from checkpoint
bash /root/backups/checkpoint_TIMESTAMP/RESTORE.sh
```

**What restore does:**
1. Stops application
2. Restores database
3. Restores application files
4. Restores .env file
5. Restores Nginx config
6. Reinstalls dependencies
7. Rebuilds application
8. Restarts application

**Restore time:** 10-15 minutes

---

## 📊 DEPLOYMENT CHECKLIST

### Before Deployment
- [ ] Checkpoint created successfully
- [ ] Checkpoint path saved
- [ ] New code committed/uploaded
- [ ] Team notified of deployment
- [ ] Low traffic period (if possible)

### During Deployment
- [ ] Deployment script completed without errors
- [ ] Health check passed
- [ ] PM2 shows app as "online"
- [ ] No errors in logs

### After Deployment
- [ ] All manual tests passed
- [ ] Monitored for 30 minutes
- [ ] No errors in production logs
- [ ] Performance acceptable
- [ ] Checkpoint can be deleted (after 24h)

---

## 🚨 TROUBLESHOOTING

### Build Fails

```bash
# Check Node.js version
node -v  # Should be v18+

# Check memory
free -h

# If out of memory, add swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Retry build
npm run build
```

### Migration Fails

```bash
# Check database connection
psql -U appuser -d electric_sojourner -c "SELECT 1;"

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Retry migrations
npx prisma migrate deploy
```

### Health Check Fails

```bash
# Check logs
pm2 logs electric-sojourner --err --lines 100

# Check if app is running
pm2 status

# Restart app
pm2 restart electric-sojourner

# Check port
lsof -i:3000
```

### App Won't Start

```bash
# Check for errors
pm2 logs --err

# Delete and restart
pm2 delete electric-sojourner
pm2 start npm --name "electric-sojourner" -- start

# Check environment
cat .env
```

---

## 📝 DEPLOYMENT LOG

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Checkpoint Path:** _______________  
**Deployment Status:** ☐ SUCCESS ☐ FAILED ☐ ROLLED BACK  

**Issues Encountered:**
_________________________________________________________________
_________________________________________________________________

**Resolution:**
_________________________________________________________________
_________________________________________________________________

**Deployment Time:** _______ minutes  
**Downtime:** _______ minutes  

---

## 🔍 POST-DEPLOYMENT MONITORING

### First Hour
- [ ] Check logs every 15 minutes
- [ ] Monitor error rate
- [ ] Check response times
- [ ] Verify webhook processing

### First 24 Hours
- [ ] Check logs every 4 hours
- [ ] Monitor database performance
- [ ] Check disk space
- [ ] Verify all critical flows

### After 24 Hours
- [ ] Review deployment log
- [ ] Delete checkpoint (if stable)
- [ ] Document any issues
- [ ] Update team

---

## 📞 EMERGENCY CONTACTS

**If deployment fails:**

1. **Immediate:** Rollback using checkpoint
2. **Check:** Deployment log at `/root/deploy_TIMESTAMP.log`
3. **Review:** PM2 logs for errors
4. **Contact:** Technical lead if rollback fails

---

## ✅ SUCCESS CRITERIA

Deployment is successful when:

- ✅ Health check returns 200 OK
- ✅ PM2 shows app as "online"
- ✅ No errors in logs for 30 minutes
- ✅ All manual tests pass
- ✅ Response times acceptable (<1s)
- ✅ Webhook processing works

---

**Quick Commands:**

```bash
# Create checkpoint
bash deploy/create-checkpoint.sh

# Deploy new build
bash deploy/deploy-new-build.sh

# Rollback
bash /root/backups/checkpoint_TIMESTAMP/RESTORE.sh

# Monitor
pm2 logs electric-sojourner
pm2 monit

# Restart
pm2 restart electric-sojourner
```

---

**Good luck with your deployment! 🚀**
