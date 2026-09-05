#!/bin/sh
set -e

echo "======================================================="
echo "🚀 SMART ORDER BUTTON - BACKEND CONTAINER STARTUP"
echo "======================================================="

# Determine schema file to use based on DATABASE_URL
PRISMA_SCHEMA="prisma/schema.postgresql.prisma"
if echo "$DATABASE_URL" | grep -q "^file:"; then
  PRISMA_SCHEMA="prisma/schema.prisma"
  echo "📦 Database mode: SQLite ($PRISMA_SCHEMA)"
else
  echo "🐘 Database mode: PostgreSQL ($PRISMA_SCHEMA)"
fi

echo "⏳ Synchronizing database schema ($PRISMA_SCHEMA)..."
RETRIES=30
until npx prisma db push --schema="$PRISMA_SCHEMA" --accept-data-loss || [ $RETRIES -eq 0 ]; do
  echo "Database not ready yet - retrying in 2 seconds... ($RETRIES attempts remaining)"
  RETRIES=$((RETRIES-1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "⚠️ Could not connect or apply database schema. Attempting to start server anyway..."
else
  echo "✅ Database schema synchronized successfully."
fi

# Optional initial seed
if [ "$SEED_DATABASE" = "true" ]; then
  if [ -f "dist/prisma/seed.js" ]; then
    echo "🌱 Running database seed script (dist/prisma/seed.js)..."
    node dist/prisma/seed.js || echo "⚠️ Seed script completed with warnings."
  fi
fi

echo "✨ Starting NestJS Cloud Core server..."
exec node dist/main.js
