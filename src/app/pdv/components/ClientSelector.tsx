'use client';

import React, { useState, useEffect } from 'react';
import { User, Search, CheckCircle2, ChevronRight, X, Plus, UserPlus, Loader2, Phone, MapPin, Save, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClients, createClientQuick, getClientPendingSales } from '@/lib/actions';

interface Client {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
}

interface ClientSelectorProps {
  selectedClient: Client | null;
  onSelect: (client: Client | null) => void;
}

export function ClientSelector({ selectedClient, onSelect }: ClientSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);

  // New client form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      const fetchClients = async () => {
        const results = await getClients();
        setClients(results as Client[]);
      };
      fetchClients();
    }
  }, [showModal]);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createClientQuick({
        name: newName,
        phone: newPhone,
        address: newAddress
      });

      if (res.success && res.client) {
        onSelect(res.client as Client);
        setShowModal(false);
        setNewName('');
        setNewPhone('');
        setNewAddress('');
        setShowAddForm(false);
      } else {
        setError(res.error || 'Erro ao cadastrar cliente');
      }
    } catch (err) {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          "premium-card !p-5 flex items-center justify-between group w-full text-left transition-all",
          "hover:border-primary/40 hover:shadow-xl active:scale-[0.99]"
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            selectedClient 
              ? "bg-primary text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
              : "bg-bg-accent text-zinc-500 group-hover:text-primary group-hover:bg-primary/10"
          )}>
            <User size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Cliente Vinculado</p>
            <p className="text-base font-black text-white">
              {selectedClient?.name || 'Consumidor de Balcão'}
            </p>
          </div>
        </div>
        <div className="p-2 rounded-lg group-hover:bg-zinc-800/50 transition-colors">
          <ChevronRight size={20} className="text-zinc-600 group-hover:text-primary" />
        </div>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-primary/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  {showAddForm ? <UserPlus size={24} /> : <User size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    {showAddForm ? 'Novo Cliente' : 'Selecionar Cliente'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-bold tracking-widest mt-0.5 uppercase opacity-60">
                    {showAddForm ? 'Cadastre um novo cliente rapidamente' : 'Vincule um cliente à venda'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-black transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <Plus size={14} />
                    Novo Cliente
                  </button>
                )}
                <button 
                  onClick={() => { setShowModal(false); setShowAddForm(false); }} 
                  className="p-3 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <Plus size={32} className="rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
              {showAddForm ? (
                <form onSubmit={handleQuickAdd} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {error && (
                    <div className="p-4 bg-danger/10 border border-danger/20 text-danger text-xs font-bold text-center uppercase tracking-wider rounded-xl">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User size={12} className="text-primary" /> Nome Completo
                      </label>
                      <input
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        autoFocus
                        className="w-full bg-bg-surface border border-border p-4 rounded-xl outline-none focus:border-primary/50 transition-all text-sm font-semibold text-white placeholder:text-zinc-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Phone size={12} className="text-primary" /> Telefone
                        </label>
                        <input
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-bg-surface border border-border p-4 rounded-xl outline-none focus:border-primary/50 transition-all text-sm font-semibold text-white placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <MapPin size={12} className="text-primary" /> Localização (Opcional)
                        </label>
                        <input
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="Bairro ou endereço..."
                          className="w-full bg-bg-surface border border-border p-4 rounded-xl outline-none focus:border-primary/50 transition-all text-sm font-semibold text-white placeholder:text-zinc-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-6 py-4 rounded-xl border border-border text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                      Voltar para Lista
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] btn-primary !py-4 shadow-lg shadow-primary/20 group"
                    >
                      {isSubmitting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Save size={18} />
                          Finalizar Cadastro
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className={cn(
                    "w-full pl-14 pr-6 py-5 rounded-2xl bg-bg-surface/50 border border-border",
                    "focus:border-primary focus:bg-bg-surface outline-none transition-all",
                    "text-lg font-bold text-white placeholder:text-zinc-700 shadow-inner"
                  )}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { onSelect(null); setShowModal(false); }}
                  className={cn(
                    "w-full p-6 rounded-2xl border transition-all text-left group flex items-center justify-between",
                    !selectedClient 
                      ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                      : "border-border bg-bg-surface/30 hover:border-primary/40 hover:bg-bg-surface"
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      !selectedClient ? "bg-primary text-white" : "bg-zinc-800 text-zinc-500 group-hover:text-primary"
                    )}>
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-black text-lg text-white group-hover:text-primary transition-colors">Consumidor de Balcão</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Venda rápida sem identificação</p>
                    </div>
                  </div>
                  {!selectedClient && <CheckCircle2 size={24} className="text-primary animate-in zoom-in" />}
                </button>

                <div className="pt-4 pb-2">
                   <p className="px-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Clientes Cadastrados</p>
                </div>

                {filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => { onSelect(client); setShowModal(false); }}
                    className={cn(
                      "w-full p-6 rounded-2xl border transition-all text-left group flex items-center justify-between",
                      selectedClient?.id === client.id 
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                        : "border-border bg-bg-surface/30 hover:border-primary/40 hover:bg-bg-surface"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-black text-sm",
                        selectedClient?.id === client.id ? "bg-primary text-white" : "bg-zinc-800 text-zinc-500 group-hover:text-primary"
                      )}>
                        {client.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-lg text-white group-hover:text-primary transition-colors">{client.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {client.phone && (
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                              {client.phone}
                            </p>
                          )}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const sales = await getClientPendingSales(client.id);
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
                                win.document.write(`<html><head><title>Relatório - ${client.name}</title></head><body style="font-family:sans-serif;padding:40px;"><h1>MUNDO DAS BEBIDAS</h1><h2>RELATÓRIO DE PENDÊNCIAS: ${client.name.toUpperCase()}</h2><div>${allItemsHtml}</div><div style="margin-top:30px;font-size:20px;font-weight:bold;">TOTAL DEVIDO: R$ ${totalAll.toFixed(2)}</div><script>window.onload=()=>window.print();</script></body></html>`);
                                win.document.close();
                              }
                            }}
                            className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-1"
                          >
                            <FileText size={10} />
                            Ver Débitos
                          </button>
                        </div>
                      </div>
                    </div>
                    {selectedClient?.id === client.id && <CheckCircle2 size={24} className="text-primary animate-in zoom-in" />}
                  </button>
                  ))}
                </div>
              </>
            )}
          </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all hover:bg-white/5 rounded-xl"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
