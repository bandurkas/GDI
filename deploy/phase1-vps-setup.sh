#!/bin/bash
set -e  # Exit on any error

echo "========================================="
echo "  PHASE 1: VPS Preparation"
echo "  Electric Sojourner Deployment"
echo "========================================="
echo "Starting at: $(date)"
echo ""

# Update system
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y
echo "✓ System updated"
echo ""

# Install Node.js 18.x
echo "[2/8] Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node_version=$(node -v)
echo "✓ Node.js installed: $node_version"
echo ""

# Install PostgreSQL
echo "[3/8] Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
echo "✓ PostgreSQL installed and running"
echo ""

# Install Nginx
echo "[4/8] Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✓ Nginx installed and running"
echo ""

# Install Certbot for SSL
echo "[5/8] Installing Certbot..."
apt install -y certbot python3-certbot-nginx
echo "✓ Certbot installed"
echo ""

# Install PM2 globally
echo "[6/8] Installing PM2..."
npm install -g pm2
echo "✓ PM2 installed: $(pm2 -v)"
echo ""

# Create app directory
echo "[7/8] Creating application directory..."
mkdir -p /var/www/electric-sojourner
chown -R $USER:$USER /var/www/electric-sojourner
echo "✓ App directory created: /var/www/electric-sojourner"
echo ""

# Install git
echo "[8/8] Installing git..."
apt install -y git
echo "✓ Git installed: $(git --version)"
echo ""

echo "========================================="
echo "  PHASE 1 COMPLETE!"
echo "========================================="
echo "Completed at: $(date)"
echo ""
echo "Installed software:"
echo "  ✓ Node.js: $(node -v)"
echo "  ✓ npm: $(npm -v)"
echo "  ✓ PostgreSQL: $(psql --version | head -n1)"
echo "  ✓ Nginx: $(nginx -v 2>&1)"
echo "  ✓ PM2: $(pm2 -v)"
echo "  ✓ Git: $(git --version)"
echo ""
echo "Validation:"
systemctl is-active postgresql && echo "  ✓ PostgreSQL: running" || echo "  ❌ PostgreSQL: not running"
systemctl is-active nginx && echo "  ✓ Nginx: running" || echo "  ❌ Nginx: not running"
[ -d /var/www/electric-sojourner ] && echo "  ✓ App directory: exists" || echo "  ❌ App directory: missing"
echo ""
echo "Next step: Run phase2-database.sh"
echo "========================================="
