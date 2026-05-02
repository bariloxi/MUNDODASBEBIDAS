import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, User, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/lib/actions';

const NewClientPage = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center gap-4">
        <Link href="/clients" className="p-2 hover:bg-bg-accent rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Novo Cliente</h1>
          <p className="text-text-secondary">Cadastre um novo cliente para vendas e delivery.</p>
        </div>
      </header>

      <form action={createClient} className="premium-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
              <User size={16} className="text-primary" />
              Nome Completo
            </label>
            <input 
              name="name"
              type="text" 
              required
              placeholder="Ex: João da Silva"
              className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              Telefone / WhatsApp
            </label>
            <input 
              name="phone"
              type="text" 
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-text-secondary flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            Endereço Completo
          </label>
          <textarea 
            name="address"
            placeholder="Rua, Número, Bairro, Cidade..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors resize-none"
          ></textarea>
        </div>

        <div className="pt-4 flex justify-end gap-4">
          <Link href="/clients" className="px-6 py-2 rounded-lg border border-border hover:bg-bg-accent transition-colors font-bold">
            Cancelar
          </Link>
          <button 
            type="submit"
            className="bg-primary text-black px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
          >
            <Save size={20} />
            Salvar Cliente
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewClientPage;
