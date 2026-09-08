const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Checking database environment...');
const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('🐘 PostgreSQL detected (Neon / Production). Synchronizing schema...');
  try {
    execSync('npx prisma db push --schema=prisma/schema.postgresql.prisma --accept-data-loss', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    console.log('🌱 Checking seed data...');
    execSync('npx tsx prisma/seed.ts', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
  } catch (err) {
    console.error('⚠️ Database sync/seed note:', err.message);
  }
} else {
  console.log('📁 SQLite or local database detected.');
  try {
    execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
  } catch (err) {
    console.error('⚠️ Local DB sync note:', err.message);
  }
}

console.log('🚀 Launching NestJS Production Server...');
require(path.resolve(__dirname, '../dist/src/main.js'));
