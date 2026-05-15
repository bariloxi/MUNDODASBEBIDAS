const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugQuery() {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 0, 0, 0));
  if (now.getUTCHours() < 3) {
    startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);
  }

  console.log('Start of Day used in query:', startOfDay.toISOString());

  const result = await prisma.sale.aggregate({
    where: { 
      createdAt: { gte: startOfDay },
      status: { not: 'CANCELADA' }
    },
    _sum: { total: true }
  });

  console.log('Query Result:', JSON.stringify(result, null, 2));

  // Let's also check all sales today without the status filter
  const allToday = await prisma.sale.findMany({
    where: { createdAt: { gte: startOfDay } }
  });
  console.log('All sales since startOfDay:', allToday.length);
  allToday.forEach(s => console.log(`- ID ${s.id}, Total ${s.total}, Status ${s.status}`));
}

debugQuery()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
