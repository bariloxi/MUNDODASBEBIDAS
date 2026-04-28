import React from 'react';
import Link from 'next/link';
import { UserPlus, Phone, MapPin, Users } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import ClientActions from '@/components/ClientActions';
import DebtManager from '@/components/DebtManager';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const ClientsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) => {
  const { q } = await searchParams;

  const clients = await prisma.client.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ],
    } : {},
    orderBy: { name: 'asc' },
    include: {
      sales: {
        where: { status: 'AGUARDANDO_PAGAMENTO' },
        select: { total: true, dueDate: true },
        orderBy: { dueDate: 'asc' }
      },
      _count: {
        select: { sales: true }
      }
    }
  });

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Users size={14} />
            <span>Gestão de Relacionamento</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Base de Clientes</h1>
          <p className="text-slate-400 text-sm">Monitoramento de fidelidade e histórico de interações.</p>
        </div>
        <Link 
          href="/clients/new" 
          className="btn-primary"
        >
          <UserPlus size={18} />
          <span>Novo Cliente</span>
        </Link>
      </header>

      {/* Filter & Table Container */}
      <div className="premium-card !p-0 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border bg-bg-secondary/20">
          <div className="max-w-md">
            <SearchInput 
              placeholder="Buscar por nome ou telefone..."
              className="bg-bg-surface/50 border-border focus:border-primary/40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-surface/30 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                <th className="px-6 py-4">Identificação</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4 text-center">Frequência</th>
                <th className="px-6 py-4 text-center">Pendência</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500 text-sm">Nenhum cliente cadastrado.</td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-bg-surface/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{client.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">ID-{client.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                          <Phone size={12} className="text-slate-600" />
                          {client.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-success font-bold uppercase tracking-wider">
                           <div className="h-1 w-1 rounded-full bg-current" /> Ativo
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 max-w-[200px] truncate">
                        <MapPin size={12} className="shrink-0 text-slate-700" />
                        {client.address || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-border text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {client._count?.sales || 0} Compras
                        </span>
                        {client._count?.sales > 5 && (
                          <span className="text-[8px] font-bold text-primary uppercase tracking-widest">VIP Member</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const pendingSales = client.sales || [];
                        const totalDebt = pendingSales.reduce((acc, sale) => acc + sale.total, 0);
                        const nextDue = pendingSales.length > 0 ? pendingSales[0].dueDate : null;

                        if (totalDebt === 0) {
                          return (
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Em dia</span>
                          );
                        }

                        return (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-bold text-danger">
                              R$ {totalDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            {nextDue && (
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded-sm",
                                new Date(nextDue) < new Date() ? "bg-danger/10 text-danger border border-danger/20" : "bg-warning/10 text-warning border border-warning/20"
                              )}>
                                Vence {new Date(nextDue).toLocaleDateString('pt-BR')}
                              </span>
                            <DebtManager 
                              clientId={client.id} 
                              clientName={client.name} 
                              totalDebt={totalDebt} 
                            />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ClientActions clientId={client.id} clientName={client.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-bg-secondary/10 border-t border-border flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-wider">
           <span>Total de {clients.length} Clientes</span>
           <div className="flex gap-4">
              <button className="hover:text-primary transition-colors">Exportar</button>
              <button className="hover:text-primary transition-colors">Relatórios</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
