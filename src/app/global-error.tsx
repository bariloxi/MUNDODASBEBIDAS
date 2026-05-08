'use client';

import React, { useEffect } from 'react';
import { Database, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('CRITICAL_SYSTEM_ERROR:', error);
    
    // Auto-retry after 5 seconds if it looks like a DB error
    if (error.message.includes('Prisma') || error.message.includes('database')) {
      const timer = setTimeout(() => {
        reset();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, reset]);

  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-slate-800 rounded-2xl p-4 flex items-center justify-center border border-slate-700">
              <Database className="w-10 h-10 text-blue-400" />
            </div>
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border-2 border-slate-900">
              <AlertTriangle className="w-3 h-3 text-black" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-3 tracking-tight">
            Sistema em Recuperação
          </h1>
          
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Detectamos uma instabilidade momentânea na conexão com o banco de dados. 
            Nossa inteligência está tentando restabelecer o sinal automaticamente.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => reset()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <RefreshCcw className="w-5 h-5 animate-spin-reverse" />
              Tentar Agora
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              Tentando reconectar em 5s...
            </div>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 pt-6 border-t border-slate-800 text-left">
              <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Detalhes Técnicos</p>
              <pre className="text-[10px] text-slate-500 bg-black/30 p-3 rounded-lg overflow-auto max-h-32">
                {error.message}
              </pre>
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
