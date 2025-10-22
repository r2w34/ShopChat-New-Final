# 🐳 Docker Deployment Guide - ShopChat AI

**Production-ready Docker deployment for VPS**

---

## 📋 What's Included

### Docker Files:
- ✅ `Dockerfile` - Multi-stage Node.js build
- ✅ `docker-compose.yml` - Orchestration with nginx
- ✅ `docker-start.sh` - Startup script with migrations
- ✅ `nginx/nginx.conf` - Reverse proxy configuration
- ✅ `deploy-docker.sh` - Automated deployment script
- ✅ `.dockerignore` - Optimize build context

---

## 🚀 Quick Start Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# From your local machine
cd /workspace/ShopChat-New-Final
./deploy-docker.sh
```

That's it! The script will:
1. ✅ Package the application
2. ✅ Upload to VPS
3. ✅ Install Docker & Docker Compose
4. ✅ Build containers
5. ✅ Start services
6. ✅ Copy existing database & SSL certs
7. ✅ Verify deployment

### Option 2: Manual Deployment

```bash
# 1. SSH to VPS
ssh root@72.60.99.154

# 2. Create directory
mkdir -p /var/www/shopchat-new-docker
cd /var/www/shopchat-new-docker

# 3. Clone or copy files
git clone https://github.com/r2w34/ShopChat-New-Final.git .

# 4. Create .env file
cp /var/www/shopchat-new/.env .env

# 5. Update .env for Docker
sed -i 's|DATABASE_URL=.*|DATABASE_URL=file:/app/data/production.sqlite|g' .env

# 6. Copy database
mkdir -p data
cp /var/www/shopchat-new/data/production.sqlite data/

# 7. Setup SSL
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/shopchat-new.indigenservices.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/shopchat-new.indigenservices.com/privkey.pem nginx/ssl/

# 8. Build and start
docker-compose build
docker-compose up -d

# 9. Check logs
docker-compose logs -f
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Internet (Port 443/80)          │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼───────┐
       │  Nginx Proxy  │  (SSL Termination, Routing)
       │  Port 80/443  │
       └───────┬───────┘
               │
       ┌───────▼───────┐
       │ ShopChat App  │  (Node.js + Socket.IO)
       │   Port 3003   │
       └───────┬───────┘
               │
       ┌───────▼───────┐
       │  SQLite DB    │  (Volume mounted)
       │  /app/data    │
       └───────────────┘
```

---

## 📁 Directory Structure

```
/var/www/shopchat-new-docker/
├── docker-compose.yml        # Orchestration config
├── Dockerfile                # App container build
├── docker-start.sh           # Startup script
├── .env                      # Environment variables
├── data/                     # Database volume
│   └── production.sqlite
├── nginx/
│   ├── nginx.conf           # Nginx configuration
│   └── ssl/                 # SSL certificates
│       ├── fullchain.pem
│       └── privkey.pem
├── app/                     # Application code
├── prisma/                  # Database schema
└── public/                  # Static files (widgets)
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Shopify App
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_secret

# Domain
HOST=https://shopchat-new.indigenservices.com
SHOPIFY_APP_URL=https://shopchat-new.indigenservices.com

# Database
DATABASE_URL=file:/app/data/production.sqlite

# AI
GEMINI_API_KEY=your_gemini_key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```

### Docker Compose Services

**shopchat-app:**
- Image: Built from Dockerfile
- Port: 3003 (internal)
- Volumes: data/, prisma/, extensions/
- Restart: unless-stopped
- Health check: /health endpoint

**nginx:**
- Image: nginx:alpine
- Ports: 80, 443
- SSL: Termination & certificates
- Reverse proxy to app
- CORS headers configured

---

## 🎯 Deployment Checklist

### Pre-Deployment:
- [ ] VPS has Docker installed
- [ ] SSL certificates exist
- [ ] .env file configured
- [ ] Database backed up
- [ ] DNS points to VPS

### Deployment:
- [ ] Run `./deploy-docker.sh`
- [ ] Or follow manual steps
- [ ] Wait for build (3-5 minutes)
- [ ] Check containers running

### Post-Deployment:
- [ ] Visit https://shopchat-new.indigenservices.com
- [ ] Check /health endpoint
- [ ] Test widget on storefront
- [ ] Verify admin dashboard
- [ ] Check database connection

---

## 📊 Management Commands

### View Logs:
```bash
# All logs
docker-compose logs -f

# App only
docker-compose logs -f shopchat-app

# Nginx only
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100
```

### Container Management:
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# Check status
docker-compose ps

# Check resource usage
docker stats
```

### Database Management:
```bash
# Access database
docker exec -it shopchat-new sqlite3 /app/data/production.sqlite

# Backup database
docker cp shopchat-new:/app/data/production.sqlite ./backup-$(date +%Y%m%d).sqlite

# Restore database
docker cp ./backup.sqlite shopchat-new:/app/data/production.sqlite

# Run migrations
docker exec -it shopchat-new npx prisma migrate deploy
```

