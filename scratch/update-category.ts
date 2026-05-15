import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const category = await prisma.category.findFirst({
      where: { name: 'Refrigerante' }
    });

    if (category) {
      await prisma.category.update({
        where: { id: category.id },
        data: { name: 'Refrigerante / Suco' }
      });
      console.log('Category updated successfully: Refrigerante -> Refrigerante / Suco');
    } else {
      console.log('Category "Refrigerante" not found. Checking if "Refrigerante / Suco" already exists...');
      const existing = await prisma.category.findFirst({
        where: { name: 'Refrigerante / Suco' }
      });
      if (!existing) {
        await prisma.category.create({
          data: { name: 'Refrigerante / Suco' }
        });
        console.log('Created category: Refrigerante / Suco');
      } else {
        console.log('Category "Refrigerante / Suco" already exists.');
      }
    }
  } catch (error) {
    console.error('Error updating category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
