#!/bin/bash
SERVER="root@72.60.99.154"
PASSWORD="Kalilinux@2812"

echo "Uploading updated files..."
cd /workspace/ShopChat-New-Final
tar --exclude='node_modules' --exclude='.git' --exclude='build' --exclude='data' -czf /tmp/shopchat-new.tar.gz .
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no /tmp/shopchat-new.tar.gz $SERVER:/tmp/
rm /tmp/shopchat-new.tar.gz

echo "Extracting and starting Docker container..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER << 'ENDSSH'
cd /var/www/shopchat-new
tar -xzf /tmp/shopchat-new.tar.gz
rm /tmp/shopchat-new.tar.gz

echo "Starting Docker container..."
docker-compose --env-file .env.docker up -d

echo "Waiting for container..."
sleep 15

echo "Container status:"
docker-compose ps
docker-compose logs --tail=30
ENDSSH

echo "Done!"
