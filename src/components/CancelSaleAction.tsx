'use client';

import React, { useState } from 'react';
import { XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { cancelSale } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface CancelSaleActionProps {
  saleId: number;
  status: string;
  className?: string;
  showText?: boolean;
}

export default function CancelSaleAction({ 
  saleId, 
  status = 'CONCLUIDA', 
  className,
  showText = true 
}: CancelSaleActionProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (status === 'CANCELADA') {
    return (
      <div className={cn("flex items-center gap-2 text-[10px] font-bold text-danger uppercase opacity-60", className)}>
        <XCircle size={14} />
        {showText && <span>Cancelada</span>}
      </div>
    );
  }

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await cancelSale(saleId);
      if (res.success) {
        setShowConfirm(false);
      } else {
        alert(res.error || 'Erro ao cancelar venda');
      }
    } catch (error) {
      console.error('Error in handleCancel:', error);
      alert('Erro inesperado ao cancelar venda');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className={cn("flex items-center gap-2 p-1 bg-danger/10 border border-danger/30 rounded-none animate-in fade-in zoom-in-95 duration-200", className)}>
        <div className="hidden sm:flex items-center gap-1.5 px-2 text-[9px] font-black text-danger uppercase tracking-tighter">
          <AlertTriangle size={12} />
          Confirma?
        </div>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="px-3 py-1.5 bg-danger text-white text-[10px] font-black uppercase tracking-widest hover:bg-danger-hover transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : 'Sim'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-none bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/30 transition-all font-bold text-[10px] uppercase tracking-wider",
        className
      )}
    >
      <XCircle size={14} />
      {showText && 'Cancelar Venda'}
    </button>
  );
}
