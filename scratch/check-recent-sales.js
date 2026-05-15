const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentSales() {
  const sales = await prisma.sale.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${sales.length} recent sales:`);
  sales.forEach(s => {
    console.log(`- ID: ${s.id}, Status: ${s.status}, Total: ${s.total}, CreatedAt: ${s.createdAt.toISOString()}`);
  });
}

checkRecentSales()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
