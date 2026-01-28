#!/bin/bash
set -e

echo "🔐 Phase 1: Security Hardening"
echo "================================"

# Generate secure new root password
NEW_ROOT_PASSWORD=$(openssl rand -base64 32)
echo "root:${NEW_ROOT_PASSWORD}" | chpasswd
echo "✅ Root password changed"
echo "New root password: ${NEW_ROOT_PASSWORD}" > /root/new_root_password.txt
chmod 600 /root/new_root_password.txt

# Create deployment user
useradd -m -s /bin/bash deployer || echo "User deployer already exists"
usermod -aG sudo deployer
echo "✅ Created deployer user"

# Generate SSH keys for deployer
sudo -u deployer mkdir -p /home/deployer/.ssh
sudo -u deployer chmod 700 /home/deployer/.ssh
echo "✅ SSH directory created for deployer"

# Update system
apt-get update
apt-get upgrade -y
echo "✅ System updated"

# Install essential packages
apt-get install -y curl wget git ufw nginx postgresql postgresql-contrib build-essential
echo "✅ Essential packages installed"

# Configure UFW firewall
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
echo "✅ Firewall configured"

echo ""
echo "📦 Phase 2: Node.js Installation"
echo "================================"

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2
echo "✅ Node.js $(node -v) and PM2 installed"

echo ""
echo "🗄️  Phase 3: PostgreSQL Setup"
echo "================================"

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE gdi_production;
CREATE USER gdi_user WITH ENCRYPTED PASSWORD '$(openssl rand -base64 24)';
GRANT ALL PRIVILEGES ON DATABASE gdi_production TO gdi_user;
ALTER DATABASE gdi_production OWNER TO gdi_user;
\q
EOF

# Save database credentials
DB_PASSWORD=$(sudo -u postgres psql -t -c "SELECT rolpassword FROM pg_authid WHERE rolname='gdi_user';" | tr -d ' ')
echo "DB_USER=gdi_user" > /root/db_credentials.txt
echo "DB_NAME=gdi_production" >> /root/db_credentials.txt
echo "✅ PostgreSQL database created"

echo ""
echo "✅ Setup Phase 1-3 Complete!"
echo ""
echo "📝 Important files created:"
echo "  - /root/new_root_password.txt (NEW ROOT PASSWORD)"
echo "  - /root/db_credentials.txt (Database credentials)"
echo ""
echo "Next: Application deployment"
