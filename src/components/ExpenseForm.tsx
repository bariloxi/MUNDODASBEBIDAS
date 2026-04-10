'use client';

import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, Tag, FileText, Loader2, X } from 'lucide-react';
import { createExpense } from '@/lib/actions';

const ExpenseForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createExpense(formData);
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      alert('Erro ao processar lançamento financeiro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 rounded-none border border-dashed border-slate-700 text-slate-500 text-xs font-bold hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus size={16} className="group-hover:rotate-90 transition-transform" /> 
        <span>Novo Lançamento</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="premium-card w-full max-w-md !p-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg-secondary/20">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold text-white tracking-tight">Novo Lançamento</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Controle de Fluxo de Caixa</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-bg-surface rounded-none transition-colors text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Descrição do Ativo/Gasto</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-primary transition-colors">
                    <FileText size={16} />
                  </div>
                  <input 
                    required 
                    name="description"
                    type="text" 
                    placeholder="Ex: Reposição de Estoque Ambev"
                    className="w-full pl-12 pr-4 py-3 rounded-none bg-bg-surface border border-border focus:border-primary/50 outline-none transition-all text-sm font-semibold text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Valor (R$)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-success transition-colors">
                      <DollarSign size={16} />
                    </div>
                    <input 
                      required 
                      name="amount"
                      type="number" 
                      step="0.01"
                      placeholder="0,00"
                      className="w-full pl-12 pr-4 py-3 rounded-none bg-bg-surface border border-border focus:border-success/50 outline-none transition-all text-sm font-bold text-success"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Categoria</label>
                  <div className="relative">
                    <select 
                      required 
                      name="category"
                      className="w-full px-4 py-3 rounded-none bg-bg-surface border border-border focus:border-primary/50 outline-none transition-all text-sm font-semibold text-white appearance-none cursor-pointer"
                    >
                      <option value="OUTROS">OUTROS</option>
                      <option value="FORNECEDOR">FORNECEDOR</option>
                      <option value="ALUGUEL">ALUGUEL</option>
                      <option value="LUZ">LUZ</option>
                      <option value="AGUA">AGUA</option>
                      <option value="EQUIPAMENTOS">EQUIPAMENTOS</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-600">
                      <Tag size={14} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Data de Competência</label>
                <div className="relative">
                  <input 
                    name="date"
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-none bg-bg-surface border border-border focus:border-primary/50 outline-none transition-all text-sm font-semibold text-white appearance-none"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-600">
                    <Calendar size={14} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 rounded-none bg-bg-surface text-slate-400 text-xs font-bold uppercase hover:text-white transition-all border border-border"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : (
                    <>
                      Confirmar <Plus size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpenseForm;
