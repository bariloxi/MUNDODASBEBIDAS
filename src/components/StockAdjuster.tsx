'use client';

import React, { useState } from 'react';
import { Minus, Plus, Save, Loader2 } from 'lucide-react';
import { updateStock } from '@/lib/actions';

interface StockAdjusterProps {
  productId: number;
  initialStock: number;
}

const StockAdjuster: React.FC<StockAdjusterProps> = ({ productId, initialStock }) => {
  const [stock, setStock] = useState(initialStock);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const result = await updateStock(productId, stock);
      if (result.success) {
        // Notification could go here
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Erro ao atualizar estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-bg-surface border border-border rounded-none overflow-hidden h-9">
        <button 
          onClick={() => setStock(Math.max(0, stock - 1))}
          className="px-2.5 h-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
        >
          <Minus size={14} />
        </button>
        <input 
          type="number" 
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          className="w-10 text-center bg-transparent border-none outline-none text-xs font-bold text-white px-0"
        />
        <button 
          onClick={() => setStock(stock + 1)}
          className="px-2.5 h-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
      <button 
        onClick={handleUpdate}
        disabled={isLoading || stock === initialStock}
        className="p-2 rounded-none bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-20 disabled:grayscale"
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
      </button>
    </div>
  );
};

export default StockAdjuster;
