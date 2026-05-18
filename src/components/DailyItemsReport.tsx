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
  isEmbedded?: boolean;
}

interface GroupedItem {
  name: string;
  brand: string | null;
  volume: string | null;
  barcode: string | null;
  quantity: number;
}

export default function DailyItemsReport({ sales, date, isEmbedded }: DailyItemsReportProps) {
  // Group items by product
  const groupedItems = sales.flatMap(s => s.items).reduce((acc: Record<string, GroupedItem>, item) => {
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

  const itemsList = Object.values(groupedItems).sort((a: GroupedItem, b: GroupedItem) => b.quantity - a.quantity);

  return (
    <div 
      className={`bg-white w-full max-w-[210mm] mx-auto font-sans text-black force-black-text text-xs ${isEmbedded ? '' : 'p-8'}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center border-b border-black pb-3 mb-6">
        <h1 className="text-lg font-bold uppercase">Relatório de Itens Vendidos</h1>
        <p className="text-sm font-semibold mt-1">{formatDate(date.toISOString())}</p>
        <p className="text-[10px] mt-0.5 uppercase text-gray-500">Controle de Saída de Estoque</p>
      </div>

      <table className="w-full border-collapse mb-8 text-xs">
        <thead>
          <tr className="border-b border-black !bg-transparent">
            <th className="text-left py-2 font-bold uppercase text-[10px] !p-2 !bg-transparent !text-black">Produto / Descrição</th>
            <th className="text-center py-2 font-bold uppercase text-[10px] w-32 !p-2 !bg-transparent !text-black">Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.map((item: GroupedItem, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-2 !p-2 !text-black">
                <div className="font-bold uppercase text-sm">{item.name}</div>
                <div className="flex gap-2 text-xs mt-0.5 text-gray-600">
                  {item.brand && <span className="uppercase">{item.brand}</span>}
                  {item.volume && <span>{item.volume}</span>}
                </div>
                {item.barcode && <div className="text-[9px] font-mono mt-0.5 text-gray-400">REF: {item.barcode}</div>}
              </td>
              <td className="text-center py-2 !p-2 !text-black">
                <span className="text-base font-bold">{item.quantity}</span>
                <span className="text-xs uppercase ml-1 text-gray-500">un</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-12 border-t border-gray-200 pt-4 text-center">
        <p className="text-[8px] uppercase text-gray-400">Mundo das Bebidas - Relatório de Movimentação de Itens - Gerado em {formatDateTime(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
