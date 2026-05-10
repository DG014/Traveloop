import 'dotenv/config';
import { createApp } from './app';
import { prisma } from './lib/prisma';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function main() {
  // Verify DB connection
  await prisma.$connect();
  console.log('[DB] Connected to PostgreSQL');

  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`[API] Traveloop API running on http://localhost:${PORT}`);
    console.log(`[API] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[API] SIGTERM received, shutting down...');
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });

  process.on('SIGINT', async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
