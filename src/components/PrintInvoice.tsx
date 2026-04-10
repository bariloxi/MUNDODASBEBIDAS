'use client';

import React from 'react';

interface SaleItem {
  id: number;
  product: {
    name: string;
    volume: string | null;
  };
  quantity: number;
  price: number;
}

interface Sale {
  id: number;
  createdAt: Date | string;
  total: number;
  discount: number;
  paymentMethod: string;
  client?: {
    name: string;
    phone: string | null;
    address: string | null;
  } | null;
  items: SaleItem[];
}

export default function PrintInvoice({ sale }: { sale: Sale }) {
  if (!sale) return null;

  return (
    <div className="hidden print:block !bg-white !text-black font-sans w-full min-h-screen p-[1cm]">
      <div className="max-w-[190mm] mx-auto !text-black">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter leading-none !text-black">Mundo das Bebidas</h1>
            <p className="text-sm font-bold !text-black/60 uppercase tracking-widest">Premium Beverage Delivery System</p>
            <div className="pt-4 text-[11px] font-bold !text-black space-y-1 uppercase">
              <p>Av. das Esmeraldas, 1000 - Centro</p>
              <p>WhatsApp: (11) 99999-9999</p>
              <p>CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-black !text-white px-6 py-2 mb-4">
              <h2 className="text-xl font-black uppercase tracking-widest !text-white">Recibo / Nota</h2>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black !text-black/40 uppercase tracking-widest">Documento Nº</p>
              <p className="text-2xl font-black tabular-nums !text-black">#INV-{sale.id.toString().padStart(5, '0')}</p>
              <p className="text-xs font-bold !text-black/60 pt-2">{new Date(sale.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        {/* Customer & Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="border-l-4 border-black pl-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest !text-black/40">Dados do Cliente</h3>
            {sale.client ? (
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] font-black !text-black/60 uppercase">Nome / Razão Social</p>
                  <p className="text-sm font-bold uppercase !text-black">{sale.client.name}</p>
                </div>
                {sale.client.phone && (
                  <div>
                    <p className="text-[9px] font-black !text-black/60 uppercase">Contato</p>
                    <p className="text-sm font-bold !text-black">{sale.client.phone}</p>
                  </div>
                )}
                {sale.client.address && (
                  <div>
                    <p className="text-[9px] font-black !text-black/60 uppercase">Endereço de Entrega</p>
                    <p className="text-sm font-bold !text-black">{sale.client.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-bold italic !text-black/40">Consumidor Final (Venda de Balcão)</p>
            )}
          </div>
          <div className="border-l-4 border-black pl-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest !text-black/40">Detalhes do Pagamento</h3>
            <div className="space-y-2">
              <div>
                <p className="text-[9px] font-black !text-black/60 uppercase">Método Utilizado</p>
                <p className="text-sm font-bold underline underline-offset-4 decoration-2 !text-black">{sale.paymentMethod}</p>
              </div>
              <div>
                <p className="text-[9px] font-black !text-black/60 uppercase">Status do Documento</p>
                <p className="text-sm font-bold uppercase tracking-widest border border-black px-2 py-0.5 inline-block !text-black">Liquidado / Pago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y-2 border-black !bg-slate-100">
                <th className="py-4 px-3 text-left text-[10px] font-black uppercase tracking-widest !text-black">Produto / Descrição</th>
                <th className="py-4 px-3 text-center text-[10px] font-black uppercase tracking-widest w-24 !text-black">Qtd</th>
                <th className="py-4 px-3 text-right text-[10px] font-black uppercase tracking-widest w-32 !text-black">Unitário</th>
                <th className="py-4 px-3 text-right text-[10px] font-black uppercase tracking-widest w-32 !text-black">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 border-b-2 border-black">
              {sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-3">
                    <p className="text-xs font-bold uppercase !text-black">{item.product.name}</p>
                    {item.product.volume && <p className="text-[9px] font-bold !text-black/70 mt-0.5">{item.product.volume}</p>}
                  </td>
                  <td className="py-4 px-3 text-center text-xs font-bold !text-black">{item.quantity}</td>
                  <td className="py-4 px-3 text-right text-xs font-medium tabular-nums !text-black">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="py-4 px-3 text-right text-xs font-black tabular-nums !text-black">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-20">
          <div className="w-80 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold !text-black border-b border-dashed border-black/30 pb-2">
              <span className="uppercase">Subtotal Bruto</span>
              <span className="tabular-nums">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between items-center text-xs font-black border-b border-dashed border-black/30 pb-2 italic">
                <span className="uppercase !text-black">(-) Descontos Aplicados</span>
                <span className="tabular-nums !text-black font-bold">R$ {sale.discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center bg-black !text-white p-4">
              <span className="text-xs font-black uppercase tracking-widest !text-white">Valor Total Recebido</span>
              <span className="text-2xl font-black tabular-nums !text-white">R$ {(sale.total - sale.discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Signatures / Authentication */}
        <div className="grid grid-cols-2 gap-24 mt-24 mb-12">
          <div className="border-t-2 border-black pt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest !text-black">Responsável pela Emissão</p>
          </div>
          <div className="border-t-2 border-black pt-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest !text-black">Assinatura do Recebedor</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black/10 pt-10 text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] !text-black/50">Obrigado pela sua compra!</p>
          <p className="text-[8px] font-bold !text-black/40 uppercase tracking-widest">Aurora Engine - Sistema de Gestão Premium de Distribuidoras</p>
        </div>
      </div>
    </div>
  );
}
