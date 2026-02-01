---
description: Deploy application to production VPS
---

# Deploy to Production VPS

This workflow ensures a clean, consistent deployment to the production VPS at gdiconsult.online.

## Prerequisites

- SSH access to root@31.97.105.238
- Password: `w7XBiu++Ph4t4dlB1nWRMwzznowtt6k5`
- Latest changes committed and pushed to GitHub

## Deployment Steps

### 1. Commit and Push Local Changes

```bash
git add .
git commit -m "Your commit message"
git push origin feat/forgot-password-and-auth-fixes
```

### 2. Run the Deployment Script on VPS

// turbo
```bash
ssh root@31.97.105.238 "bash -s" < deploy.sh
```

### 3. Verify Deployment

Check that the application is running:

```bash
ssh root@31.97.105.238 "pm2 list && curl -I http://localhost:3001"
```

### 4. Test the Domain

Open https://gdiconsult.online/ in your browser and verify:
- Homepage loads correctly
- Content matches your local environment
- No console errors
- Navigation works

## Troubleshooting

### If deployment fails:

1. Check PM2 logs:
```bash
ssh root@31.97.105.238 "pm2 logs electric-sojourner --lines 50"
```

2. Check if the app is listening on port 3001:
```bash
ssh root@31.97.105.238 "netstat -tlnp | grep 3001"
```

3. Check nginx status:
```bash
ssh root@31.97.105.238 "nginx -t && systemctl status nginx"
```

### If domain shows old content:

This should not happen anymore with the automated deployment script, but if it does:

1. Check PM2 processes:
```bash
ssh root@31.97.105.238 "pm2 list"
```

2. Verify nginx is proxying to port 3001:
```bash
ssh root@31.97.105.238 "cat /etc/nginx/sites-available/gdi | grep proxy_pass"
```

Should show: `proxy_pass http://localhost:3001;`

## Rollback

If you need to rollback to a previous version:

```bash
ssh root@31.97.105.238 "cd electric-sojourner && git checkout <commit-hash> && npm run build && pm2 restart electric-sojourner"
```
