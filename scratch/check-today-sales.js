const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTodaySales() {
  const now = new Date();
  // Início do dia em Brasília (UTC-3) é 03:00:00 no horário UTC
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 3, 0, 0, 0));
  
  if (now.getUTCHours() < 3) {
    startOfDay.setUTCDate(startOfDay.getUTCDate() - 1);
  }

  console.log('Now (UTC):', now.toISOString());
  console.log('Start of Day (UTC):', startOfDay.toISOString());

  const sales = await prisma.sale.findMany({
    where: { 
      createdAt: { gte: startOfDay }
    },
    include: { items: true }
  });

  console.log(`Found ${sales.length} sales today:`);
  let sumAll = 0;
  let sumNotCanceled = 0;
  let sumConcluidia = 0;

  sales.forEach(s => {
    console.log(`- ID: ${s.id}, Status: ${s.status}, Total: ${s.total}, CreatedAt: ${s.createdAt.toISOString()}`);
    sumAll += s.total;
    if (s.status !== 'CANCELADA') {
      sumNotCanceled += s.total;
    }
    if (s.status === 'CONCLUIDA') {
      sumConcluidia += s.total;
    }
  });

  console.log('\nCalculated Totals:');
  console.log('Total (All):', sumAll);
  console.log('Total (Not Canceled):', sumNotCanceled);
  console.log('Total (Concluida only):', sumConcluidia);
}

checkTodaySales()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
