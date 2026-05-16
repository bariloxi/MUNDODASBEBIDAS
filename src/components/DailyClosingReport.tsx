'use client';

import React from 'react';
import { formatDateTime, formatDate } from '@/lib/utils';
import DailyItemsReport from './DailyItemsReport';

interface SaleItem {
  product: {
    name: string;
    brand: string | null;
    volume: string | null;
    barcode: string | null;
  };
  quantity: number;
  price: number;
}

interface Sale {
  id: number;
  createdAt: Date | string;
  total: number;
  paymentMethod: string;
  client?: { name: string } | null;
  items: SaleItem[];
}

interface DailyClosingReportProps {
  sales: Sale[];
  date: Date;
}

export default function DailyClosingReport({ sales, date }: DailyClosingReportProps) {
  const totalByMethod = sales.reduce((acc: Record<string, number>, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
    return acc;
  }, {});

  const totalDay = sales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div 
      className="bg-white p-8 w-full max-w-[210mm] mx-auto font-sans text-black force-black-text"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center border-b-4 border-black pb-6 mb-8">
        <h1 className="text-3xl font-black uppercase">Fechamento de Caixa Diário</h1>
        <p className="text-xl font-bold mt-2">{formatDate(date.toISOString())}</p>
        <p className="text-sm mt-1 uppercase">Mundo das Bebidas Disk</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="border-2 border-black p-4">
          <h2 className="font-black uppercase text-sm mb-4 border-b-2 border-black pb-2">Resumo por Método</h2>
          <div className="space-y-2">
            {Object.entries(totalByMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between font-bold text-lg">
                <span className="uppercase">{method.replace(/_/g, ' ')}:</span>
                <span>R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-2xl pt-4 border-t-4 border-black mt-4">
              <span>TOTAL DIA:</span>
              <span>R$ {totalDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="border-2 border-black p-4 flex flex-col justify-center items-center">
          <p className="text-sm font-black uppercase mb-2">Total de Vendas</p>
          <p className="text-6xl font-black">{sales.length}</p>
          <p className="text-sm font-bold uppercase mt-2">Operações Realizadas</p>
        </div>
      </div>

      <h2 className="font-black uppercase text-lg mb-4 border-b-4 border-black pb-2">Detalhamento das Vendas</h2>
      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="border-b-4 border-black">
            <th className="text-left py-2 font-black uppercase text-sm">Venda</th>
            <th className="text-left py-2 font-black uppercase text-sm">Cliente</th>
            <th className="text-left py-2 font-black uppercase text-sm">Pagamento</th>
            <th className="text-right py-2 font-black uppercase text-sm">Valor</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b-2 border-black/10">
              <td className="py-4 font-bold">#{sale.id.toString().padStart(4, '0')}</td>
              <td className="py-4 font-black uppercase">{sale.client?.name || 'Venda Balcão'}</td>
              <td className="py-4 font-bold uppercase">{sale.paymentMethod}</td>
              <td className="py-4 text-right font-black text-lg">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-20 grid grid-cols-2 gap-20">
        <div className="border-t-4 border-black pt-4 text-center">
          <p className="font-black uppercase text-sm">Assinatura do Responsável</p>
        </div>
        <div className="border-t-4 border-black pt-4 text-center">
          <p className="font-black uppercase text-sm">Conferência Administrativa</p>
        </div>
      </div>

      <div className="text-center mt-20 pt-10 border-t-2 border-black/10">
        <p className="text-[10px] font-bold uppercase">Sistema Mundo das Bebidas - Relatório de Fechamento Emitido em {formatDateTime(new Date().toISOString())}</p>
      </div>

      <div className="print:break-before-page mt-12 border-t-8 border-black pt-12">
        <DailyItemsReport sales={sales} date={date} isEmbedded={true} />
      </div>
    </div>
  );
}
