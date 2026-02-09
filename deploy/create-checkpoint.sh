#!/bin/bash
set -e

echo "========================================="
echo "  VPS CHECKPOINT - Create Backup"
echo "  Electric Sojourner"
echo "========================================="
echo "Starting at: $(date)"
echo ""

# Configuration
BACKUP_DIR="/root/backups/checkpoint_$(date +%Y%m%d_%H%M%S)"
APP_DIR="/root/electric-sojourner"

echo "Creating checkpoint backup..."
echo "Backup location: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Backup Database
echo "[1/6] Backing up database..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gdi_production; then
    sudo -u postgres pg_dump gdi_production > "$BACKUP_DIR/database.sql"
    echo "✓ Database backed up: $(du -h $BACKUP_DIR/database.sql | cut -f1)"
else
    echo "⚠️  Database not found (this may be first deployment)"
fi
echo ""

# 2. Backup Application Files
echo "[2/6] Backing up application files..."
if [ -d "$APP_DIR" ]; then
    tar -czf "$BACKUP_DIR/application.tar.gz" \
        -C "$APP_DIR" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='*.log' \
        .
    echo "✓ Application backed up: $(du -h $BACKUP_DIR/application.tar.gz | cut -f1)"
else
    echo "⚠️  Application directory not found (this may be first deployment)"
fi
echo ""

# 3. Backup Environment File
echo "[3/6] Backing up environment file..."
if [ -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env" "$BACKUP_DIR/env.backup"
    chmod 600 "$BACKUP_DIR/env.backup"
    echo "✓ Environment file backed up"
else
    echo "⚠️  .env file not found"
fi
echo ""

# 4. Backup Nginx Configuration
echo "[4/6] Backing up Nginx configuration..."
if [ -f "/etc/nginx/sites-available/gdi" ]; then
    cp "/etc/nginx/sites-available/gdi" "$BACKUP_DIR/nginx.conf"
    echo "✓ Nginx config backed up"
else
    echo "⚠️  Nginx config not found (this may be first deployment)"
fi
echo ""

# 5. Backup PM2 Configuration
echo "[5/6] Backing up PM2 state..."
if command -v pm2 &> /dev/null; then
    pm2 save
    if [ -f "/root/.pm2/dump.pm2" ]; then
        cp "/root/.pm2/dump.pm2" "$BACKUP_DIR/pm2_dump.pm2"
        echo "✓ PM2 state backed up"
    fi
else
    echo "⚠️  PM2 not installed yet"
fi
echo ""

# 6. Backup SSL Certificates (metadata only)
echo "[6/6] Backing up SSL certificate info..."
if command -v certbot &> /dev/null; then
    certbot certificates > "$BACKUP_DIR/ssl_certificates.txt" 2>&1 || true
    echo "✓ SSL certificate info saved"
else
    echo "⚠️  Certbot not installed yet"
fi
echo ""

# Create restore script
echo "Creating restore script..."
cat > "$BACKUP_DIR/RESTORE.sh" << 'RESTORE_SCRIPT'
#!/bin/bash
set -e

echo "========================================="
echo "  RESTORING FROM CHECKPOINT"
echo "========================================="
echo ""

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/root/electric-sojourner"

echo "Restoring from: $BACKUP_DIR"
echo ""
read -p "This will overwrite current installation. Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 1
fi

# Stop application
echo "[1/5] Stopping application..."
pm2 stop electric-sojourner 2>/dev/null || true
echo "✓ Application stopped"

# Restore database
if [ -f "$BACKUP_DIR/database.sql" ]; then
    echo "[2/5] Restoring database..."
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS gdi_production;"
    sudo -u postgres psql -c "CREATE DATABASE gdi_production;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gdi_production TO appuser;"
    sudo -u postgres psql -d gdi_production < "$BACKUP_DIR/database.sql"
    echo "✓ Database restored"
else
    echo "[2/5] ⚠️  No database backup found"
fi

# Restore application
if [ -f "$BACKUP_DIR/application.tar.gz" ]; then
    echo "[3/5] Restoring application..."
    rm -rf "$APP_DIR"
    mkdir -p "$APP_DIR"
    tar -xzf "$BACKUP_DIR/application.tar.gz" -C "$APP_DIR"
    echo "✓ Application restored"
else
    echo "[3/5] ⚠️  No application backup found"
fi

# Restore environment
if [ -f "$BACKUP_DIR/env.backup" ]; then
    echo "[4/5] Restoring environment file..."
    cp "$BACKUP_DIR/env.backup" "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
    echo "✓ Environment file restored"
else
    echo "[4/5] ⚠️  No .env backup found"
fi

# Restore Nginx config
if [ -f "$BACKUP_DIR/nginx.conf" ]; then
    echo "[5/5] Restoring Nginx configuration..."
    cp "$BACKUP_DIR/nginx.conf" "/etc/nginx/sites-available/gdi"
    ln -sf "/etc/nginx/sites-available/gdi" "/etc/nginx/sites-enabled/"
    nginx -t && systemctl reload nginx
    echo "✓ Nginx config restored"
else
    echo "[5/5] ⚠️  No Nginx config backup found"
fi

# Reinstall dependencies and rebuild
echo ""
echo "Reinstalling dependencies..."
cd "$APP_DIR"
npm ci
npx prisma generate
npm run build

# Restart application
echo ""
echo "Restarting application..."
pm2 restart electric-sojourner || pm2 start npm --name "electric-sojourner" -- start -- -p 3001
pm2 save

echo ""
echo "========================================="
echo "  RESTORE COMPLETE!"
echo "========================================="
echo ""
echo "Application restored from checkpoint"
echo "Please verify: curl http://localhost:3001/api/health"
RESTORE_SCRIPT

chmod +x "$BACKUP_DIR/RESTORE.sh"
echo "✓ Restore script created"
echo ""

# Create backup summary
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
========================================
CHECKPOINT BACKUP INFORMATION
========================================
Created: $(date)
Backup Location: $BACKUP_DIR

Contents:
$(ls -lh "$BACKUP_DIR")

To restore this checkpoint:
  bash $BACKUP_DIR/RESTORE.sh

Files backed up:
EOF

if [ -f "$BACKUP_DIR/database.sql" ]; then
    echo "  ✓ Database ($(du -h $BACKUP_DIR/database.sql | cut -f1))" >> "$BACKUP_DIR/BACKUP_INFO.txt"
fi
if [ -f "$BACKUP_DIR/application.tar.gz" ]; then
    echo "  ✓ Application ($(du -h $BACKUP_DIR/application.tar.gz | cut -f1))" >> "$BACKUP_DIR/BACKUP_INFO.txt"
fi
if [ -f "$BACKUP_DIR/env.backup" ]; then
    echo "  ✓ Environment file" >> "$BACKUP_DIR/BACKUP_INFO.txt"
fi
if [ -f "$BACKUP_DIR/nginx.conf" ]; then
    echo "  ✓ Nginx configuration" >> "$BACKUP_DIR/BACKUP_INFO.txt"
fi

echo "========================================="
echo "  CHECKPOINT CREATED SUCCESSFULLY!"
echo "========================================="
echo ""
echo "Backup location: $BACKUP_DIR"
echo "Total size: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "Backup contents:"
ls -lh "$BACKUP_DIR"
echo ""
echo "To restore this checkpoint:"
echo "  bash $BACKUP_DIR/RESTORE.sh"
echo ""
echo "Backup info saved to:"
echo "  $BACKUP_DIR/BACKUP_INFO.txt"
echo ""
echo "========================================="
echo "You can now safely proceed with deployment"
echo "========================================="
