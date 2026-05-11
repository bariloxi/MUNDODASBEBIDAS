import React from 'react';
import { prisma } from '@/lib/prisma';
import PrintButton from '@/components/PrintButton';

async function getReportData() {
  try {
    const [sales, products] = await Promise.all([
      prisma.sale.findMany({ where: { status: 'CONCLUIDA' } }),
      prisma.product.findMany({
        include: {
          saleItems: {
            include: { sale: true }
          }
        }
      })
    ]);

    const revenue = sales.reduce((acc, s) => acc + s.total, 0);
    const now = new Date();
    const dStr = now.toISOString().split('T')[0];
    const dailyRevenue = sales
      .filter(s => s.createdAt.toISOString().startsWith(dStr))
      .reduce((acc, s) => acc + s.total, 0);

    const inventoryReport = products.map(p => {
      const sold = p.saleItems
        .filter(si => si.sale.status === 'CONCLUIDA')
        .reduce((acc, si) => acc + si.quantity, 0);
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        volume: p.volume,
        stock: p.stock,
        sold
      };
    }).sort((a, b) => b.sold - a.sold);

    return {
      revenue,
      dailyRevenue,
      inventoryReport,
      totalUnitsSold: inventoryReport.reduce((acc, i) => acc + i.sold, 0),
      totalStock: inventoryReport.reduce((acc, i) => acc + i.stock, 0)
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function ReportsPage() {
  const data = await getReportData();

  if (!data) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-500">Erro ao carregar dados</h1>
        <p className="text-slate-500">Verifique a conexão com o banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Impressão */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
        <h1 className="text-xl font-black uppercase">Mundo das Bebidas Disk</h1>
        <p className="text-xs">Relatório Consolidado - {new Date().toLocaleDateString('pt-BR')}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="border p-2">
            <p className="text-[10px] font-bold uppercase text-slate-500">Faturamento Hoje</p>
            <p className="text-lg font-black">R$ {data.dailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="border p-2">
            <p className="text-[10px] font-bold uppercase text-slate-500">Faturamento Total</p>
            <p className="text-lg font-black">R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Relatórios</h1>
        <PrintButton />
      </div>

      {/* Grid na Tela */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
        <div className="bg-slate-900 border border-slate-800 p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Vendas Hoje</h3>
          <p className="text-3xl font-black text-white">R$ {data.dailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Receita Total</h3>
          <p className="text-3xl font-black text-white">R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white print:bg-transparent border border-slate-200 print:border-black p-4">
        <h2 className="text-sm font-black uppercase mb-4 print:text-xs">Giro de Estoque</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 text-left text-[10px] uppercase">
              <th className="py-2">Produto</th>
              <th className="py-2 text-center">Vendidos</th>
              <th className="py-2 text-right">Estoque</th>
            </tr>
          </thead>
          <tbody>
            {data.inventoryReport.map(item => (
              <tr key={item.id} className="border-b border-slate-100 text-[11px] print:text-[9px]">
                <td className="py-1">
                  <p className="font-bold uppercase">{item.name}</p>
                  <p className="text-[9px] text-slate-500">{item.brand} - {item.volume}</p>
                </td>
                <td className="py-1 text-center font-bold">{item.sold} un</td>
                <td className="py-1 text-right">{item.stock} un</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
