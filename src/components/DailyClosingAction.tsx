'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calculator, Loader2, Printer, X } from 'lucide-react';
import { getDailySalesDetail } from '@/lib/actions';
import { cn } from '@/lib/utils';
import DailyClosingReport from './DailyClosingReport';

export default function DailyClosingAction({ isYesterday }: { isYesterday?: boolean }) {
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sales, setSales] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [reportDate, setReportDate] = useState<Date>(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const targetDate = new Date();
      if (isYesterday) {
        targetDate.setDate(targetDate.getDate() - 1);
      }
      setReportDate(targetDate);
      const data = await getDailySalesDetail(isYesterday ? targetDate.toISOString() : undefined);
      setSales(data);
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
      alert('Erro ao carregar vendas do dia');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading}
        className={cn(
          "flex items-center gap-3 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm group",
          isYesterday 
            ? "bg-slate-700 text-white border border-slate-600 hover:bg-slate-600 active:scale-95"
            : "bg-emerald-600 text-white border border-emerald-500/20 hover:bg-emerald-500 active:scale-95"
        )}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} className="group-hover:rotate-12 transition-transform" />}
        <span>{isYesterday ? 'Fechar Caixa Ontem' : 'Fechar Caixa Diário'}</span>
      </button>

      {showPreview && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-10 overflow-y-auto print:p-0 print:static print:bg-white">
          <div className="bg-white rounded-none w-full max-w-5xl flex flex-col shadow-2xl print:shadow-none print:max-w-none">
            <div className="p-4 sm:px-8 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-10 print:hidden">
              <div className="flex items-center gap-3">
                <Calculator className="text-emerald-600" size={24} />
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
                  Relatório de Fechamento de Caixa
                </h3>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all shadow-lg"
                >
                  <Printer size={16} />
                  Imprimir Fechamento
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center gap-2 bg-slate-200 text-slate-600 px-6 py-2.5 font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-all"
                >
                  <X size={16} />
                  Fechar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-visible bg-white p-2 print:p-0">
              <DailyClosingReport sales={sales} date={reportDate} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
