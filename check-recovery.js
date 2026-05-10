const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_jvGzPhds17OL@ep-green-sea-ank4x0r5-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});
async function check() {
  try {
    const p = await prisma.product.count();
    const s = await prisma.sale.count();
    const c = await prisma.client.count();
    console.log(JSON.stringify({ products: p, sales: s, clients: c }));
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}
check();
