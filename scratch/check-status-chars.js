const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStatus() {
  const sale = await prisma.sale.findUnique({ where: { id: 236 } });
  console.log(`Status: '${sale.status}'`);
  console.log(`Length: ${sale.status.length}`);
  for (let i = 0; i < sale.status.length; i++) {
    console.log(`Char ${i}: ${sale.status.charCodeAt(i)} ('${sale.status[i]}')`);
  }
}

checkStatus()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
