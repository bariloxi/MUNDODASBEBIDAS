const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSale() {
  const saleId = 236;
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { items: true }
  });

  if (!sale) {
    console.log(`Sale ${saleId} not found`);
  } else {
    console.log('Sale Data:', JSON.stringify(sale, null, 2));
  }
}

checkSale()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
