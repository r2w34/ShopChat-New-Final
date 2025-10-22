#!/bin/bash

# Docker Deployment Script for ShopChat AI
# Production deployment on VPS with Docker

set -e  # Exit on error

echo "🐳 ShopChat AI - Docker Deployment Script"
echo "=========================================="
echo ""

# Configuration
VPS_HOST="root@72.60.99.154"
VPS_PASSWORD="Kalilinux@2812"
APP_DIR="/var/www/shopchat-new-docker"
DOMAIN="shopchat-new.indigenservices.com"

echo "📋 Configuration:"
echo "  VPS: 72.60.99.154"
echo "  Domain: $DOMAIN"
echo "  App Directory: $APP_DIR"
echo ""

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass is not installed. Installing..."
    sudo apt-get update && sudo apt-get install -y sshpass
fi

echo "1️⃣  Preparing deployment package..."
# Create a clean tarball excluding unnecessary files
tar -czf /tmp/shopchat-docker.tar.gz \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='build' \
    --exclude='.env' \
    --exclude='*.md' \
    --exclude='data' \
    --exclude='.cache' \
    .

echo "✅ Package created: $(du -h /tmp/shopchat-docker.tar.gz | cut -f1)"

echo ""
echo "2️⃣  Connecting to VPS..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_HOST << 'ENDSSH'
set -e

echo "✅ Connected to VPS"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo "✅ Docker installed"
else
    echo "✅ Docker is already installed"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose is already installed"
fi

echo ""
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"

ENDSSH

echo ""
echo "3️⃣  Uploading application files..."
sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no /tmp/shopchat-docker.tar.gz $VPS_HOST:/tmp/

echo "✅ Files uploaded"

echo ""
echo "4️⃣  Setting up application on VPS..."

sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no $VPS_HOST << ENDSSH
set -e

APP_DIR="$APP_DIR"
DOMAIN="$DOMAIN"

# Stop old PM2 process if running
if command -v pm2 &> /dev/null; then
    echo "🛑 Stopping old PM2 process..."
    pm2 stop shopchat-new 2>/dev/null || true
    pm2 delete shopchat-new 2>/dev/null || true
fi

# Create app directory
echo "📁 Creating application directory..."
mkdir -p \$APP_DIR
cd \$APP_DIR

# Extract files
echo "📦 Extracting files..."
tar -xzf /tmp/shopchat-docker.tar.gz -C \$APP_DIR
rm /tmp/shopchat-docker.tar.gz

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p nginx/ssl
mkdir -p logs

# Copy database from old location if exists
if [ -f "/var/www/shopchat-new/data/production.sqlite" ]; then
    echo "📊 Copying existing database..."
    cp /var/www/shopchat-new/data/production.sqlite data/
    echo "✅ Database copied"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from old location..."
    if [ -f "/var/www/shopchat-new/.env" ]; then
        cp /var/www/shopchat-new/.env .env
        echo "✅ .env file copied"
    else
        echo "❌ No .env file found! Please create one."
        exit 1
    fi
fi

# Update .env file for Docker
echo "🔧 Updating environment variables..."
sed -i "s|DATABASE_URL=.*|DATABASE_URL=file:/app/data/production.sqlite|g" .env
sed -i "s|HOST=.*|HOST=https://\$DOMAIN|g" .env
sed -i "s|SHOPIFY_APP_URL=.*|SHOPIFY_APP_URL=https://\$DOMAIN|g" .env

# Copy SSL certificates
echo "🔒 Setting up SSL certificates..."
if [ -d "/etc/letsencrypt/live/\$DOMAIN" ]; then
    cp /etc/letsencrypt/live/\$DOMAIN/fullchain.pem nginx/ssl/
    cp /etc/letsencrypt/live/\$DOMAIN/privkey.pem nginx/ssl/
    echo "✅ SSL certificates copied"
else
    echo "⚠️  SSL certificates not found. You'll need to set them up."
fi

echo ""
echo "5️⃣  Building Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache

echo ""
echo "6️⃣  Starting Docker containers..."
docker-compose up -d

echo ""
echo "7️⃣  Waiting for application to start..."
sleep 10

# Check if containers are running
echo "📊 Container status:"
docker-compose ps

echo ""
echo "8️⃣  Checking application health..."
sleep 5

if curl -f -s http://localhost:3003/health > /dev/null; then
    echo "✅ Application is healthy!"
else
    echo "⚠️  Health check failed. Checking logs..."
    docker-compose logs --tail=50 shopchat-app
fi

echo ""
echo "9️⃣  Cleaning up..."
docker system prune -f

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Access your application:"
echo "  - Production URL: https://\$DOMAIN"
echo "  - Health Check: https://\$DOMAIN/health"
echo "  - Socket.IO: https://\$DOMAIN/socket/status"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo "  - Start: docker-compose up -d"
echo ""

ENDSSH

echo ""
echo "🎉 Deployment finished!"
echo ""
echo "Next steps:"
echo "1. Visit https://$DOMAIN to verify deployment"
echo "2. Check admin dashboard in Shopify"
echo "3. Test widget on storefront"
echo ""
