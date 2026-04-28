'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { gerarChaveNFe } from './nfe/chaveNFe';
import { assinarXML } from './nfe/assinarXML';
import { enviarSEFAZ } from './nfe/enviarSEFAZ';

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);
    const brand = formData.get('brand') as string;
    const volume = formData.get('volume') as string;
    const barcode = formData.get('barcode') as string;
    const costPrice = parseFloat(formData.get('costPrice') as string);
    const sellPrice = parseFloat(formData.get('sellPrice') as string);
    const stock = parseInt(formData.get('stock') as string);
    const minStock = parseInt(formData.get('minStock') as string);
    const expiry = formData.get('expiry') ? new Date(formData.get('expiry') as string) : null;

    if (!name || isNaN(categoryId) || isNaN(costPrice) || isNaN(sellPrice)) {
      throw new Error('Dados inválidos para o produto');
    }

    await prisma.product.create({
      data: {
        name,
        categoryId,
        brand,
        volume,
        barcode: barcode || null,
        costPrice,
        sellPrice,
        stock,
        minStock,
        expiry,
      },
    });

    revalidatePath('/products');
  } catch (error) {
    console.error('Error creating product:', error);
    // Ideally return an error state, but Next.js redirect needs to be outside try/catch if it throws
  }
  redirect('/products');
}

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function searchProducts(term: string) {
  if (!term) return await prisma.product.findMany({ 
    take: 200, 
    include: { category: true },
    where: { stock: { gt: 0 } },
    orderBy: { name: 'asc' }
  });

  return await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { barcode: { contains: term, mode: 'insensitive' } },
      ],
      stock: { gt: 0 },
    },
    include: { category: true },
    take: 100,
    orderBy: { name: 'asc' }
  });
}

export async function completeSale(data: {
  userId: number;
  paymentMethod: string;
  discount: number;
  total: number;
  clientId?: number;
  dueDate?: string;
  items: { productId: number; quantity: number; price: number }[];
}) {
  try {
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const newSale = await tx.sale.create({
        data: {
          userId: data.userId,
          paymentMethod: data.paymentMethod,
          discount: data.discount,
          total: data.total,
          status: data.paymentMethod === 'RECEBER_DEPOIS' ? 'PENDENTE' : 'CONCLUIDA',
          clientId: data.clientId || null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // 2. Update stock for each item
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newSale;
    });

    revalidatePath('/products');
    revalidatePath('/pdv');
    revalidatePath('/');
    return { success: true, sale };
  } catch (error) {
    console.error('Error completing sale:', error);
    return { success: false, error: 'Erro ao processar venda' };
  }
}

export async function updateSaleStatus(id: number, status: string) {
  await prisma.sale.update({
    where: { id },
    data: { status },
  });
  revalidatePath('/delivery');
  revalidatePath('/pdv');
  revalidatePath('/');
}

export async function getExpenses() {
  return await prisma.expense.findMany({
    orderBy: { date: 'desc' },
  });
}

export async function createExpense(formData: FormData) {
  const description = formData.get('description') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const category = formData.get('category') as string;
  const dateStr = formData.get('date') as string;
  const date = dateStr ? new Date(dateStr) : new Date();

  await prisma.expense.create({
    data: {
      description,
      amount,
      category,
      date,
    },
  });

  revalidatePath('/finance');
  revalidatePath('/reports');
}

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc: Record<string, string>, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
}

export async function updateSettings(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  
  await createLog('SETTINGS_UPDATE', 'Configurações globais atualizadas');
  revalidatePath('/settings');
}

export async function createLog(event: string, details?: string, userId?: number) {
  try {
    await prisma.log.create({
      data: { event, details, userId }
    });
  } catch (error) {
    console.error('Error creating log:', error);
  }
}

export async function getLogs() {
  return await prisma.log.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  await prisma.user.create({
    data: { name, email, password, role }
  });

  await createLog('USER_CREATE', `Usuário ${name} criado com cargo ${role}`);
  revalidatePath('/settings');
}

