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
    <div 
      className="bg-white p-6 w-full max-w-[105mm] mx-auto font-sans text-[14px] leading-snug print:p-4 print:m-0 print:max-w-none shadow-lg force-black-text"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="text-center space-y-1 mb-6 border-b-4 border-black pb-6">
        <h1 className="font-black text-2xl uppercase">Mundo das Bebidas Disk</h1>
        <p className="font-bold">CNPJ: 00.000.000/0001-00</p>
        <p className="font-bold">Rua Exemplo, 123 - Centro</p>
        <p className="font-bold">Cidade - UF | (00) 0000-0000</p>
      </div>

      <div className="text-center font-black uppercase mb-6 text-lg border-2 border-black py-2">
        {data.sale.paymentMethod === 'RECEBER_DEPOIS' ? 'Comprovante de Venda a Prazo' : 'Documento Auxiliar de Venda'}
      </div>

      <div className="mb-4 space-y-2 text-md">
        <p className="font-black uppercase">CLIENTE: {data.sale.client?.name || 'Consumidor Final'}</p>
        {data.sale.client?.phone && <p className="font-black">TEL: {data.sale.client.phone}</p>}
      </div>

      <div className="border-y border-dashed border-black py-1 mb-2 font-bold uppercase text-center">
        Itens Desta Venda
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b-4 border-black">
            <th className="text-left font-black py-2 uppercase text-[12px]">Descrição do Produto</th>
            <th className="text-center font-black py-2 uppercase text-[12px] w-16">Qtd</th>
            <th className="text-right font-black py-2 uppercase text-[12px] w-28">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {data.sale.items.map((item, index) => (
            <tr key={index} className="border-b-2 border-black/20">
              <td className="py-3 pr-2">
                <div className="font-black uppercase text-[14px]">{item.product.name}</div>
                <div className="flex gap-2 text-[12px] font-black mt-1">
                  {item.product.brand && <span className="uppercase">{item.product.brand}</span>}
                  {item.product.volume && <span>{item.product.volume}</span>}
                </div>
                {item.product.barcode && (
                  <div className="text-[11px] font-mono font-black mt-1 bg-black/5 px-2 py-0.5 inline-block">
                    REF: {item.product.barcode}
                  </div>
                )}
              </td>
              <td className="text-center py-3 px-1 font-black text-[15px]">{item.quantity}</td>
              <td className="text-right py-3 pl-2 font-black text-[15px]">R$ {(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {otherPendingSales.length > 0 && (
        <>
          <div className="border-y border-dashed border-black py-1 mb-2 font-bold uppercase text-center">
            Pendências Anteriores
          </div>
          <table className="w-full mb-4">
            <tbody>
              {otherPendingSales.flatMap(sale => sale.items).map((item, index) => (
                <tr key={`other-${index}`} className="border-b border-dotted border-black/20">
                  <td className="py-2 pr-2">
                    <div className="uppercase font-bold !text-black text-[11px]">{item.product.name}</div>
                    <div className="flex gap-2 text-[9px] font-bold !text-black">
                      {item.product.brand && <span className="uppercase">{item.product.brand}</span>}
                      {item.product.volume && <span>{item.product.volume}</span>}
                    </div>
                  </td>
                  <td className="text-center py-2 px-1 font-bold !text-black">{item.quantity}</td>
                  <td className="text-right py-2 pl-2 font-bold !text-black">{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className="space-y-2 border-t-4 border-black pt-4 mb-6">
        <div className="flex justify-between font-black text-lg">
          <span>Total desta Venda</span>
          <span>R$ {data.sale.total.toFixed(2)}</span>
        </div>
        {otherTotal > 0 && (
          <div className="flex justify-between font-black text-lg">
            <span>Débitos Anteriores</span>
            <span>R$ {otherTotal.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-xl pt-2 border-t-2 border-dashed border-black mt-2">
          <span>VALOR TOTAL DEVIDO</span>
          <span>R$ {(data.sale.total + otherTotal).toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t-4 border-black pt-4 mb-8 space-y-2 text-md">
        <p className="uppercase font-black">Pagamento: {data.sale.paymentMethod.replace(/_/g, ' ')}</p>
        {data.sale.dueDate && <p className="font-black">VENCIMENTO: {formatDate(data.sale.dueDate)}</p>}
      </div>

      <div className="text-center space-y-4 pt-6 border-t-4 border-black">
        <p className="font-black uppercase text-lg">Assinatura do Cliente:</p>
        <div className="mt-12 border-t-4 border-black w-64 mx-auto"></div>
        <p className="text-[11px] font-black uppercase mt-4">Emitido em {formatDateTime(new Date())}</p>
      </div>

      <div className="text-center pt-8 mt-8 border-t-4 border-black">
        <p className="mt-2 font-black text-xl">Obrigado pela preferência!</p>
      </div>
    </div>
  );
}
