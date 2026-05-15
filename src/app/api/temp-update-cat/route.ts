import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const category = await prisma.category.findFirst({
      where: { name: 'Refrigerante' }
    });

    if (category) {
      await prisma.category.update({
        where: { id: category.id },
        data: { name: 'Refrigerante / Suco' }
      });
      return NextResponse.json({ message: 'Category updated: Refrigerante -> Refrigerante / Suco' });
    }

    const existing = await prisma.category.findFirst({
      where: { name: 'Refrigerante / Suco' }
    });

    if (!existing) {
      await prisma.category.create({
        data: { name: 'Refrigerante / Suco' }
      });
      return NextResponse.json({ message: 'Category created: Refrigerante / Suco' });
    }

    return NextResponse.json({ message: 'Category Refrigerante / Suco already exists' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
