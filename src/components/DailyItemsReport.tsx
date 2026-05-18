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
      className={`bg-white w-full max-w-[300px] mx-auto font-sans text-black force-black-text text-xs ${isEmbedded ? '' : 'p-2'}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center border-b border-black pb-2 mb-4">
        <h1 className="text-sm font-bold uppercase">Relatório de Itens Vendidos</h1>
        <p className="text-xs mt-1">{formatDate(date.toISOString())}</p>
        <p className="text-[10px] mt-1 uppercase text-gray-600">Controle de Saída de Estoque</p>
      </div>

      <table className="w-full border-collapse mb-6 text-xs">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1 font-bold uppercase text-[10px]">Produto / Descrição</th>
            <th className="text-center py-1 font-bold uppercase text-[10px] w-24">Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {itemsList.map((item: GroupedItem, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-1">
                <div className="font-bold uppercase text-xs">{item.name}</div>
                <div className="flex gap-2 text-[10px] mt-0.5 text-gray-700">
                  {item.brand && <span className="uppercase">{item.brand}</span>}
                  {item.volume && <span>{item.volume}</span>}
                </div>
                {item.barcode && <div className="text-[8px] font-mono mt-0.5 text-gray-500">REF: {item.barcode}</div>}
              </td>
              <td className="text-center py-1">
                <span className="text-sm font-bold">{item.quantity}</span>
                <span className="text-[10px] uppercase ml-1">un</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 border-t border-gray-200 pt-4 text-center">
        <p className="text-[8px] uppercase text-gray-500">Mundo das Bebidas - Relatório de Movimentação de Itens - Gerado em {formatDateTime(new Date().toISOString())}</p>
      </div>
    </div>
  );
}
