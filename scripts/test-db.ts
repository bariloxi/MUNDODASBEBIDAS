import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Testing connection to:', process.env.DATABASE_URL);
  try {
    const count = await prisma.product.count();
    console.log('Successfully connected! Product count:', count);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
