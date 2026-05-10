
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function test() {
  const connectionString = "postgresql://neondb_owner:npg_jvGzPhds17OL@ep-green-sea-ank4x0r5-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log('Testing connection with Neon Serverless adapter...');

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const count = await prisma.product.count();
    console.log('Success! Product count:', count);
  } catch (err) {
    console.error('Connection failed with adapter:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
