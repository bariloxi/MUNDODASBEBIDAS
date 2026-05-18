import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Set up WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('CRITICAL ERROR: DATABASE_URL is not defined in environment variables.');
}

const pool = new Pool({ 
  connectionString,
  connectionTimeoutMillis: 5000, // Fail fast if can't connect
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaNeon(pool as any);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

// Handle connection errors globally if possible
prisma.$connect().catch(err => {
  console.error('PRISMA INITIAL CONNECTION ERROR:', err.message);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
