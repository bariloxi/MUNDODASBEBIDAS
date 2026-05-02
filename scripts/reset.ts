import { prisma } from '../src/lib/prisma';

async function reset() {
  console.log('Iniciando limpeza de dados...');
  try {
    await prisma.$transaction([
      prisma.invoice.deleteMany(),
      prisma.saleItem.deleteMany(),
      prisma.sale.deleteMany(),
      prisma.expense.deleteMany(),
    ]);
    console.log('Dados limpos com sucesso!');
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reset();
