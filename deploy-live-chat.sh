#!/bin/bash

# AI Sales Agent & Live Chat - Deployment Script
# Deploys all components to production server

set -e  # Exit on error

SERVER="root@72.60.99.154"
PASSWORD="Kalilinux@2812"
APP_DIR="/var/www/shopchat-new"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🚀 AI Sales Agent & Live Chat - Deployment Script       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Upload Schema
echo "📤 Step 1/7: Uploading enhanced database schema..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  schema.prisma \
  $SERVER:$APP_DIR/prisma/
echo "✅ Schema uploaded"
echo ""

# Step 2: Upload Services
echo "📤 Step 2/7: Uploading AI services..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $APP_DIR/app/services"
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  ai-sales-agent.server.ts \
  shopify-products.server.ts \
  $SERVER:$APP_DIR/app/services/
echo "✅ Services uploaded"
echo ""

# Step 3: Upload Routes
echo "📤 Step 3/7: Uploading dashboard and chat routes..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  app.live-chat.tsx \
  app.chats.tsx \
  $SERVER:$APP_DIR/app/routes/

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "mkdir -p $APP_DIR/app/routes/api"
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  api.chat.messages.tsx \
  $SERVER:$APP_DIR/app/routes/api/
echo "✅ Routes uploaded"
echo ""

# Step 4: Upload Enhanced Widget
echo "📤 Step 4/7: Uploading enhanced chat widget..."
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no \
  chat-widget-enhanced.js \
  $SERVER:$APP_DIR/public/
echo "✅ Widget uploaded"
echo ""

# Step 5: Update Database
echo "🗄️  Step 5/7: Applying database migration..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /var/www/shopchat-new

echo "Stopping app..."
pm2 stop shopchat-new

echo "Pushing schema changes..."
npx prisma db push --accept-data-loss

echo "Generating Prisma client..."
npx prisma generate

echo "✅ Database migrated"
ENDSSH
echo ""

# Step 6: Rebuild Application
echo "🔨 Step 6/7: Rebuilding application..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /var/www/shopchat-new

echo "Building app..."
npm run build 2>&1 | tail -15

echo "✅ App rebuilt"
ENDSSH
echo ""

# Step 7: Restart and Test
echo "🚀 Step 7/7: Restarting application..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /var/www/shopchat-new

pm2 restart shopchat-new
sleep 5

echo "✅ App restarted"
echo ""
echo "Status:"
pm2 list | grep shopchat-new

echo ""
echo "Recent logs:"
pm2 logs shopchat-new --lines 10 --nostream
ENDSSH

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✨ Deployment Complete! ✨                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Application URL: https://shopchat-new.indigenservices.com"
echo "📊 Live Chat Dashboard: https://shopchat-new.indigenservices.com/app/live-chat"
echo "📋 Chat History: https://shopchat-new.indigenservices.com/app/chats"
echo ""
echo "Next steps:"
echo "1. Test the Live Chat Dashboard"
echo "2. Verify widget loads on storefront"
echo "3. Test agent takeover flow"
echo "4. Check product recommendations"
echo ""
echo "✅ All components deployed successfully!"
