'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, Loader2, Printer } from 'lucide-react';
import { generateInvoice, getInvoice } from '@/lib/actions';
import { cn } from '@/lib/utils';
import InvoiceTemplate from './InvoiceTemplate';

import { InvoiceWithSale } from '@/lib/types';
import { Invoice } from '@prisma/client';

interface InvoiceActionProps {
  saleId: number;
  initialInvoice?: InvoiceWithSale | Invoice | null;
  showButton?: boolean;
}

export default function InvoiceAction({ saleId, initialInvoice, showButton = true }: InvoiceActionProps) {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceWithSale | Invoice | null>(initialInvoice ?? null);
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showPreview) {
      document.body.classList.add('printing-invoice');
    } else {
      document.body.classList.remove('printing-invoice');
    }
    return () => document.body.classList.remove('printing-invoice');
  }, [showPreview]);

  const handlePreview = async () => {
    console.log('Opening preview for sale:', saleId);
    if (!invoice || !(invoice as InvoiceWithSale).sale) {
      setLoading(true);
      const fullInvoice = await getInvoice(saleId);
      console.log('Fetched invoice for preview:', fullInvoice);
      setInvoice(fullInvoice);
      setLoading(false);
    }
    setShowPreview(true);
  };

  const handleGenerate = async () => {
    console.log('Generating invoice for sale:', saleId);
    setLoading(true);
    const res = await generateInvoice(saleId);
    console.log('Generate invoice result:', res);
    if (res.success && res.invoice) {
      setInvoice(res.invoice);
      setShowPreview(true);
    } else {
      alert('Erro ao gerar nota fiscal');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {showButton && (
        <button
          id="btn-invoice-action"
          onClick={invoice && (invoice as InvoiceWithSale).sale ? () => setShowPreview(true) : (invoice ? handlePreview : handleGenerate)}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-none font-bold text-[10px] uppercase tracking-wider transition-all",
            invoice
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "bg-primary/20 text-primary hover:bg-primary/30"
          )}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
          {invoice ? 'Ver Nota Fiscal' : 'Gerar Nota Fiscal'}
        </button>
      )}

      {showPreview && invoice && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/90 backdrop-blur-md p-4 pt-10 sm:pt-20 overflow-y-auto print:p-0 print:static print:bg-white invoice-print-container">
          <div className="bg-bg-surface border border-border rounded-none w-full max-w-2xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] print:border-none print:shadow-none print:max-w-none print:rounded-none print:static">
            <div className="p-4 sm:px-6 border-b border-border flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-bg-secondary/80 backdrop-blur sticky top-0 z-10 print:hidden">
              <h3 className="font-bold text-white uppercase tracking-widest text-xs flex items-center gap-2">
                <FileText size={14} className="text-primary" />
                Visualização da Nota Fiscal
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="btn-primary py-2.5 px-6 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:scale-105 transition-all"
                >
                  <Printer size={16} />
                  Imprimir Nota
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2.5 rounded-none bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all text-xs font-bold uppercase"
                >
                  Fechar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-100 p-8 custom-scrollbar print:p-0 print:overflow-visible">
              <InvoiceTemplate data={invoice as InvoiceWithSale} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
