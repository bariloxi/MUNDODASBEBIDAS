const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sale = await prisma.sale.findUnique({
    where: { id: 46 },
    include: { items: { include: { product: true } } }
  });
  
  if (!sale) {
    console.log('Sale 46 not found.');
    return;
  }
  
  console.log('Sale 46 found:', JSON.stringify(sale, null, 2));
  
  // Revert it
  await prisma.$transaction(async (tx) => {
    for (const item of sale.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
    }
    await tx.invoice.deleteMany({ where: { saleId: 46 } });
    await tx.saleItem.deleteMany({ where: { saleId: 46 } });
    await tx.sale.delete({ where: { id: 46 } });
  });
  
  console.log('Sale 46 reverted and stock restored.');
}

main().finally(() => prisma.$disconnect());
