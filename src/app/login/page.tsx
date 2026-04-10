'use client';

import React, { useState } from 'react';
import { login } from '@/lib/actions';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
      if (res.success) {
        window.location.href = '/';
      } else {
        setError(res.error || 'Erro ao autenticar');
      }
    } catch (err) {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-20" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] opacity-10" />
      </div>

      <div className="w-full max-w-[440px] relative">
        {/* Card */}
        <div className="premium-card !p-0 overflow-hidden shadow-2xl border-primary/20">
          <div className="p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/40 to-transparent rounded-none blur-lg opacity-40 group-hover:opacity-60 transition-all duration-700" />
                <Image
                  src="/logo-disk.jpg"
                  alt="Mundo das Bebidas"
                  width={140}
                  height={140}
                  className="relative rounded-none border border-white/5 shadow-2xl"
                  priority
                />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Acesso Restrito</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Painel Administrativo v2.0</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-bold text-center uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Operacional</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full bg-bg-surface border border-border p-4 pl-12 rounded-none outline-none focus:border-primary/50 transition-all text-sm font-semibold text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      required
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-bg-surface border border-border p-4 pl-12 rounded-none outline-none focus:border-primary/50 transition-all text-sm font-semibold text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary !py-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20 group"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Autenticar Protocolo
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Line */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Mundo das Bebidas &copy; 2026 • Sistema de Gestão Geográfica
        </p>
      </div>
    </div>
  );
}
