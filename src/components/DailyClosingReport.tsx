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
      className="bg-white p-2 w-full max-w-[300px] mx-auto font-sans text-black force-black-text text-xs"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center border-b border-black pb-2 mb-4">
        <h1 className="text-sm font-bold uppercase">Fechamento de Caixa Diário</h1>
        <p className="text-xs mt-1">{formatDate(date.toISOString())}</p>
        <p className="text-[10px] mt-1 uppercase text-gray-600">Mundo das Bebidas Disk</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-black p-3">
          <h2 className="font-bold uppercase text-[10px] mb-2 border-b border-black pb-1">Resumo por Método</h2>
          <div className="space-y-1">
            {Object.entries(totalByMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-xs">
                <span className="uppercase">{method.replace(/_/g, ' ')}:</span>
                <span>R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-xs pt-2 border-t border-black mt-2">
              <span>TOTAL DIA:</span>
              <span>R$ {totalDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="border border-black p-3 flex flex-col justify-center items-center">
          <p className="text-[10px] uppercase mb-1">Total de Vendas</p>
          <p className="text-lg font-bold">{sales.length}</p>
          <p className="text-[10px] uppercase mt-1">Operações Realizadas</p>
        </div>
      </div>

      <h2 className="font-bold uppercase text-[10px] mb-2 border-b border-black pb-1">Detalhamento das Vendas</h2>
      <table className="w-full border-collapse mb-6 text-xs">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1 font-bold uppercase text-[10px]">Venda</th>
            <th className="text-left py-1 font-bold uppercase text-[10px]">Cliente</th>
            <th className="text-left py-1 font-bold uppercase text-[10px]">Pagamento</th>
            <th className="text-right py-1 font-bold uppercase text-[10px]">Valor</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b border-gray-200">
              <td className="py-1">#{sale.id.toString().padStart(4, '0')}</td>
              <td className="py-1 uppercase">{sale.client?.name || 'Venda Balcão'}</td>
              <td className="py-1 uppercase">{sale.paymentMethod}</td>
              <td className="py-1 text-right">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div className="border-t border-black pt-2 text-center">
          <p className="uppercase text-[10px]">Assinatura do Responsável</p>
        </div>
        <div className="border-t border-black pt-2 text-center">
          <p className="uppercase text-[10px]">Conferência Administrativa</p>
        </div>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-gray-200">
        <p className="text-[8px] uppercase text-gray-500">Sistema Mundo das Bebidas - Relatório de Fechamento Emitido em {formatDateTime(new Date().toISOString())}</p>
      </div>

      <div className="print:break-before-page mt-8 border-t-2 border-black pt-8">
        <DailyItemsReport sales={sales} date={date} isEmbedded={true} />
      </div>
    </div>
  );
}
