import { seedCategories, seedAdmin } from './src/lib/seed';

async function main() {
  console.log('Seeding...');
  await seedCategories();
  await seedAdmin();
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
