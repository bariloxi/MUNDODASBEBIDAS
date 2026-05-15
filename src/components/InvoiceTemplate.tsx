'use client';

import React from 'react';

import { InvoiceWithSale } from '@/lib/types';
import { formatDateTime, formatDate } from '@/lib/utils';

interface InvoiceTemplateProps {
  data: InvoiceWithSale;
}

export default function InvoiceTemplate({ data }: InvoiceTemplateProps) {
  const otherPendingSales = data.sale.client?.sales || [];
  const otherTotal = otherPendingSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="bg-white text-black p-4 w-full max-w-[80mm] mx-auto font-mono text-[10px] leading-tight print:p-2 print:m-0 print:max-w-none">
      <div className="text-center space-y-1 mb-4 border-b border-dashed border-black pb-4">
        <h1 className="font-bold text-sm uppercase">Mundo das Bebidas Disk</h1>
        <p>CNPJ: 00.000.000/0001-00</p>
        <p>Rua Exemplo, 123 - Centro</p>
        <p>Cidade - UF | (00) 0000-0000</p>
      </div>

      <div className="text-center font-bold uppercase mb-4">
        {data.sale.paymentMethod === 'RECEBER_DEPOIS' ? 'Comprovante de Venda a Prazo' : 'Documento Auxiliar de Venda'}
      </div>

      <div className="mb-2">
        <p>CLIENTE: {data.sale.client?.name || 'Consumidor Final'}</p>
        {data.sale.client?.phone && <p>TEL: {data.sale.client.phone}</p>}
      </div>

      <div className="border-y border-dashed border-black py-1 mb-2 font-bold uppercase text-center">
        Itens Desta Venda
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="text-left font-bold py-1">Item</th>
            <th className="text-center font-bold py-1">Qtd</th>
            <th className="text-right font-bold py-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.sale.items.map((item, index) => (
            <tr key={index}>
              <td className="py-1 uppercase">{item.product.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {otherPendingSales.length > 0 && (
        <>
          <div className="border-y border-dashed border-black py-1 mb-2 font-bold uppercase text-center">
            Pendências Anteriores
          </div>
          <table className="w-full mb-4 opacity-80">
            <tbody>
              {otherPendingSales.flatMap(sale => sale.items).map((item, index) => (
                <tr key={`other-${index}`}>
                  <td className="py-1 uppercase">{item.product.name}</td>
                  <td className="text-center py-1">{item.quantity}</td>
                  <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="space-y-1 border-t border-dashed border-black pt-2 mb-4">
        <div className="flex justify-between">
          <span>Total desta Venda</span>
          <span>R$ {data.sale.total.toFixed(2)}</span>
        </div>
        {otherTotal > 0 && (
          <div className="flex justify-between">
            <span>Débitos Anteriores</span>
            <span>R$ {otherTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs pt-1 border-t border-dotted border-black">
          <span>VALOR TOTAL DEVIDO</span>
          <span>R$ {(data.sale.total + otherTotal).toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-4">
        <p className="uppercase">Pagamento: {data.sale.paymentMethod.replace(/_/g, ' ')}</p>
        {data.sale.dueDate && <p className="font-bold">VENCIMENTO: {formatDate(data.sale.dueDate)}</p>}
      </div>

      <div className="text-center space-y-2 pt-4 border-t border-dashed border-black">
        <p className="font-bold uppercase">Assinatura do Cliente:</p>
        <div className="mt-8 border-t border-black w-48 mx-auto"></div>
        <p className="text-[8px] uppercase mt-4">Emitido em {formatDateTime(new Date())}</p>
      </div>

      <div className="text-center pt-4 mt-4 border-t border-dashed border-black">
        <p className="mt-2 font-bold">Obrigado pela preferência!</p>
      </div>
    </div>
  );
}
