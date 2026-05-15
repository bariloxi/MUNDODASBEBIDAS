'use client';

import React from 'react';
import { formatDateTime, formatDate } from '@/lib/utils';

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
  items: SaleItem[];
}

interface DailyItemsReportProps {
  sales: Sale[];
  date: Date;
}

export default function DailyItemsReport({ sales, date }: DailyItemsReportProps) {
  // Group items by product
  const groupedItems = sales.flatMap(s => s.items).reduce((acc: any, item) => {
    const key = `${item.product.name}-${item.product.volume || ''}`;
    if (!acc[key]) {
      acc[key] = {
        name: item.product.name,
        brand: item.product.brand,
        volume: item.product.volume,
        barcode: item.product.barcode,
        quantity: 0
      };
    }
    acc[key].quantity += item.quantity;
    return acc;
  }, {});

  const itemsList = Object.values(groupedItems).sort((a: any, b: any) => b.quantity - a.quantity);

  return (
    <div 
      className="bg-white p-8 w-full max-w-[210mm] mx-auto font-sans text-black force-black-text"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center border-b-4 border-black pb-6 mb-8">
        <h1 className="text-3xl font-black uppercase">Relatório de Itens Vendidos</h1>
        <p className="text-xl font-bold mt-2">{formatDate(date.toISOString())}</p>
        <p className="text-sm mt-1 uppercase">Controle de Saída de Estoque</p>
      </div>

      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="border-b-4 border-black">
            <th className="text-left py-3 font-black uppercase text-sm">Produto / Descrição</th>
            <th className="text-center py-3 font-black uppercase text-sm w-32">Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.map((item: any, index) => (
            <tr key={index} className="border-b-2 border-black/10">
              <td className="py-4">
                <div className="font-black uppercase text-lg">{item.name}</div>
                <div className="flex gap-2 text-sm font-bold mt-1">
                  {item.brand && <span className="uppercase">{item.brand}</span>}
                  {item.volume && <span>{item.volume}</span>}
                </div>
                {item.barcode && <div className="text-xs font-mono font-bold mt-1 opacity-50">REF: {item.barcode}</div>}
              </td>
              <td className="text-center py-4">
                <span className="text-3xl font-black">{item.quantity}</span>
                <span className="text-sm font-bold uppercase ml-2">un</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-20 border-t-2 border-black/10 pt-10 text-center">
        <p className="text-[10px] font-bold uppercase">Mundo das Bebidas - Relatório de Movimentação de Itens - Gerado em {formatDateTime(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
