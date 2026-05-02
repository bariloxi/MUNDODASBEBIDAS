import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.category.upsert({
    where: { name: 'Tabacaria' },
    update: {},
    create: { name: 'Tabacaria' }
  });
  console.log('Categoria Tabacaria adicionada com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
