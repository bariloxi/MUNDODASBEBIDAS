import React from 'react';
import { ClipboardList, TrendingDown, Package, AlertCircle, Search, ArrowRight, History } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import StockAdjuster from '@/components/StockAdjuster';
import SearchInput from '@/components/SearchInput';
import { cn } from '@/lib/utils';

async function getInventoryData(search?: string) {
const productsRaw = await prisma.product.findMany({
    where: search ? {
      OR: [
        { name: { contains: search } },
        { brand: { contains: search } },
        { barcode: { contains: search } }
      ]
    } : undefined,
    include: {
      saleItems: true
    },
    orderBy: { name: 'asc' }
  });

  const products = productsRaw.map(p => ({
    ...p,
    sold: p.saleItems.reduce((acc, item) => acc + item.quantity, 0)
  }));

  const sales = await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  const history = sales.flatMap(sale => 
    sale.items.map(item => ({
      id: `${sale.id}-${item.productId}`,
      date: sale.createdAt,
      type: 'SAÍDA',
      product: item.product.name,
      quantity: item.quantity,
      details: `Venda #${sale.id.toString().padStart(4, '0')}`
    }))
  );

  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 5)).length;

  return { products, history, lowStockCount };
}

const InventoryPage = async ({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
  const { q } = await searchParams;
  const { products, history, lowStockCount } = await getInventoryData(q);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Package size={14} />
            <span>Gestão de Ativos</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Logística de Estoque</h1>
          <p className="text-slate-400 text-sm">Monitoramento de ativos e controle de movimentação.</p>
        </div>
        <div className="flex items-center gap-3 bg-bg-surface/50 border border-border py-2 px-5 rounded-none text-xs font-semibold text-slate-300 shadow-sm">
          <Package size={14} className="text-primary" />
          {products.length} SKU&apos;s Ativos
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Saídas de Estoque', 
            value: `${history.length} uni`, 
            icon: TrendingDown, 
            color: 'text-success', 
            bg: 'bg-success/10' 
          },
          { 
            label: 'Itens em Depósito', 
            value: `${products.reduce((acc: number, p) => acc + (p.stock || 0), 0)} itens`, 
            icon: Package, 
            color: 'text-primary', 
            bg: 'bg-primary/10' 
          },
          { 
            label: 'Alertas de Reposição', 
            value: `${lowStockCount} alertas`, 
            icon: AlertCircle, 
            color: 'text-danger', 
            bg: 'bg-danger/10' 
          },
        ].map((item, i) => (
          <div key={i} className="premium-card group">
            <div className="flex items-center gap-4 mb-5">
              <div className={cn("p-3 rounded-none border border-border transition-colors shadow-sm", item.bg, item.color)}>
                <item.icon size={22} />
              </div>
              <h3 className="text-xs font-semibold text-slate-400">{item.label}</h3>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* current Stock Table */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-secondary/20">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary"><ClipboardList size={18} /></div>
              Inventário Ativo
            </h2>
            <div className="w-full sm:w-[260px]">
              <SearchInput placeholder="Filtrar por nome ou SKU..." />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-surface/30 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Produto / SKU</th>
                  <th className="px-6 py-4 text-center">Vendido</th>
                  <th className="px-6 py-4 text-center">No Estoque</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">Nenhum registro encontrado.</td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-surface/40 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{p.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-tight">{p.brand || 'Selection'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-blue-400">
                          {p.sold} un
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={cn(
                            "text-sm font-bold tracking-tight",
                            p.stock <= (p.minStock || 5) ? 'text-danger' : 'text-slate-300'
                          )}>
                            {p.stock} un
                          </span>
                          {p.stock <= (p.minStock || 5) && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-danger uppercase border border-danger/20 px-1.5 py-0.5 rounded bg-danger/5">
                              <AlertCircle size={10} /> Crítico
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <StockAdjuster productId={p.id} initialStock={p.stock} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* History Table */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-center justify-between bg-bg-secondary/20">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary"><History size={18} /></div>
              Histórico de Movimentação
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
              Últimas 10 Operações
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-surface/30 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 text-right">Fluxo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm">Sem registros recentes.</td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-bg-surface/40 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-400">
                          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(item.date)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{item.product}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-danger/5 border border-danger/10 text-danger shadow-sm">
                          <TrendingDown size={12} />
                          <span className="text-xs font-bold">-{item.quantity}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
