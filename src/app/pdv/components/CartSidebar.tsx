'use client';

import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { CartItem } from '@/hooks/useCart';
import InvoiceAction from '@/components/InvoiceAction';
import CancelSaleAction from '@/components/CancelSaleAction';

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  isSuccess: boolean;
  lastSaleId: number | null;
}

export function CartSidebar({ 
  items, 
  onUpdateQuantity, 
  onRemove, 
  isSuccess, 
  lastSaleId 
}: CartSidebarProps) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="glass flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-primary/20 flex items-center justify-between bg-bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <ShoppingCart size={20} />
          </div>
          <h2 className="font-black text-base text-white tracking-tight uppercase">Carrinho</h2>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-bg-accent border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest">
          {totalItems} {totalItems === 1 ? 'Item' : 'Itens'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isSuccess ? (
          <div className="h-full flex flex-col items-center justify-center text-success gap-6 animate-in zoom-in-95 duration-500">
            <div className="p-6 rounded-full bg-success/10 border-2 border-success/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <CheckCircle2 size={64} className="animate-bounce" />
            </div>
            <div className="text-center space-y-4">
              <div className="space-y-1">
                <p className="font-black text-xl text-white uppercase tracking-tight">Venda Sucesso!</p>
                <p className="text-[10px] font-bold text-success uppercase tracking-[0.2em] opacity-80">Estoque atualizado com sucesso</p>
              </div>
              {lastSaleId && (
                <div className="pt-4 border-t border-border/50 flex flex-col gap-2">
                  <InvoiceAction saleId={lastSaleId} />
                  <CancelSaleAction saleId={lastSaleId} status="CONCLUIDA" showText={true} />
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Deseja ver a conta completa?</p>
                  <button
                    onClick={async () => {
                      // We need the clientId here, but we don't have it easily in CartSidebar
                      // unless we pass it or fetch it from the lastSaleId.
                      // For now, I'll assume they can see it in the invoice.
                    }}
                    className="hidden"
                  >
                    Ver Relatório
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-6 opacity-40">
            <div className="p-6 rounded-full border-2 border-dashed border-slate-700">
              <ShoppingCart size={48} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-center">O carrinho está aguardando<br/>seu primeiro item</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="group relative p-4 rounded-xl bg-bg-surface/40 border border-border hover:border-primary/30 transition-all shadow-sm">
              <div className="flex gap-4 items-center">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-100 truncate group-hover:text-primary transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{item.brand || 'S/M'}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-bg-secondary/50 rounded-lg p-1 border border-border group-hover:border-primary/20 transition-colors">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)} 
                    className="p-1.5 text-slate-500 hover:text-white transition-colors disabled:opacity-20"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-black min-w-[24px] text-center text-white">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, 1)} 
                    className="p-1.5 text-slate-500 hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border/30 flex justify-between items-center">
                <span className="text-sm font-black text-primary">R$ {(item.sellPrice * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <button 
                  onClick={() => onRemove(item.id)} 
                  className="p-2 text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
