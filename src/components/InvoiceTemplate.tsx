'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

import { InvoiceWithSale } from '@/lib/types';

interface InvoiceTemplateProps {
  data: InvoiceWithSale;
}

export default function InvoiceTemplate({ data }: InvoiceTemplateProps) {
  const subtotal = data.sale.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="bg-white text-black p-4 w-full max-w-[80mm] mx-auto font-mono text-[10px] leading-tight print:p-2 print:m-0 print:max-w-none">
      <div className="text-center space-y-1 mb-4 border-b border-dashed border-black pb-4">
        <h1 className="font-bold text-sm uppercase">Mundo das Bebidas Disk</h1>
        <p>CNPJ: 00.000.000/0001-00</p>
        <p>Rua Exemplo, 123 - Centro</p>
        <p>Cidade - UF | (00) 0000-0000</p>
      </div>

      <div className="text-center font-bold uppercase mb-4">
        Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="text-left font-bold py-1">Item</th>
            <th className="text-center font-bold py-1">Qtd</th>
            <th className="text-right font-bold py-1">Vl. Un</th>
            <th className="text-right font-bold py-1">Vl. Tot</th>
          </tr>
        </thead>
        <tbody>
          {data.sale.items.map((item, index) => (
            <tr key={index}>
              <td className="py-1 uppercase">{item.product.name}</td>
              <td className="text-center py-1">{item.quantity}</td>
              <td className="text-right py-1">{item.price.toFixed(2)}</td>
              <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 border-t border-dashed border-black pt-2 mb-4">
        <div className="flex justify-between">
          <span>Qtd. Total de Itens</span>
          <span>{data.sale.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Valor Total R$</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
        {data.sale.discount > 0 && (
          <div className="flex justify-between font-bold">
            <span>Desconto R$</span>
            <span>-{data.sale.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-xs">
          <span>Valor a Pagar R$</span>
          <span>{data.sale.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-4">
        <div className="flex justify-between uppercase">
          <span>Forma de Pagamento</span>
          <span>Valor Pago</span>
        </div>
        <div className="flex justify-between">
          <span className="uppercase">{data.sale.paymentMethod.replace(/_/g, ' ')}</span>
          <span>{data.sale.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center space-y-2 pt-4 border-t border-dashed border-black">
        <p className="font-bold">Número: {data.number} Série: 001</p>
        <p>Emissão: {new Date(data.createdAt).toLocaleString('pt-BR')}</p>
        <div className="flex justify-center py-2">
          <QRCodeSVG value={`https://dfe-portal.svrs.rs.gov.br/nfce/qr?p=${data.accessKey}`} size={120} />
        </div>
        <p className="text-[8px] break-all uppercase">Chave de Acesso:</p>
        <p className="text-[8px] break-all">{data.accessKey.match(/.{1,4}/g)?.join(' ')}</p>
      </div>

      <div className="text-center pt-4 mt-4 border-t border-dashed border-black">
        <p className="uppercase text-[8px]">Consumidor: {data.sale.client?.name || 'Consumidor Final'}</p>
        <p className="mt-2">Obrigado pela preferência!</p>
      </div>
    </div>
  );
}
