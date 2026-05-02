'use client';

import React, { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { getClientPendingSales } from '@/lib/actions';

interface DebtReportButtonProps {
  clientId: number;
  clientName: string;
}

export default function DebtReportButton({ clientId, clientName }: DebtReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const sales = await getClientPendingSales(clientId);
      if (!sales || sales.length === 0) {
        alert('Nenhuma venda pendente para este cliente.');
        return;
      }

      const win = window.open('', '_blank');
      if (win) {
        let allItemsHtml = '';
        sales.forEach((sale: any) => {
          allItemsHtml += `<div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">Venda #${sale.id.toString().padStart(4, '0')} - ${new Date(sale.createdAt).toLocaleDateString('pt-BR')}</div>
            ${sale.items.map((item: any) => `
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                <div style="flex: 1;">${item.quantity}x ${item.product.name} ${item.product.volume || ''}</div>
                <div style="text-align: right;">R$ ${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
            <div style="text-align: right; font-weight: bold; margin-top: 5px;">Subtotal: R$ ${sale.total.toFixed(2)}</div>
          </div>`;
        });

        const totalAll = sales.reduce((acc: number, s: any) => acc + s.total, 0);

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
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGenerateReport}
      disabled={loading}
      className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all group disabled:opacity-50"
      title="Gerar Relatório de Itens"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
      <span className="text-[10px] font-bold uppercase tracking-wider">Relatório</span>
    </button>
  );
}
