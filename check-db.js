const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.product.count();
  const inStock = await prisma.product.count({ where: { stock: { gt: 0 } } });
  console.log('Total de produtos:', total);
  console.log('Produtos em estoque (>0):', inStock);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
