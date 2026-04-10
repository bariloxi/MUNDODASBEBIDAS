import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { getClient, updateClient } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientId = parseInt(id);
  const client = await getClient(clientId);

  if (!client) {
    redirect('/clients');
  }

  const updateClientWithId = updateClient.bind(null, clientId);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center gap-4">
        <Link href="/clients" className="p-2.5 bg-bg-surface border border-border hover:border-primary/50 rounded-full text-text-secondary hover:text-primary transition-all shadow-sm">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Editar Cliente</h1>
          <p className="text-text-secondary font-medium">Atualize os dados de contato e endereço.</p>
        </div>
      </header>

      <div className="premium-card !p-8 shadow-2xl bg-bg-surface/50 backdrop-blur-sm">
        <form action={updateClientWithId} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Nome Completo</label>
            <input 
              required 
              name="name"
              type="text" 
              defaultValue={client.name}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Telefone (WhatsApp)</label>
            <input 
              name="phone"
              type="text" 
              defaultValue={client.phone || ''}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Endereço de Entrega</label>
            <textarea 
              name="address"
              rows={3}
              defaultValue={client.address || ''}
              className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white resize-none shadow-inner"
            ></textarea>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-4">
            <Link href="/clients" className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-colors">
              Cancelar
            </Link>
            <button type="submit" className="btn-primary shadow-lg px-8">
              <Save size={18} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
