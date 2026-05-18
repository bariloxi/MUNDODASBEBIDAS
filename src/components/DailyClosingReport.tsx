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
      className="bg-white p-8 w-full max-w-[210mm] mx-auto font-sans text-black force-black-text text-xs"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center border-b border-black pb-3 mb-6">
        <h1 className="text-lg font-bold uppercase">Fechamento de Caixa Diário</h1>
        <p className="text-sm font-semibold mt-1">{formatDate(date.toISOString())}</p>
        <p className="text-[10px] mt-0.5 uppercase text-gray-500">Mundo das Bebidas Disk</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border border-black p-4">
          <h2 className="font-bold uppercase text-[10px] mb-3 border-b border-black pb-1">Resumo por Método</h2>
          <div className="space-y-1.5">
            {Object.entries(totalByMethod).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-xs">
                <span className="uppercase text-gray-700">{method.replace(/_/g, ' ')}:</span>
                <span className="font-semibold">R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-xs pt-2 border-t border-black mt-2">
              <span>TOTAL DIA:</span>
              <span>R$ {totalDay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="border border-black p-4 flex flex-col justify-center items-center">
          <p className="text-[10px] font-bold uppercase text-gray-500 mb-1">Total de Vendas</p>
          <p className="text-3xl font-bold">{sales.length}</p>
          <p className="text-[10px] font-bold uppercase text-gray-500 mt-1">Operações Realizadas</p>
        </div>
      </div>

      <h2 className="font-bold uppercase text-[10px] mb-2 border-b border-black pb-1">Detalhamento das Vendas</h2>
      <table className="w-full border-collapse mb-8 text-xs">
        <thead>
          <tr className="border-b border-black !bg-transparent">
            <th className="text-left py-2 font-bold uppercase text-[10px] !p-2 !bg-transparent !text-black">Venda</th>
            <th className="text-left py-2 font-bold uppercase text-[10px] !p-2 !bg-transparent !text-black">Produto / Descrição</th>
            <th className="text-left py-2 font-bold uppercase text-[10px] !p-2 !bg-transparent !text-black">Pagamento</th>
            <th className="text-right py-2 font-bold uppercase text-[10px] !p-2 !bg-transparent !text-black">Valor</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b border-gray-200">
              <td className="py-2 !p-2 !text-black">#{sale.id.toString().padStart(4, '0')}</td>
              <td className="py-2 !p-2 !text-black">
                <div className="space-y-1">
                  {sale.items?.map((item, idx) => (
                    <div key={idx} className="text-[10px] leading-tight">
                      <span className="font-bold text-gray-900">{item.quantity}x</span>{' '}
                      <span className="uppercase">{item.product?.name}</span>
                      {(item.product?.brand || item.product?.volume) && (
                        <span className="text-gray-500 lowercase text-[9px] ml-1">
                          ({[item.product?.brand, item.product?.volume].filter(Boolean).join(' ')})
                        </span>
                      )}
                    </div>
                  ))}
                  {(!sale.items || sale.items.length === 0) && (
                    <span className="text-gray-400 italic text-[10px]">Sem itens</span>
                  )}
                </div>
              </td>
              <td className="py-2 uppercase !p-2 !text-black">{sale.paymentMethod}</td>
              <td className="py-2 text-right !p-2 !text-black font-semibold">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 grid grid-cols-2 gap-12">
        <div className="border-t border-black pt-2 text-center">
          <p className="uppercase text-[9px] text-gray-600">Assinatura do Responsável</p>
        </div>
        <div className="border-t border-black pt-2 text-center">
          <p className="uppercase text-[9px] text-gray-600">Conferência Administrativa</p>
        </div>
      </div>

      <div className="text-center mt-12 pt-4 border-t border-gray-200">
        <p className="text-[8px] uppercase text-gray-400">Sistema Mundo das Bebidas - Relatório de Fechamento Emitido em {formatDateTime(new Date().toISOString())}</p>
      </div>

      <div className="print:break-before-page mt-12 border-t-2 border-black pt-12">
        <DailyItemsReport sales={sales} date={date} isEmbedded={true} />
      </div>
    </div>
  );
}
