
import React from 'react';
import { prisma } from '@/lib/prisma';
import { Database, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

async function checkDatabase() {
  const start = Date.now();
  try {
    // Try a very simple query
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    return { 
      status: 'online', 
      duration, 
      error: null,
      env: process.env.DATABASE_URL ? 'DEFINIDA (Oculta)' : 'NÃO DEFINIDA'
    };
  } catch (err) {
    return { 
      status: 'offline', 
      duration: Date.now() - start, 
      error: err instanceof Error ? err.message : 'Erro desconhecido',
      env: process.env.DATABASE_URL ? 'DEFINIDA (Oculta)' : 'NÃO DEFINIDA'
    };
  }
}

export default async function DebugDBPage() {
  const result = await checkDatabase();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-primary" size={32} />
          Diagnóstico de Conexão
        </h1>
        <p className="text-slate-500">Verificação técnica da infraestrutura do banco de dados.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`premium-card border-2 ${result.status === 'online' ? 'border-success/30' : 'border-danger/30'}`}>
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Status do Banco</h2>
            {result.status === 'online' ? (
              <div className="p-2 bg-success/10 text-success rounded-full"><CheckCircle size={24} /></div>
            ) : (
              <div className="p-2 bg-danger/10 text-danger rounded-full"><ShieldAlert size={24} /></div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado Atual</p>
              <p className={`text-2xl font-black ${result.status === 'online' ? 'text-success' : 'text-danger'}`}>
                {result.status === 'online' ? 'SISTEMA ONLINE' : 'BANCO DESCONECTADO'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latência</p>
              <p className="text-xl font-bold text-white">{result.duration}ms</p>
            </div>
          </div>
        </div>

        <div className="premium-card space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Configuração</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DATABASE_URL</p>
              <p className="text-sm font-bold text-slate-200">{result.env}</p>
            </div>
            
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Dica de Suporte</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se o status for &apos;OFFLINE&apos;, verifique se o projeto Neon não está suspenso ou se a senha foi alterada recentemente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {result.error && (
        <div className="premium-card border-danger/20 bg-danger/5">
          <h2 className="text-sm font-bold text-danger uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={16} />
            Detalhes Técnicos do Erro
          </h2>
          <div className="bg-black/40 p-6 rounded-xl border border-white/5 overflow-x-auto">
            <code className="text-xs text-danger/80 break-all whitespace-pre-wrap">
              {result.error}
            </code>
          </div>
          <p className="mt-4 text-[10px] text-slate-600 font-medium">
            Este erro geralmente ocorre por problemas de autenticação ou endpoint inexistente.
          </p>
        </div>
      )}
    </div>
  );
}
