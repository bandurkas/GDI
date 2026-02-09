# Quick Deployment Reference

## 🚀 One-Command Deployment Summary

```bash
# Phase 1: VPS Setup (30-40 min)
ssh root@YOUR_VPS_IP
bash <(curl -s https://raw.githubusercontent.com/YOUR_REPO/deploy/phase1-vps-setup.sh)

# Phase 2: Database (20-30 min)
bash phase2-database.sh
# ⚠️ SAVE THE PASSWORD!

# Phase 3: Deploy App (30-40 min)
# First: Upload code and create .env
bash phase3-deploy-app.sh

# Phase 4: SSL & Nginx (20-30 min)
bash phase4-ssl-nginx.sh

# Phase 5: Start App (20-30 min)
bash phase5-start-app.sh
```

## 📝 Critical Information to Prepare

Before starting, have these ready:

1. **VPS Details**
   - IP Address: `_________________`
   - SSH User: `root`
   - SSH Password/Key: `_________________`

2. **Domain**
   - Domain name: `_________________`
   - DNS A record pointing to VPS IP: ☐ Done

3. **Midtrans Production Keys**
   - Server Key: `_________________`
   - Client Key: `_________________`

4. **Email for SSL**
   - Email: `_________________`

## ⚡ Quick Commands

### Monitoring
```bash
pm2 status                    # App status
pm2 logs                      # View logs
pm2 logs --err                # Errors only
pm2 monit                     # Resource monitor
```

### Restart
```bash
pm2 restart electric-sojourner    # Restart app
sudo systemctl restart postgresql  # Restart DB
sudo systemctl restart nginx       # Restart Nginx
```

### Backup
```bash
# Database
pg_dump electric_sojourner > backup_$(date +%Y%m%d).sql

# Application
tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/electric-sojourner
```

### Logs
```bash
# Application logs
pm2 logs electric-sojourner

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

## 🔍 Validation Checklist

After each phase:

### Phase 1 ✓
- [ ] Node.js installed (v18+)
- [ ] PostgreSQL running
- [ ] Nginx running
- [ ] PM2 installed
- [ ] App directory exists

### Phase 2 ✓
- [ ] Database created
- [ ] User created
- [ ] Password saved
- [ ] Connection test passed

### Phase 3 ✓
- [ ] Code deployed
- [ ] .env file created
- [ ] Dependencies installed
- [ ] Migrations completed
- [ ] Application built

### Phase 4 ✓
- [ ] DNS configured
- [ ] Nginx configured
- [ ] SSL installed
- [ ] HTTPS works

### Phase 5 ✓
- [ ] App started with PM2
- [ ] Health check passes
- [ ] All tests pass
- [ ] Midtrans webhook configured

## 🚨 Emergency Procedures

### App Crashed
```bash
pm2 restart electric-sojourner
pm2 logs --err --lines 100
```

### Database Issues
```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### 502 Bad Gateway
```bash
# Check app is running
pm2 status

# Check Nginx
sudo nginx -t
sudo systemctl restart nginx
```

### Out of Memory
```bash
# Check memory
free -h

# Restart app
pm2 restart electric-sojourner --max-memory-restart 1G
```

### Disk Full
```bash
# Check disk
df -h

# Clean logs
pm2 flush
sudo journalctl --vacuum-time=7d
```

## 📊 Health Check URLs

After deployment, test these:

- Health: `https://yourdomain.com/api/health`
- Homepage: `https://yourdomain.com`
- Products: `https://yourdomain.com/api/products`
- Login: `https://yourdomain.com/auth/login`

## 🔐 Security Notes

1. **CSRF Disabled** - Intentionally for Midtrans integration
2. **Rate Limiting** - In-memory (single server only)
3. **SSL** - Auto-renews via certbot
4. **Database** - Strong password generated
5. **Secrets** - Stored in .env (not in git)

## 📞 Support Contacts

- VPS Provider: `_________________`
- Domain Registrar: `_________________`
- Midtrans Support: https://midtrans.com/contact-us

## 🎯 Success Criteria

Deployment is successful when:

- ✅ Site loads via HTTPS
- ✅ Can register user
- ✅ Can browse products
- ✅ Can add to cart
- ✅ Can checkout (test transaction)
- ✅ Webhook processes order
- ✅ No errors in logs for 1 hour

---

**Total Time:** 2-3 hours  
**Difficulty:** Medium  
**Risk Level:** Medium-High (financial app)

**Good luck! 🚀**
