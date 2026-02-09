#!/bin/bash
set -e

echo "========================================="
echo "  PHASE 2: Database Setup"
echo "  Electric Sojourner Deployment"
echo "========================================="
echo "Starting at: $(date)"
echo ""

# Generate strong password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Generated database password (SAVE THIS!):"
echo "  $DB_PASSWORD"
echo ""
read -p "Press Enter to continue..."

# Create database and user
echo "[1/4] Creating database and user..."
sudo -u postgres psql << EOF
-- Drop if exists (for clean reinstall)
DROP DATABASE IF EXISTS electric_sojourner;
DROP USER IF EXISTS appuser;

-- Create database
CREATE DATABASE electric_sojourner;

-- Create user
CREATE USER appuser WITH PASSWORD '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE electric_sojourner TO appuser;

-- Connect to database
\c electric_sojourner

-- Grant schema privileges (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO appuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO appuser;

-- Verify
SELECT 'Database created: electric_sojourner' as status;
SELECT 'User created: appuser' as status;
EOF

echo "✓ Database and user created"
echo ""

# Test connection
echo "[2/4] Testing database connection..."
PGPASSWORD=$DB_PASSWORD psql -U appuser -d electric_sojourner -c "SELECT 'Connection successful!' as status;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "❌ Database connection failed!"
    exit 1
fi
echo ""

# Configure PostgreSQL for better performance
echo "[3/4] Optimizing PostgreSQL configuration..."
PG_CONF=$(find /etc/postgresql -name postgresql.conf | head -n1)
cat >> $PG_CONF << 'EOF'

# Performance tuning for Electric Sojourner
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
EOF

systemctl restart postgresql
echo "✓ PostgreSQL optimized and restarted"
echo ""

# Save credentials
echo "[4/4] Saving database credentials..."
mkdir -p /root/electric-sojourner-config
cat > /root/electric-sojourner-config/db_credentials.txt << EOF
========================================
DATABASE CREDENTIALS
========================================
Database: electric_sojourner
User: appuser
Password: $DB_PASSWORD

Connection String:
postgresql://appuser:$DB_PASSWORD@localhost:5432/electric_sojourner?connection_limit=20&pool_timeout=20

For .env file:
DATABASE_URL="postgresql://appuser:$DB_PASSWORD@localhost:5432/electric_sojourner?connection_limit=20&pool_timeout=20"
========================================
EOF

chmod 600 /root/electric-sojourner-config/db_credentials.txt
echo "✓ Credentials saved to /root/electric-sojourner-config/db_credentials.txt"
echo ""

echo "========================================="
echo "  PHASE 2 COMPLETE!"
echo "========================================="
echo "Completed at: $(date)"
echo ""
echo "Database Details:"
echo "  Name: electric_sojourner"
echo "  User: appuser"
echo "  Password: $DB_PASSWORD"
echo ""
echo "⚠️  IMPORTANT: Save this password!"
echo ""
echo "Connection string for .env:"
echo "DATABASE_URL=\"postgresql://appuser:$DB_PASSWORD@localhost:5432/electric_sojourner?connection_limit=20&pool_timeout=20\""
echo ""
echo "Credentials also saved to:"
echo "  /root/electric-sojourner-config/db_credentials.txt"
echo ""
echo "Validation:"
PGPASSWORD=$DB_PASSWORD psql -U appuser -d electric_sojourner -c "SELECT 'Database accessible' as status;" 2>&1 | grep "Database accessible" && echo "  ✓ Database: accessible" || echo "  ❌ Database: not accessible"
echo ""
echo "Next step: Run phase3-deploy-app.sh"
echo "========================================="
