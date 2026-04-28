import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seed started...');

  // 1. Categories
  const categoriesList = [
    'Cerveja', 'Whisky', 'Vodka', 'Energético', 'Refrigerante', 
    'Vinho', 'Espumante', 'Petiscos', 'Cachaça', 'Gelo / Carvão'
  ];
  const categories = [];
  for (const name of categoriesList) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    categories.push(cat);
  }

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mundo.com' },
    update: {},
    create: {
      email: 'admin@mundo.com',
      name: 'Administrador',
      password: 'admin',
      role: 'ADMIN'
    }
  });

  // 3. Products
  const productsData = [
    { name: 'Heineken 600ml', brand: 'Heineken', volume: '600ml', catIdx: 0, cost: 6.5, sell: 9.5, stock: 120, barcode: '7891000000001' },
    { name: 'Brahma Duplo Malte', brand: 'Brahma', volume: '350ml', catIdx: 0, cost: 2.8, sell: 4.5, stock: 240, barcode: '7891000000002' },
    { name: 'Red Label 1L', brand: 'Johnnie Walker', volume: '1L', catIdx: 1, cost: 65, sell: 95, stock: 12, barcode: '7891000000003' },
    { name: 'Absolut Vodka 750ml', brand: 'Absolut', volume: '750ml', catIdx: 2, cost: 55, sell: 85, stock: 8, barcode: '7891000000004' },
    { name: 'Red Bull 250ml', brand: 'Red Bull', volume: '250ml', catIdx: 3, cost: 5.5, sell: 9.9, stock: 48, barcode: '7891000000005' },
    { name: 'Coca-Cola 2L', brand: 'Coca-Cola', volume: '2L', catIdx: 4, cost: 7.5, sell: 12.0, stock: 60, barcode: '7891000000006' },
    { name: 'Pringles Original', brand: 'Pringles', volume: '114g', catIdx: 7, cost: 8.5, sell: 15.0, stock: 30, barcode: '7891000000007' },
    { name: 'Carvão 4kg', brand: 'Gás-Sul', volume: '4kg', catIdx: 9, cost: 12.0, sell: 22.0, stock: 50, barcode: '7891000000008' },
    { name: 'Saco de Gelo 5kg', brand: 'Gelo-X', volume: '5kg', catIdx: 9, cost: 6.0, sell: 12.0, stock: 40, barcode: '7891000000009' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products: any[] = [];
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: {
        stock: p.stock,
        costPrice: p.cost,
        sellPrice: p.sell,
        categoryId: categories[p.catIdx].id
      },
      create: {
        name: p.name,
        brand: p.brand,
        volume: p.volume,
        barcode: p.barcode,
        costPrice: p.cost,
        sellPrice: p.sell,
        stock: p.stock,
        categoryId: categories[p.catIdx].id
      }
    });
    products.push(product);
  }

  // 4. Clients
  const clientsData = [
    { name: 'João Silva', phone: '11988887777', address: 'Rua das Flores, 123' },
    { name: 'Maria Oliveira', phone: '11977776666', address: 'Av. Paulista, 1000' },
    { name: 'Pedro Santos', phone: '11966665555', address: 'Rua Oscar Freire, 500' },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clients: any[] = [];
  for (const c of clientsData) {
    const client = await prisma.client.upsert({
      where: { phone: c.phone },
      update: { address: c.address },
      create: c
    });
    clients.push(client);
  }

  // 5. Sales
  const existingSales = await prisma.sale.count();
  if (existingSales === 0) {
    const salesData = [
      { total: 45.0, status: 'CONCLUIDA', method: 'PIX', items: [ { idx: 0, qty: 3 }, { idx: 5, qty: 1 } ] },
      { total: 150.0, status: 'PENDENTE', method: 'DINHEIRO', items: [ { idx: 2, qty: 1 }, { idx: 4, qty: 4 } ] },
      { total: 34.0, status: 'SAIU_PARA_ENTREGA', method: 'CARTAO', items: [ { idx: 1, qty: 6 }, { idx: 8, qty: 1 } ] },
    ];

    for (const s of salesData) {
      await prisma.sale.create({
        data: {
          total: s.total,
          status: s.status,
          paymentMethod: s.method,
          userId: admin.id,
          clientId: clients[0].id,
          items: {
            create: s.items.map(item => ({
              productId: products[item.idx].id,
              quantity: item.qty,
              price: products[item.idx].sellPrice
            }))
          }
        }
      });
    }
  }

  // 6. Expenses
  const expensesData = [
    { description: 'Aluguel Março', amount: 2500, category: 'ALUGUEL' },
    { description: 'Luz Março', amount: 350, category: 'LUZ' },
    { description: 'Fornecedor Ambev', amount: 1500, category: 'FORNECEDOR' },
  ];
  for (const e of expensesData) {
    await prisma.expense.create({
      data: e
    });
  }

  // 7. Settings
  await prisma.setting.upsert({
    where: { key: 'storeName' },
    update: { value: 'MUNDO DAS BEBIDAS DISK' },
    create: { key: 'storeName', value: 'MUNDO DAS BEBIDAS DISK' }
  });
  await prisma.setting.upsert({
    where: { key: 'whatsapp' },
    update: { value: '+55 (11) 99999-9999' },
    create: { key: 'whatsapp', value: '+55 (11) 99999-9999' }
  });

  console.log('Seed finished successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
