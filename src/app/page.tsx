import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Clock,
  ChevronRight
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { cn } from '@/lib/utils';

async function getDashboardData() {
  const totalSales = await prisma.sale.aggregate({
    _sum: { total: true },
    _count: true
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const salesToday = await prisma.sale.aggregate({
    where: { createdAt: { gte: today } },
    _sum: { total: true }
  });

  const lowStockCount = await prisma.product.count({
    where: { stock: { lte: 10 } }
  });

  const recentSales = await prisma.sale.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
    include: { items: true, client: true }
  });

  return {
    totalRevenue: totalSales._sum.total || 0,
    totalCount: totalSales._count || 0,
    todayRevenue: salesToday._sum.total || 0,
    lowStockCount,
    recentSales
  };
}

const Dashboard = async () => {
  const data = await getDashboardData();

  const stats = [
    { 
      label: 'Receita Operacional', 
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: TrendingUp, 
      trend: '+12.5%', 
      trendUp: true,
      color: 'text-orange-500'
    },
    { 
      label: 'Vendas (Hoje)', 
      value: `R$ ${data.todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: ShoppingCart, 
      trend: '+4.2%', 
      trendUp: true,
      color: 'text-orange-400'
    },
    { 
      label: 'Volume de Pedidos', 
      value: data.totalCount.toString(), 
      icon: Package, 
      trend: '-2.1%', 
      trendUp: false,
      color: 'text-amber-500'
    },
    { 
      label: 'Alertas de Estoque', 
      value: data.lowStockCount.toString(), 
      icon: Users, 
      trend: data.lowStockCount > 5 ? 'Atenção' : 'Estável', 
      trendUp: data.lowStockCount <= 5,
      color: 'text-orange-600'
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header - Simples e Sem Sobreposição */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Painel Operacional</h1>
          <div className="h-0.5 w-16 bg-primary rounded-none mt-2" />
          <p className="text-slate-500 text-[11px] mt-2 font-medium italic">Visão consolidada para tomada de decisão estratégica.</p>
        </div>
        <div className="flex items-center gap-3 bg-bg-surface/50 border border-border py-2 px-5 rounded-none text-xs font-semibold text-slate-300 shadow-sm">
          <Calendar size={14} className="text-primary" />
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())}
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="premium-card relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-none border border-border transition-colors", stat.color, "bg-bg-accent/40")}>
                <stat.icon size={20} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border",
                stat.trendUp ? "bg-success/5 border-success/20 text-success" : "bg-danger/5 border-danger/20 text-danger"
              )}>
                {stat.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Section */}
        <div className="lg:col-span-2 premium-card overflow-hidden !p-0">
          <div className="p-5 border-b border-border/60 flex justify-between items-baseline bg-bg-secondary/40">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary"><Clock size={18} /></div>
              Fluxo de Atividade
            </h2>
            <Link href="/finance" className="text-xs font-bold text-primary hover:underline transition-all flex items-center gap-1.5 group">
              Ver Tudo <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border/40">
                <tr className="bg-bg-surface/30 text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-3.5 border-none">Status</th>
                  <th className="px-6 py-3.5 border-none">Cliente / Identificação</th>
                  <th className="px-6 py-3.5 border-none">Data/Hora</th>
                  <th className="px-6 py-3.5 text-right border-none">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.recentSales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">Aguardando transações...</td>
                  </tr>
                ) : (
                  data.recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-bg-surface/40 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-none text-[9px] font-bold uppercase border",
                          sale.status === 'CONCLUIDA' ? "bg-success/5 text-success border-success/20" : 
                          sale.status === 'SAIU_PARA_ENTREGA' ? "bg-primary/5 text-primary border-primary/20" :
                          "bg-warning/5 text-warning border-warning/20"
                        )}>
                          {sale.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-sm text-slate-200">{sale.client?.name || 'Venda de Balcão'}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-tight">TRX-{sale.id.toString().padStart(5, '0')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-400 capitalize">
                          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(sale.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-white">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="premium-card space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ações Estratégicas</h3>
            <div className="space-y-3">
              <Link href="/pdv" className="flex items-center justify-between p-4 rounded-none bg-bg-surface/40 border border-border hover:border-primary/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-none bg-primary/10 text-primary">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-200 leading-none mb-1">Ponto de Venda</span>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">Caixa Rápido</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-primary transition-all" />
              </Link>
              
              <Link href="/inventory" className="flex items-center justify-between p-4 rounded-none bg-bg-surface/40 border border-border hover:border-success/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-none bg-success/10 text-success">
                    <Package size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-200 leading-none mb-1">Estoque</span>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">Gestão Ativa</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-success transition-all" />
              </Link>
            </div>
          </div>

          {/* Performance Insight */}
          <div className="premium-card text-center p-8 space-y-4">
            <div className="h-16 w-16 rounded-none bg-primary/5 mx-auto flex items-center justify-center text-primary border border-primary/10">
              <TrendingUp size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Monitor de Insights</h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Suas vendas de <span className="text-white font-bold">Bebidas Destiladas</span> tiveram alta de <span className="text-success font-bold">18.4%</span> esta semana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
