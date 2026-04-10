import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@mundo.com';
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: 'admin123' },
    create: {
      name: 'Administrador',
      email: adminEmail,
      password: 'admin123', // Em sistema real, usar hash
      role: 'ADMIN'
    }
  });

  console.log('Admin atualizado/criado: admin@mundo.com / admin123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
