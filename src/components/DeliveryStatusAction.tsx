'use client';

import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { updateSaleStatus } from '@/lib/actions';

interface DeliveryStatusActionProps {
  saleId: number;
}

const DeliveryStatusAction: React.FC<DeliveryStatusActionProps> = ({ saleId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await updateSaleStatus(saleId, 'CONCLUIDA');
    } catch (error) {
      console.error('Erro ao concluir entrega:', error);
      alert('Erro ao concluir entrega.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={isLoading}
      className="flex-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2.5 rounded-none text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-20"
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : (
        <>
          <CheckCircle2 size={14} /> Concluir Entrega
        </>
      )}
    </button>
  );
};

export default DeliveryStatusAction;
