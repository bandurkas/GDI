#!/bin/bash
set -e

echo "========================================="
echo "  PHASE 4: SSL & Nginx Configuration"
echo "  Electric Sojourner Deployment"
echo "========================================="
echo "Starting at: $(date)"
echo ""

# Get domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    echo "❌ Domain name is required!"
    exit 1
fi
echo "Domain: $DOMAIN"
echo ""

# Verify DNS is configured
echo "Verifying DNS configuration..."
DNS_IP=$(dig +short $DOMAIN | head -n1)
if [ -z "$DNS_IP" ]; then
    echo "⚠️  WARNING: DNS not configured or not propagated yet"
    echo "Please ensure your domain's A record points to this server's IP"
    read -p "Continue anyway? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
else
    echo "✓ DNS resolves to: $DNS_IP"
fi
echo ""

# Create Nginx configuration
echo "[1/4] Creating Nginx configuration..."
cat > /etc/nginx/sites-available/electric-sojourner << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Increase client body size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Forward real IP
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }

    # Static files (if needed)
    location /_next/static {
        proxy_pass http://localhost:3000/_next/static;
        expires 1y;
        access_log off;
    }
}
EOF

echo "✓ Nginx config created"
echo ""

# Enable site
echo "[2/4] Enabling site..."
ln -sf /etc/nginx/sites-available/electric-sojourner /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
echo "✓ Site enabled"
echo ""

# Test Nginx configuration
echo "[3/4] Testing Nginx configuration..."
nginx -t
if [ $? -eq 0 ]; then
    echo "✓ Nginx configuration valid"
else
    echo "❌ Nginx configuration invalid!"
    exit 1
fi
echo ""

# Reload Nginx
echo "[4/4] Reloading Nginx..."
systemctl reload nginx
echo "✓ Nginx reloaded"
echo ""

echo "========================================="
echo "  Nginx Configuration Complete!"
echo "========================================="
echo ""
echo "Now installing SSL certificate..."
echo "You will be asked for:"
echo "  1. Email address (for renewal notifications)"
echo "  2. Agree to terms of service (Y)"
echo "  3. Share email with EFF (optional, N is fine)"
echo "  4. Redirect HTTP to HTTPS (choose 2 for Yes)"
echo ""
read -p "Press Enter to continue with SSL installation..."

# Install SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ SSL certificate installed successfully!"
else
    echo ""
    echo "❌ SSL installation failed!"
    echo "You can retry later with:"
    echo "  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    exit 1
fi
echo ""

# Test auto-renewal
echo "Testing SSL auto-renewal..."
certbot renew --dry-run
echo "✓ Auto-renewal configured"
echo ""

echo "========================================="
echo "  PHASE 4 COMPLETE!"
echo "========================================="
echo "Completed at: $(date)"
echo ""
echo "Validation:"
systemctl is-active nginx && echo "  ✓ Nginx: running" || echo "  ❌ Nginx: not running"
certbot certificates 2>&1 | grep -q "$DOMAIN" && echo "  ✓ SSL certificate: installed" || echo "  ❌ SSL certificate: not found"
echo ""
echo "Testing HTTPS..."
curl -I https://$DOMAIN 2>&1 | grep -q "200\|502" && echo "  ✓ HTTPS: accessible (502 is OK, app not started yet)" || echo "  ⚠️  HTTPS: check manually"
echo ""
echo "Your site should now be accessible at:"
echo "  https://$DOMAIN"
echo ""
echo "Next step: Run phase5-start-app.sh"
echo "========================================="
