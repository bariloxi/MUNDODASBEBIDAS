'use client';

import React, { useState } from 'react';
import { 
  Banknote, 
  X, 
  CheckCircle2, 
  Calendar, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { getClientPendingSales, updateSaleStatus } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface Sale {
  id: number;
  total: number;
  createdAt: Date;
  dueDate: Date | null;
}

interface DebtManagerProps {
  clientId: number;
  clientName: string;
  totalDebt: number;
}

const DebtManager: React.FC<DebtManagerProps> = ({ clientId, clientName, totalDebt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const handleOpen = async () => {
    setIsOpen(true);
    setIsLoading(true);
    try {
      const data = await getClientPendingSales(clientId);
      setSales(data as any);
    } catch (error) {
      console.error('Erro ao buscar débitos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (saleId: number) => {
    setProcessingId(saleId);
    try {
      await updateSaleStatus(saleId, 'CONCLUIDA');
      setSales(prev => prev.filter(s => s.id !== saleId));
      if (sales.length <= 1) {
         // If last one, we might want to close or just show empty
      }
    } catch (error) {
      alert('Erro ao atualizar status do pagamento.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkAllAsPaid = async () => {
    if (!confirm('Deseja marcar TODOS os débitos deste cliente como pagos?')) return;
    
    setIsLoading(true);
    try {
      for (const sale of sales) {
        await updateSaleStatus(sale.id, 'CONCLUIDA');
      }
      setSales([]);
      setTimeout(() => setIsOpen(false), 1000);
    } catch (error) {
      alert('Erro ao processar pagamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  if (totalDebt === 0) return null;

  return (
    <>
      <button 
        onClick={handleOpen}
        className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-success/10 hover:bg-success/20 text-success border border-success/20 transition-all group"
      >
        <Banknote size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Receber</span>
        <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="premium-card w-full max-w-md shadow-2xl border-primary/20 p-0 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-border bg-bg-secondary/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <Banknote className="text-success" size={20} />
                  Acerto de Contas
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Cliente: <span className="text-slate-300">{clientName}</span>
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-slate-600">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <p className="text-xs font-bold uppercase tracking-widest">Carregando pendências...</p>
                </div>
              ) : sales.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-success/40">
                  <CheckCircle2 size={48} />
                  <p className="text-xs font-bold uppercase tracking-widest text-white">Tudo Pago!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Vendas Pendentes ({sales.length})</p>
                    <button 
                      onClick={handleMarkAllAsPaid}
                      className="text-[9px] font-bold text-primary hover:underline uppercase"
                    >
                      Quitar Tudo
                    </button>
                  </div>
                  {sales.map(sale => (
                    <div key={sale.id} className="p-4 bg-bg-surface/40 border border-border flex items-center justify-between group hover:border-success/30 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">R$ {sale.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className="text-[9px] text-slate-500 font-medium">#{sale.id.toString().padStart(4, '0')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500 uppercase">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(sale.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          {sale.dueDate && (
                            <span className={cn(
                              "flex items-center gap-1",
                              new Date(sale.dueDate) < new Date() ? "text-danger" : "text-warning"
                            )}>
                              <Calendar size={10} />
                              Vence {new Date(sale.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleMarkAsPaid(sale.id)}
                        disabled={processingId === sale.id}
                        className="p-2.5 bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white transition-all disabled:opacity-50"
                        title="Marcar como pago"
                      >
                        {processingId === sale.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Total Footer */}
            {!isLoading && sales.length > 0 && (
              <div className="p-6 bg-bg-secondary/40 border-t border-border flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Devido</p>
                  <p className="text-2xl font-black text-white tracking-tighter">
                    R$ {sales.reduce((acc, s) => acc + s.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 bg-bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DebtManager;
