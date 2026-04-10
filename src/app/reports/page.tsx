import React from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Download, 
  DollarSign, 
  PieChart,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import PrintButton from '@/components/PrintButton';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';

async function getReportData() {
  const totalSalesCount = await prisma.sale.count();
  const sales = await prisma.sale.findMany({
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  const products = await prisma.product.findMany({
    include: {
      category: true,
      saleItems: true
    }
  });

  const revenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  
  // Calculate category sales for market share
  const catSales: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const catName = item.product.category?.name || 'Diversos';
      catSales[catName] = (catSales[catName] || 0) + (item.price * item.quantity);
    });
  });

  const categoryData = Object.entries(catSales).map(([label, amount]) => ({
    label,
    val: revenue > 0 ? Math.round((amount / revenue) * 100) : 0
  })).sort((a, b) => b.val - a.val).slice(0, 4);

  // Detailed inventory and sales data
  const inventoryReport = products.map(product => {
    const unitsSold = product.saleItems.reduce((acc, item) => acc + item.quantity, 0);
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      volume: product.volume,
      stock: product.stock,
      sold: unitsSold,
      status: product.stock <= product.minStock ? 'CRITICO' : product.stock <= product.minStock * 2 ? 'ALERTA' : 'ESTAVEL'
    };
  }).sort((a, b) => b.sold - a.sold);

  const totalUnitsSold = inventoryReport.reduce((acc, item) => acc + item.sold, 0);
  const totalStock = inventoryReport.reduce((acc, item) => acc + item.stock, 0);
  const soldOnly = inventoryReport.filter(item => item.sold > 0);

  return {
    totalSales: totalSalesCount,
    totalRevenue: revenue,
    profit: revenue * 0.35,
    categoryData,
    inventoryReport,
    totalUnitsSold,
    totalStock,
    soldOnly
  };
}

