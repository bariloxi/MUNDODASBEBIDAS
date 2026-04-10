import { prisma } from './src/lib/prisma';

async function seedSales() {
  console.log('Seeding samples for PDF/Invoice testing...');
  
  // 1. Ensure Category and Products exist
  const cat = await prisma.category.upsert({
    where: { name: 'Cerveja' },
    update: {},
    create: { name: 'Cerveja' }
  });

  const products = [
    { name: 'Heineken', brand: 'Heineken', volume: '600ml', barcode: '78910001', costPrice: 6.50, sellPrice: 9.90, stock: 120 },
    { name: 'Brahma Duplo Malte', brand: 'Brahma', volume: '600ml', barcode: '78910002', costPrice: 5.20, sellPrice: 8.50, stock: 96 },
    { name: 'Skol', brand: 'Skol', volume: '600ml', barcode: '78910003', costPrice: 4.80, sellPrice: 7.50, stock: 144 },
    { name: 'Amstel', brand: 'Amstel', volume: '600ml', barcode: '78910004', costPrice: 5.00, sellPrice: 8.20, stock: 84 },
    { name: 'Coca-Cola', brand: 'Coca-Cola', volume: '2L', barcode: '78910005', costPrice: 8.50, sellPrice: 12.50, stock: 60 },
    { name: 'Guaraná Antarctica', brand: 'Antarctica', volume: '2L', barcode: '78910006', costPrice: 7.20, sellPrice: 10.90, stock: 48 },
    { name: 'Whisky Jack Daniels', brand: 'Jack Daniels', volume: '1L', barcode: '78910007', costPrice: 110.00, sellPrice: 165.00, stock: 12 },
    { name: 'Whisky Red Label', brand: 'Johnnie Walker', volume: '1L', barcode: '78910008', costPrice: 85.00, sellPrice: 129.90, stock: 15 },
    { name: 'Vodka Absolut', brand: 'Absolut', volume: '1L', barcode: '78910009', costPrice: 75.00, sellPrice: 115.00, stock: 20 },
    { name: 'Vodka Smirnoff', brand: 'Smirnoff', volume: '1L', barcode: '78910010', costPrice: 38.00, sellPrice: 59.90, stock: 30 },
  ];

  const createdProducts = [];
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { barcode: p.barcode },
      update: { stock: p.stock, sellPrice: p.sellPrice },
      create: { ...p, categoryId: cat.id }
    });
    createdProducts.push(product);
  }

  // 2. Create a Client
  const client = await prisma.client.upsert({
    where: { phone: '11988887777' },
    update: {},
    create: {
      name: 'Marcelo Silva',
      phone: '11988887777',
      address: 'Rua das Flores, 123'
    }
  });

  // 3. Create Sales
  const existingSales = await prisma.sale.count();
  if (existingSales < 5) {
    // Sale 1: PIX
    await prisma.sale.create({
      data: {
        total: 19.80,
        paymentMethod: 'PIX',
        status: 'CONCLUIDA',
        userId: 1,
        clientId: client.id,
        items: {
          create: { productId: createdProducts[0].id, quantity: 2, price: 9.90 }
        }
      }
    });

    // Sale 2: Cash
    await prisma.sale.create({
      data: {
        total: 25.00,
        paymentMethod: 'DINHEIRO',
        status: 'CONCLUIDA',
        userId: 1,
        items: {
          create: { productId: createdProducts[4].id, quantity: 2, price: 12.50 }
        }
      }
    });

    // Sale 3: Credit Card large sale
    await prisma.sale.create({
      data: {
        total: 294.90,
        paymentMethod: 'CARTAO',
        status: 'CONCLUIDA',
        userId: 1,
        items: {
          createMany: {
            data: [
              { productId: createdProducts[6].id, quantity: 1, price: 165.00 },
              { productId: createdProducts[7].id, quantity: 1, price: 129.90 }
            ]
          }
        }
      }
    });
    console.log('Sample sales created.');
  } else {
    console.log('Enough sales already exist, skipping sample creation.');
  }
}

seedSales()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
