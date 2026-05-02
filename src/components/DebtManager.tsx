'use client';

import React, { useState } from 'react';
import { 
  Banknote, 
  X, 
  CheckCircle2, 
  Calendar, 
  Loader2,
  ChevronRight,
  ChevronDown,
  Printer,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { getClientPendingSales, updateSaleStatus } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface Sale {
  id: number;
  total: number;
  createdAt: Date;
  dueDate: Date | null;
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      volume?: string | null;
    };
  }[];
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
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);

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
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Vendas Pendentes ({sales.length})</p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          const win = window.open('', '_blank');
                          if (win) {
                            let allItemsHtml = '';
                            sales.forEach(sale => {
                              allItemsHtml += `<div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                                <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">Venda #${sale.id.toString().padStart(4, '0')} - ${new Date(sale.createdAt).toLocaleDateString('pt-BR')}</div>
                                ${sale.items.map(item => `
                                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                                    <div style="flex: 1;">${item.quantity}x ${item.product.name} ${item.product.volume || ''}</div>
                                    <div style="text-align: right;">R$ ${(item.price * item.quantity).toFixed(2)}</div>
                                  </div>
                                `).join('')}
                                <div style="text-align: right; font-weight: bold; margin-top: 5px;">Subtotal: R$ ${sale.total.toFixed(2)}</div>
                              </div>`;
                            });

                            const totalAll = sales.reduce((acc, s) => acc + s.total, 0);

                            win.document.write(`
                              <html>
                                <head>
                                  <title>Relatório de Débitos - ${clientName}</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; color: black; background: white; max-width: 800px; margin: auto; }
                                    .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
                                    .footer { border-top: 1px solid black; padding-top: 20px; margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                                    .total-box { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; margin-top: 30px; }
                                    .total-row { font-weight: bold; font-size: 20px; display: flex; justify-content: space-between; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h1 style="margin: 0; font-size: 24px;">MUNDO DAS BEBIDAS</h1>
                                    <p style="margin: 5px 0;">RELATÓRIO DE PENDÊNCIAS DE CLIENTE</p>
                                    <h2 style="margin: 15px 0 5px 0;">${clientName.toUpperCase()}</h2>
                                    <p style="font-size: 12px;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                                  </div>
                                  
                                  <div>${allItemsHtml}</div>
                                  
                                  <div class="total-box">
                                    <div class="total-row">
                                      <span>TOTAL DEVIDO:</span>
                                      <span>R$ ${totalAll.toFixed(2)}</span>
                                    </div>
                                  </div>
                                  
                                  <div class="footer">
                                    <p>Este documento serve como conferência de itens pendentes de pagamento.</p>
                                    <p>Mundo das Bebidas - Qualidade e Confiança</p>
                                  </div>
                                  <script>window.onload = () => { window.print(); }</script>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          }
                        }}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-primary hover:text-white transition-colors uppercase border border-primary/20 px-2 py-1 bg-primary/5"
                      >
                        <FileText size={12} />
                        Gerar PDF/Relatório
                      </button>
                      <button 
                        onClick={handleMarkAllAsPaid}
                        className="text-[9px] font-bold text-success hover:underline uppercase"
                      >
                        Quitar Tudo
                      </button>
                    </div>
                  </div>
                  {sales.map(sale => (
                    <div key={sale.id} className="space-y-1">
                      <div className={cn(
                        "p-4 bg-bg-surface/40 border transition-all",
                        expandedSaleId === sale.id ? "border-primary/40 bg-primary/5" : "border-border hover:border-success/30"
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => setExpandedSaleId(expandedSaleId === sale.id ? null : sale.id)}>
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                              expandedSaleId === sale.id ? "bg-primary/20 text-primary" : "bg-zinc-800 text-zinc-500"
                            )}>
                              {expandedSaleId === sale.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
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
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                const win = window.open('', '_blank');
                                if (win) {
                                  const itemsHtml = sale.items.map(item => `
                                    <div style="display: flex; justify-between; font-size: 12px; margin-bottom: 4px;">
                                      <div style="flex: 1;">${item.quantity}x ${item.product.name} ${item.product.volume || ''}</div>
                                      <div style="text-align: right;">R$ ${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                  `).join('');
                                  
                                  win.document.write(`
                                    <html>
                                      <head>
                                        <title>Recibo - Venda #${sale.id}</title>
                                        <style>
                                          body { font-family: monospace; padding: 20px; color: black; background: white; width: 300px; }
                                          .header { text-align: center; border-bottom: 1px dashed black; padding-bottom: 10px; margin-bottom: 10px; }
                                          .footer { border-top: 1px dashed black; padding-top: 10px; margin-top: 10px; text-align: center; font-size: 10px; }
                                          .total { font-weight: bold; font-size: 14px; margin-top: 10px; display: flex; justify-content: space-between; }
                                        </style>
                                      </head>
                                      <body>
                                        <div class="header">
                                          <h3>MUNDO DAS BEBIDAS</h3>
                                          <p>RECIBO DE VENDA A PRAZO</p>
                                          <p>Data: ${new Date(sale.createdAt).toLocaleString('pt-BR')}</p>
                                          <p>Cliente: ${clientName}</p>
                                        </div>
                                        <div>${itemsHtml}</div>
                                        <div class="total">
                                          <span>TOTAL:</span>
                                          <span>R$ ${sale.total.toFixed(2)}</span>
                                        </div>
                                        <div class="footer">
                                          <p>*** COMPROVANTE DE DÉBITO ***</p>
                                          <p>Obrigado pela preferência!</p>
                                        </div>
                                        <script>window.onload = () => { window.print(); window.close(); }</script>
                                      </body>
                                    </html>
                                  `);
                                  win.document.close();
                                }
                              }}
                              className="p-2.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-black transition-all"
                              title="Imprimir Recibo"
                            >
                              <Printer size={16} />
                            </button>
                            <button 
                              onClick={() => handleMarkAsPaid(sale.id)}
                              disabled={processingId === sale.id}
                              className="p-2.5 bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white transition-all disabled:opacity-50"
                              title="Marcar como pago"
                            >
                              {processingId === sale.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable items section */}
                        {expandedSaleId === sale.id && (
                          <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-primary uppercase tracking-widest">
                              <ShoppingBag size={12} />
                              Itens da Venda
                            </div>
                            <div className="space-y-2">
                              {sale.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-400">
                                      {item.quantity}x
                                    </span>
                                    <span className="text-slate-300 font-medium">{item.product.name}</span>
                                  </div>
                                  <span className="font-bold text-white">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