export async function updateUser(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const password = formData.get('password') as string;

  const data: Prisma.UserUpdateInput = { name, email, role };
  if (password) data.password = password;

  await prisma.user.update({
    where: { id },
    data
  });

  await createLog('USER_UPDATE', `Usuário ID ${id} atualizado`);
  revalidatePath('/settings');
}

export async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id }
  });

  await createLog('USER_DELETE', `Usuário ID ${id} removido`);
  revalidatePath('/settings');
}

export async function getClients() {
  return await prisma.client.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function createClient(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!name) throw new Error('Nome é obrigatório');

    await prisma.client.create({
      data: {
        name,
        phone,
        address,
      },
    });

    revalidatePath('/clients');
  } catch (error) {
    console.error('Error creating client:', error);
  }
  redirect('/clients');
}
export async function deleteProduct(id: number) {
  await prisma.product.delete({
    where: { id },
  });
  revalidatePath('/products');
}

export async function getProduct(id: number) {
  return await prisma.product.findUnique({
    where: { id }
  });
}

export async function updateProduct(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const categoryId = parseInt(formData.get('categoryId') as string);
  const brand = formData.get('brand') as string;
  const volume = formData.get('volume') as string;
  const barcode = formData.get('barcode') as string;
  const costPrice = parseFloat(formData.get('costPrice') as string);
  const sellPrice = parseFloat(formData.get('sellPrice') as string);
  const stock = parseInt(formData.get('stock') as string);
  const minStock = parseInt(formData.get('minStock') as string);
  const expiry = formData.get('expiry') ? new Date(formData.get('expiry') as string) : null;

  await prisma.product.update({
    where: { id },
    data: {
      name,
      categoryId,
      brand,
      volume,
      barcode: barcode || null,
      costPrice,
      sellPrice,
      stock,
      minStock,
      expiry,
    },
  });

  revalidatePath('/products');
  redirect('/products');
}

export async function deleteClient(id: number) {
  await prisma.client.delete({
    where: { id },
  });
  revalidatePath('/clients');
}

export async function getClient(id: number) {
  return await prisma.client.findUnique({
    where: { id }
  });
}

export async function updateClient(id: number, formData: FormData) {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  await prisma.client.update({
    where: { id },
    data: { name, phone, address }
  });

  revalidatePath('/clients');
  redirect('/clients');
}

export async function updateStock(productId: number, newStock: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });
    revalidatePath('/inventory');
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, error: 'Erro ao atualizar estoque' };
  }
}
export async function getInvoice(saleId: number) {
  return await prisma.invoice.findUnique({
    where: { saleId },
    include: {
      sale: {
        include: {
          items: {
            include: { product: true }
          },
          client: true,
          user: true
        }
      }
    }
  });
}

