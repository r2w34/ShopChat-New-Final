#!/bin/sh

echo "🚀 Starting ShopChat AI Application..."

# Create data directory if it doesn't exist
mkdir -p /app/data

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client (in case it wasn't generated during build)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check if database exists, if not create it
if [ ! -f "/app/data/production.sqlite" ]; then
  echo "🗄️ Initializing database..."
  touch /app/data/production.sqlite
fi

echo "✅ Database ready!"

# Start the application
echo "🎉 Starting application on port ${PORT}..."
exec node build/server/index.js
