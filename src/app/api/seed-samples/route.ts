import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Seeding samples for PDF/Invoice testing...');
    
    // 0. Ensure Admin User exists
    const admin = await prisma.user.upsert({
      where: { email: 'admin@mundo.com' },
      update: {},
      create: {
        email: 'admin@mundo.com',
        password: 'admin',
        name: 'Admin',
        role: 'ADMIN'
      }
    });

    // 1. Ensure Category and Products exist
    const cat = await prisma.category.upsert({
      where: { name: 'Cerveja' },
      update: {},
      create: { name: 'Cerveja' }
    });

    const p1 = await prisma.product.upsert({
      where: { barcode: '78910001' },
      update: { stock: 100 },
      create: {
        name: 'Heineken',
        brand: 'Heineken',
        volume: '600ml',
        barcode: '78910001',
        costPrice: 6.50,
        sellPrice: 9.90,
        stock: 100,
        categoryId: cat.id
      }
    });

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
    await prisma.sale.create({
      data: {
        total: 19.80,
        paymentMethod: 'PIX',
        status: 'CONCLUIDA',
        userId: 1, 
        clientId: client.id,
        items: {
          create: {
            productId: p1.id,
            quantity: 2,
            price: 9.90
          }
        }
      }
    });

    await prisma.sale.create({
      data: {
        total: 49.50,
        paymentMethod: 'DINHEIRO',
        status: 'CONCLUIDA',
        userId: admin.id,
        items: {
          create: {
            productId: p1.id,
            quantity: 5,
            price: 9.90
          }
        }
      }
    });

    return NextResponse.json({ success: true, message: 'Sample data seeded.' });
  } catch (error) {
    console.error('Error seeding sample data:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed data.' }, { status: 500 });
  }
}
