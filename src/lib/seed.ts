import { prisma } from './prisma';

export async function seedCategories() {
  const categories = [
    'Cerveja',
    'Whisky',
    'Vodka',
    'Energético',
    'Refrigerante',
    'Vinho',
    'Espumante',
    'Petiscos',
    'Cachaça',
    'Gelo / Carvão',
    'Água',
    'Salgados',
    'Tabacaria'
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

export async function seedAdmin() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mundo.com' },
    update: {},
    create: {
      email: 'admin@mundo.com',
      name: 'Administrador',
      password: 'admin', // In a real app, use bcrypt
      role: 'ADMIN'
    }
  });
  return admin;
}