### Application Commands:
```bash
# Access container shell
docker exec -it shopchat-new sh

# Check Node.js version
docker exec -it shopchat-new node --version

# View environment
docker exec -it shopchat-new env

# Restart app only
docker-compose restart shopchat-app
```

---

## 🔍 Troubleshooting

### Issue: Containers won't start

```bash
# Check logs
docker-compose logs

# Check if ports are available
netstat -tlnp | grep -E '3003|80|443'

# Kill conflicting processes
pkill -f nginx
pkill -f node
```

### Issue: Can't connect to database

```bash
# Check if data directory exists
docker exec -it shopchat-new ls -la /app/data

# Check database file
docker exec -it shopchat-new ls -lh /app/data/production.sqlite

# Run migrations
docker exec -it shopchat-new npx prisma migrate deploy
```

### Issue: SSL certificate errors

```bash
# Check nginx SSL files
docker exec -it shopchat-nginx ls -la /etc/nginx/ssl

# Copy certificates again
cp /etc/letsencrypt/live/shopchat-new.indigenservices.com/*.pem nginx/ssl/
docker-compose restart nginx
```

### Issue: Widget not loading

```bash
# Check if app is responding
curl http://localhost:3003/health

# Check nginx proxy
docker-compose logs nginx | grep error

# Test widget file
curl https://shopchat-new.indigenservices.com/chat-widget.js

# Check CORS headers
curl -I https://shopchat-new.indigenservices.com/api/chat/session
```

### Issue: Database locked

```bash
# Stop all containers
docker-compose down

# Remove lock file
rm data/production.sqlite-journal

# Start again
docker-compose up -d
```

---

## 🔄 Updates & Rollback

### Update Application:

```bash
# Pull latest code
cd /var/www/shopchat-new-docker
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Rollback:

```bash
# Stop current version
docker-compose down

# Restore backup
cp backup-20251022.sqlite data/production.sqlite

# Start previous version
docker-compose up -d
```

---

## 📈 Performance Tuning

### Nginx Optimization:

```nginx
# In nginx.conf
worker_processes auto;  # Use all CPU cores
worker_connections 2048;  # Increase connections
keepalive_timeout 30;  # Reduce timeout
```

### Docker Resources:

```yaml
# In docker-compose.yml
services:
  shopchat-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## 🛡️ Security

### Firewall Rules:

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Block direct app access
ufw deny 3003/tcp

# Enable firewall
ufw enable
```

### SSL Auto-renewal:

```bash
# Install certbot
apt-get install certbot

# Auto-renew cron
0 0 * * * certbot renew --post-hook "cp /etc/letsencrypt/live/shopchat-new.indigenservices.com/*.pem /var/www/shopchat-new-docker/nginx/ssl/ && docker-compose restart nginx"
```

---

## 📊 Monitoring

### Health Checks:

```bash
# Application health
curl https://shopchat-new.indigenservices.com/health

# Socket.IO status
curl https://shopchat-new.indigenservices.com/socket/status

# Container health
docker-compose ps
```

### Resource Monitoring:

```bash
# Watch resources
docker stats shopchat-new

# Disk usage
docker system df

# Cleanup unused images
docker system prune -a
```

---

## ✅ Verification

After deployment, verify:

### 1. Containers Running:
```bash
docker-compose ps
# Should show both containers as "Up"
```

### 2. Health Check:
```bash
curl https://shopchat-new.indigenservices.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 3. Widget Loading:
```bash
curl -I https://shopchat-new.indigenservices.com/chat-widget.js
# Should return: HTTP/1.1 200 OK
```

### 4. Database Connected:
```bash
docker exec -it shopchat-new sqlite3 /app/data/production.sqlite "SELECT COUNT(*) FROM Store;"
# Should return number of stores
```

### 5. SSL Working:
```bash
curl -I https://shopchat-new.indigenservices.com
# Should return HTTPS response
```

---

## 🎉 Success Criteria

✅ All containers running
✅ Health check passes
✅ Widget loads on storefront
✅ Admin dashboard accessible
✅ Database persistent across restarts
✅ SSL certificate valid
✅ Socket.IO connected
✅ No errors in logs

---

## 📞 Support

### Check Status:
```bash
docker-compose ps
docker-compose logs --tail=50
```

### Quick Restart:
```bash
docker-compose restart
```

### Complete Reset:
```bash
docker-compose down
docker-compose up -d --build --force-recreate
```

---

## 🔄 Migration from PM2

If migrating from existing PM2 setup:

1. **Backup everything:**
   ```bash
   cp -r /var/www/shopchat-new /var/www/shopchat-new-backup
   ```

2. **Stop PM2:**
   ```bash
   pm2 stop shopchat-new
   pm2 delete shopchat-new
   ```

3. **Deploy Docker:**
   ```bash
   ./deploy-docker.sh
   ```

4. **Verify:**
   - Test all functionality
   - Keep PM2 version for 24 hours
   - Remove backup after verification

---

**Deployment Date:** October 22, 2025  
**Status:** ✅ Production Ready  
**Version:** Docker 1.0