export async function generateInvoice(saleId: number) {
  try {
    // 1. Pega dados da venda e configurações
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { 
        client: true, 
        items: { include: { product: true } } 
      }
    });

    if (!sale) throw new Error('Venda não encontrada');

    // Verifica se já existe nota
    const existing = await prisma.invoice.findUnique({
      where: { saleId }
    });

    if (existing) {
       const full = await getInvoice(saleId);
       return { success: true, invoice: full };
    }

    // 2. Determina número da nota
    const lastInvoice = await prisma.invoice.findFirst({ orderBy: { id: 'desc' } });
    const nNF = lastInvoice ? parseInt(lastInvoice.number) + 1 : 1;
    const nNFStr = nNF.toString().padStart(6, '0');

    // 3. Geração da Chave de Acesso (REQ 1)
    const settings = await getSettings();
    const cnpjEmitente = settings['company_cnpj'] || '00000000000000';
    const ufEmitente = settings['company_uf'] || '52'; // Default Goiás

    const accessKey = gerarChaveNFe({
      uf: ufEmitente,
      ano: new Date().getFullYear().toString().substring(2),
      mes: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      cnpj: cnpjEmitente,
      modelo: '55',
      serie: '1',
      numero: nNF
    });

    // 4. Geração do XML (Simplificado para o fluxo de integração)
    // Em um cenário real, aqui seria montado o XML 4.00 completo
    const xmlBase = `
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${accessKey}" versao="4.00">
    <ide>
      <cUF>${ufEmitente}</cUF>
      <nNF>${nNF}</nNF>
      <dhEmi>${new Date().toISOString()}</dhEmi>
    </ide>
    <emit>
      <CNPJ>${cnpjEmitente}</CNPJ>
    </emit>
    <dest>
      <CNPJ>${sale.client?.phone || '00000000000000'}</CNPJ>
    </dest>
    <det nItem="1">
       <prod>
          <vProd>${sale.total.toFixed(2)}</vProd>
       </prod>
    </det>
    <total>
       <vNF>${sale.total.toFixed(2)}</vNF>
    </total>
  </infNFe>
</NFe>`.trim();

    // 5. Assinatura do XML (REQ 2)
    const certPath = process.env.CERT_PATH || './cert.pfx';
    const certPass = process.env.CERT_PASSWORD || '1234';
    
    // Verificamos se o certificado existe antes de tentar assinar (para não quebrar em dev local sem cert)
    let xmlAssinado = xmlBase;
    try {
      xmlAssinado = await assinarXML(xmlBase, certPath, certPass);
    } catch (e) {
      console.warn('Certificado não encontrado ou erro na assinatura, prosseguindo com XML base para demonstração.', e instanceof Error ? e.message : String(e));
    }

    // 6. Envio para SEFAZ (REQ 3 e 4)
    let resultadoSefaz = { success: false, cStat: '0', xMotivo: 'Não enviado (Simulação)' };
    try {
      resultadoSefaz = await enviarSEFAZ({
        xmlAssinado,
        certPath,
        password: certPass,
        ambiente: process.env.NFE_AMBIENTE || 'homologacao',
        uf: ufEmitente
      });
    } catch (e) {
      console.warn('Erro no envio SEFAZ:', e instanceof Error ? e.message : String(e));
    }

    // 7. Persistência no sistema (REQ 5)
    const invoice = await prisma.invoice.create({
      data: {
        number: nNFStr,
        accessKey,
        saleId
      },
      include: {
        sale: {
          include: {
            items: { include: { product: true } },
            client: true,
            user: true
          }
        }
      }
    });

    // Registra log do resultado da SEFAZ
    await createLog('NFE_EMISSION', `Nota ${nNFStr} enviada. Status: ${resultadoSefaz.cStat} - ${resultadoSefaz.xMotivo}`);

    revalidatePath('/finance');
    revalidatePath('/pdv');

    return { 
      success: true, 
      invoice,
      sefaz: resultadoSefaz // Retorna resultado estruturado conforme REQ 4
    };

  } catch (error) {
    console.error('Error generating invoice:', error);
    return { success: false, error: (error as Error).message || 'Erro ao gerar nota fiscal' };
  }
}

export async function getSales() {
  return await prisma.sale.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: true,
      user: true,
      items: {
        include: { product: true }
      },
      invoice: true
    }
  });
}
export async function resetTransactionData() {
  try {
    await prisma.$transaction([
      prisma.invoice.deleteMany(),
      prisma.saleItem.deleteMany(),
      prisma.sale.deleteMany(),
      prisma.expense.deleteMany(),
    ]);

    revalidatePath('/finance');
    revalidatePath('/pdv');
    revalidatePath('/reports');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error resetting data:', error);
    return { success: false, error: 'Erro ao limpar dados' };
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'E-mail e senha são obrigatórios' };
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    const cookieStore = await cookies();
    cookieStore.set('session', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax'
    });

    return { success: true };
  } catch (error) {
    console.error('CRITICAL LOGIN ERROR:', error);
    const message = error instanceof Error ? error.message : String(error);
    
    // Se o erro vier do Prisma, provavelmente é problema de DATABASE_URL
    if (message.includes('PrismaClient') || message.includes('DATABASE_URL')) {
      return { success: false, error: 'Erro de conexão: Verifique se o banco de dados está online e se a DATABASE_URL foi configurada no painel do Firebase.' };
    }
    
    return { success: false, error: `Erro na autenticação: ${message.substring(0, 50)}...` };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session')?.value;

  if (!sessionId) return null;

  return await prisma.user.findUnique({
    where: { id: parseInt(sessionId) }
  });
}
