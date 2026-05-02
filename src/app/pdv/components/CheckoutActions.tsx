'use client';

import React from 'react';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Clock, 
  Ticket, 
  Plus, 
  Receipt,
  Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutActionsProps {
  subtotal: number;
  total: number;
  discount: number;
  surcharge: number;
  setDiscount: (val: number) => void;
  setSurcharge: (val: number) => void;
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  amountReceived: number | string;
  setAmountReceived: (val: number | string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
  isLoading: boolean;
  onFinalize: () => void;
  isDisabled: boolean;
}

export function CheckoutActions({
  subtotal,
  total,
  discount,
  surcharge,
  setDiscount,
  setSurcharge,
  paymentMethod,
  setPaymentMethod,
  amountReceived,
  setAmountReceived,
  dueDate,
  setDueDate,
  isLoading,
  onFinalize,
  isDisabled
}: CheckoutActionsProps) {
  const change = typeof amountReceived === 'number' ? Math.max(0, amountReceived - total) : 0;

  const paymentMethods = [
    { id: 'DINHEIRO', icon: Banknote, label: 'Espécie' },
    { id: 'PIX', icon: QrCode, label: 'Pix' },
    { id: 'CARTAO', icon: CreditCard, label: 'Cartão' },
    { id: 'RECEBER_DEPOIS', icon: Clock, label: 'Pagar Depois' },
  ];

  return (
    <div className="p-6 bg-bg-secondary/40 border-t-2 border-primary space-y-6">
      <div className="space-y-4">
        {/* Subtotal & Adjustments */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Subtotal</span>
            <span className="text-sm font-bold text-zinc-300">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Desconto</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-surface/60 border border-border focus-within:border-primary/50 transition-all">
                <Ticket size={14} className="text-primary/60" />
                <input
                  type="number"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full bg-transparent outline-none text-sm font-bold text-white placeholder:text-zinc-700"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Acréscimo</label>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-bg-surface/60 border border-border focus-within:border-primary/50 transition-all">
                <Plus size={14} className="text-primary/60" />
                <input
                  type="number"
                  value={surcharge || ''}
                  onChange={(e) => setSurcharge(Number(e.target.value))}
                  placeholder="0,00"
                  className="w-full bg-transparent outline-none text-sm font-bold text-white placeholder:text-zinc-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total Display */}
        <div className="flex flex-col items-center py-4 px-6 rounded-2xl bg-primary/5 border border-primary/20 shadow-inner">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Total a Receber</span>
          <span className="text-4xl font-black text-white tracking-tighter">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-2 gap-2">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all text-center min-h-[72px]",
                paymentMethod === method.id
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(249,115,22,0.15)] ring-1 ring-primary/50"
                  : "border-border bg-bg-surface/40 text-zinc-500 hover:border-primary/40 hover:text-zinc-300"
              )}
            >
              <method.icon size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">{method.label}</span>
            </button>
          ))}
        </div>

        {/* Cash Payment specific details */}
        {paymentMethod === 'DINHEIRO' && (
          <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center p-4 rounded-xl bg-bg-surface/80 border border-primary/30 shadow-xl">
              <div className="flex flex-col">
                <span className="text-[9px] text-primary font-black uppercase tracking-widest leading-none mb-1">Valor Recebido</span>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Banknote size={16} />
                  <span className="text-[10px] font-bold uppercase">Em espécie</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-zinc-500">R$</span>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0,00"
                  autoFocus
                  className="w-28 bg-transparent text-right outline-none text-2xl font-black text-white placeholder:text-zinc-800"
                />
              </div>
            </div>

            {typeof amountReceived === 'number' && amountReceived > total && (
              <div className="flex justify-between items-center p-4 rounded-xl bg-success/10 border border-success/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                <span className="text-[10px] font-black text-success uppercase tracking-widest">Troco a devolver</span>
                <span className="text-2xl font-black text-white tracking-tighter">
                  R$ {change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Credit Payment specific details */}
        {paymentMethod === 'RECEBER_DEPOIS' && (
          <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <CalendarIcon size={12} className="text-primary" />
              Data para Recebimento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={cn(
                "w-full bg-bg-surface border border-primary/30 p-4 rounded-xl outline-none",
                "focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm font-bold text-white",
                "color-scheme-dark"
              )}
            />
          </div>
        )}
      </div>

      <button
        onClick={onFinalize}
        disabled={isDisabled || isLoading}
        className={cn(
          "w-full py-5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm uppercase tracking-[0.2em]",
          "shadow-[0_10px_30px_-10px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-4",
          "disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group active:scale-[0.98]",
          isLoading && "cursor-wait"
        )}
      >
        {isLoading ? (
          <Plus size={20} className="animate-spin" />
        ) : (
          <Receipt size={20} className="group-hover:rotate-12 transition-transform" />
        )}
        <span>Finalizar Pedido (F9)</span>
      </button>
    </div>
  );
}