const ReportsPage = async () => {
  const data = await getReportData();

  return (
    <div className="space-y-8 pb-10">
      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-black tracking-tighter uppercase">Mundo das Bebidas Disk</h1>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Relatório Operacional de Estoque e Vendas</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase">Gerado em</p>
            <p className="text-sm font-bold text-black">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())}</p>
          </div>
        </div>
        
        {/* Print Summary Bar */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
          <div className="border border-slate-900 p-4">
            <p className="text-[10px] font-black uppercase text-slate-500">Total Vendido (Periodo)</p>
            <p className="text-2xl font-black text-black">{data.totalUnitsSold} <span className="text-xs">unidades</span></p>
          </div>
          <div className="border border-slate-900 p-4">
            <p className="text-[10px] font-black uppercase text-slate-500">Total em Estoque</p>
            <p className="text-2xl font-black text-black">{data.totalStock} <span className="text-xs">unidades</span></p>
          </div>
          <div className="border border-slate-900 p-4">
            <p className="text-[10px] font-black uppercase text-slate-500">Receita Total</p>
            <p className="text-2xl font-black text-black">R$ {data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <BarChart3 size={14} />
            <span>Business Intelligence & Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Relatórios de Desempenho</h1>
          <p className="text-slate-400 text-sm">Acompanhamento de KPIs e métricas de crescimento operacional.</p>
        </div>
        <PrintButton label="Exportar PDF/Relatório" />
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Receita Bruta', 
            value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            icon: DollarSign, 
            color: 'text-primary', 
            bg: 'bg-primary/10',
            trend: '+18%',
            trendColor: 'text-success'
          },
          { 
            label: 'Bebidas Vendidas', 
            value: data.totalUnitsSold, 
            icon: Zap, 
            color: 'text-blue-400', 
            bg: 'bg-blue-400/10',
            trend: `${data.totalSales} Pedidos`,
            trendColor: 'text-slate-500'
          },
          { 
            label: 'EBITDA Projetado', 
            value: `R$ ${data.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            icon: Target, 
            color: 'text-success', 
            bg: 'bg-success/10',
            trend: 'Margem 35%',
            trendColor: 'text-success'
          },
          { 
            label: 'Estoque Total', 
            value: data.inventoryReport.reduce((acc, item) => acc + item.stock, 0), 
            icon: PieChart, 
            color: 'text-orange-400', 
            bg: 'bg-orange-400/10',
            trend: 'Volume Ativo',
            trendColor: 'text-orange-400'
          },
        ].map((item, i) => (
          <div key={i} className="premium-card group hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-none border border-border shadow-inner bg-slate-900/50 print:border-none print:shadow-none print:bg-transparent", item.color)}>
                <item.icon size={24} className="print:hidden" />
              </div>
              <div className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none border", item.trendColor, "bg-slate-900/20 shadow-sm print:border-none print:bg-transparent")}>
                {item.trend}
              </div>
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{item.label}</h3>
            <p className="text-2xl font-bold text-white print:text-black tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="hidden print:block mt-8 space-y-6">
        <div className="border-l-4 border-black pl-4">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">Detalhamento de Bebidas Vendidas</h2>
          <p className="text-xs text-slate-500 font-bold uppercase">Listagem de itens com movimentação no período</p>
        </div>

        <table className="w-full border-collapse border border-slate-900">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-900">
              <th className="px-4 py-2 text-left text-[10px] font-black uppercase">Produto</th>
              <th className="px-4 py-2 text-center text-[10px] font-black uppercase">Qtd Vendida</th>
              <th className="px-4 py-2 text-center text-[10px] font-black uppercase">Restante</th>
              <th className="px-4 py-2 text-right text-[10px] font-black uppercase">Ref Giro</th>
            </tr>
          </thead>
          <tbody>
            {data.inventoryReport.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-bold uppercase text-[10px]">
                  Nenhum produto cadastrado no sistema
                </td>
              </tr>
            ) : (
              data.inventoryReport.map(item => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="px-4 py-3">
                    <p className="text-sm font-black text-black uppercase">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-500">{item.brand} - {item.volume}</p>
                  </td>
                  <td className="px-4 py-3 text-center border-x border-slate-200">
                    <span className="text-sm font-black text-black">{item.sold} un</span>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-200">
                    <span className="text-sm font-bold text-slate-600">{item.stock} un</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-block px-2 py-0.5 border border-black text-[8px] font-black">
                      {item.sold > item.stock ? 'ALTO GIRO' : 'REGULAR'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 gap-8 print:mt-12">
        {/* Detailed Inventory Control Table */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center bg-bg-secondary/20 print:bg-slate-100">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white print:text-black">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary print:hidden"><BarChart3 size={18} /></div>
              Controle de Estoque e Vendas por Item
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase print:hidden">
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-success rounded-full"></div> Estável</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-warning rounded-full"></div> Alerta</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 bg-danger rounded-full"></div> Crítico</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-surface/30 text-[10px] font-bold uppercase text-slate-500 tracking-wider print:bg-slate-50">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Marca/Vol</th>
                  <th className="px-6 py-4 text-center">Qtd Vendida</th>
                  <th className="px-6 py-4 text-center">Em Estoque</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.inventoryReport.map((item) => (
                  <tr key={item.id} className="hover:bg-bg-surface/40 transition-colors group">
                    <td className="px-6 py-4 font-bold text-sm text-slate-200 print:text-black">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 print:text-slate-600">{item.brand || '-'} / {item.volume || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-none bg-blue-500/10 text-blue-400 font-bold text-sm border border-blue-500/20 print:bg-transparent print:border-none print:text-blue-600">
                        {item.sold} un
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-none bg-slate-800 text-white font-bold text-sm border border-border print:bg-transparent print:border-none print:text-black">
                        {item.stock} un
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "px-2 py-0.5 rounded-none text-[9px] font-bold uppercase border",
                        item.status === 'ESTAVEL' ? "bg-success/5 text-success border-success/20" : 
                        item.status === 'ALERTA' ? "bg-warning/5 text-warning border-warning/20" :
                        "bg-danger/5 text-danger border-danger/20"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Chart */}
        <div className="premium-card space-y-8 hover:border-primary/20 transition-all duration-300 print:hidden">
          <div className="flex items-center justify-between border-b border-border pb-5">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary"><PieChart size={18} /></div>
              Market Share
            </h2>
          </div>
          
          <div className="space-y-6">
            {data.categoryData.length === 0 ? (
              <div className="py-16 text-center opacity-20">
                <BarChart3 size={40} className="mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Sem dados</p>
              </div>
            ) : (
              data.categoryData.map((cat, i) => (
                <div key={cat.label} className="group cursor-default">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors mb-2">
                    <span>{cat.label}</span>
                    <span className="text-white">{cat.val}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800/50 rounded-none overflow-hidden border border-border shadow-inner">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        i === 0 ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-success' : 'bg-slate-500'
                      )} 
                      style={{ width: `${cat.val}%` }} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="premium-card bg-gradient-to-br from-primary/5 via-transparent to-transparent relative group overflow-hidden border-primary/20 print:hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
            <TrendingUp size={160} strokeWidth={1} />
          </div>
          
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center p-6 space-y-6">
            <div className="p-6 rounded-none bg-primary/10 text-primary border border-primary/20 shadow-xl animate-float group-hover:scale-105 transition-transform duration-500">
              <Sparkles size={48} strokeWidth={1} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                <Zap size={10} fill="currentColor" />
                Insight Ativo
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Otimização de Estoque</h3>
              <p className="text-slate-400 text-xs max-w-[320px] leading-relaxed font-medium">
                Sugerimos reposição de <span className="text-white font-bold">Heineken 600ml</span> baseado no volume de vendas atual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
