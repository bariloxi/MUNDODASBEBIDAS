import React from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  DollarSign, 
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  TrendingUp,
  Receipt,
  PieChart,
  ArrowRight
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ExpenseForm from '@/components/ExpenseForm';
import { getExpenses, getSales } from '@/lib/actions';
import { cn } from '@/lib/utils';
import InvoiceAction from '@/components/InvoiceAction';
import { SaleWithRelations } from '@/lib/types';

async function getFinanceData() {
  const sales = await getSales();
  const expenses = await getExpenses();
  
  const totalRevenue = sales.reduce((acc: number, sale) => acc + sale.total, 0);
  const totalExpenses = expenses.reduce((acc: number, exp) => acc + exp.amount, 0);
  
  const byMethod = (sales as SaleWithRelations[]).reduce((acc: Record<string, number>, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
  }, {});

  return {
    totalRevenue,
    totalExpenses,
    byMethod,
    salesCount: sales.length,
    expenses,
    sales
  };
}

const FinancePage = async () => {
  const data = await getFinanceData();

  const methods = [
    { label: 'Dinheiro', color: 'text-success', icon: Banknote, value: data.byMethod['Dinheiro'] || 0, bg: 'bg-success/5' },
    { label: 'Cartão', color: 'text-blue-400', icon: CreditCard, value: data.byMethod['CARTAO_CREDITO'] || data.byMethod['CARTAO_DEBITO'] || 0, bg: 'bg-blue-400/5' },
    { label: 'Pix', color: 'text-primary', icon: QrCode, value: data.byMethod['PIX'] || 0, bg: 'bg-primary/5' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <DollarSign size={14} />
            <span>Controladoria & Gestão</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fluxo Financeiro</h1>
          <p className="text-slate-400 text-sm">Visão consolidada de receitas, despesas e saúde fiscal.</p>
        </div>
        <div className="flex items-center gap-3 bg-bg-surface/50 border border-border py-2 px-5 rounded-none text-xs font-semibold text-slate-300 shadow-sm">
          <Calendar size={14} className="text-primary" />
          Março 2026
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Patrimônio Estimado', 
            value: `R$ ${(data.totalRevenue - data.totalExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            icon: Wallet, 
            color: 'text-primary', 
            bg: 'bg-primary/10',
            trend: '+12.5% vs mês ant.',
            trendColor: 'text-success'
          },
          { 
            label: 'Entradas de Capital', 
            value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            icon: ArrowUpCircle, 
            color: 'text-success', 
            bg: 'bg-success/10',
            trend: 'R$ 450,00 média diária',
            trendColor: 'text-slate-400'
          },
          { 
            label: 'Saídas / Custos', 
            value: `R$ ${data.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
            icon: ArrowDownCircle, 
            color: 'text-danger', 
            bg: 'bg-danger/10',
            trend: `${data.expenses.length} lançamentos`,
            trendColor: 'text-slate-400'
          },
        ].map((item, i) => (
          <div key={i} className="premium-card group hover:scale-[1.01]">
            <div className="flex justify-between items-start mb-5">
              <div className={cn("p-3 rounded-none border border-border transition-colors", item.bg, item.color)}>
                <item.icon size={22} />
              </div>
              <div className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-none bg-white/5", item.trendColor)}>
                {item.trend}
              </div>
            </div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">{item.label}</h3>
            <p className="text-2xl font-bold text-white tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Methods */}
        <div className="premium-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary"><PieChart size={18} /></div>
              Composição de Receita
            </h2>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Apurado via PDV</span>
          </div>
          <div className="space-y-3">
            {methods.map((m) => (
              <div key={m.label} className="group relative flex items-center justify-between p-4 rounded-none bg-bg-surface/30 border border-border hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-none border border-border", m.bg, m.color)}>
                    <m.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{m.label}</h4>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Participação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-white">R$ {m.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest opacity-60">Liquidado</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History & Invoice Generator */}
        <div className="premium-card space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="text-lg font-bold flex items-center gap-3 text-white">
              <div className="p-1.5 rounded-none bg-primary/10 text-primary"><Receipt size={18} /></div>
              Histórico de Vendas
            </h2>
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono">Últimas 50 transações</span>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {data.salesCount === 0 ? (
              <div className="py-20 text-center opacity-30">
                <Receipt size={48} className="mx-auto mb-4 stroke-1" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Nenhum registro encontrado</p>
              </div>
            ) : (
              data.sales.map((sale) => (
                <div key={sale.id} className="group flex items-center justify-between p-4 rounded-none bg-bg-surface/20 border border-border hover:bg-bg-surface/40 hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[50px] p-2.5 rounded-none bg-slate-900/50 border border-border group-hover:border-primary/20 transition-colors">
                      <p className="text-[8px] font-bold text-slate-500 uppercase leading-none mb-1">DATA</p>
                      <p className="text-xs font-black text-slate-200">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm text-slate-100 italic">#{sale.id.toString().padStart(4, '0')}</h4>
                        <div className="h-1 w-1 rounded-none bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-400">
                        {(sale as SaleWithRelations).client?.name || 'Venda Balcão'} 
                        <span className="mx-2 text-slate-700">•</span>
                        {(sale as SaleWithRelations).items?.length || 0} {(sale as SaleWithRelations).items?.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-lg font-black text-white tracking-tight text-right">
                        R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <InvoiceAction saleId={sale.id} initialInvoice={(sale as SaleWithRelations).invoice} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
