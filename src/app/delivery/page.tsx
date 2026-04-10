import React from 'react';
import Link from 'next/link';
import { Truck, Search, Plus, Filter, MessageSquare, Clock, MapPin, Package, ChevronRight, Navigation } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import DeliveryStatusAction from '@/components/DeliveryStatusAction';
import { cn } from '@/lib/utils';

async function getDeliveries() {
  return await prisma.sale.findMany({
    where: {
      status: {
        in: ['PENDENTE', 'EM_PREPARO', 'SAIU_PARA_ENTREGA']
      }
    },
    include: {
      client: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

const DeliveryPage = async () => {
  const deliveries = await getDeliveries();

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Navigation size={14} />
            <span>Logística de Última Milha</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Central de Entregas</h1>
          <p className="text-slate-400 text-sm">Monitoramento de frotas e fluxos de distribuição em tempo real.</p>
        </div>
        <Link 
          href="/pdv" 
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Nova Entrega</span>
        </Link>
      </header>

      {/* Logistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliveries.length === 0 ? (
          <div className="col-span-full premium-card py-24 text-center border-dashed border-border flex flex-col items-center gap-4">
            <div className="p-6 rounded-full bg-slate-800/50 text-slate-500">
              <Truck size={40} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Frota Estacionada</p>
              <p className="text-xs text-slate-500">Nenhum pedido em rota de entrega no momento.</p>
            </div>
          </div>
        ) : (
          deliveries.map((delivery) => (
            <div key={delivery.id} className="premium-card flex flex-col gap-6 group hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-white group-hover:text-primary transition-colors tracking-tight">Rastreio #{delivery.id.toString().padStart(4, '0')}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                    <Clock size={12} className="text-slate-600" /> 
                    {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(delivery.createdAt)}
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase border",
                  delivery.status === 'PENDENTE' ? 'bg-orange-500/5 text-orange-400 border-orange-500/20' :
                  delivery.status === 'SAIU_PARA_ENTREGA' ? 'bg-success/5 text-success border-success/20 animate-pulse' :
                  'bg-primary/5 text-primary border-primary/20'
                )}>
                  {delivery.status.replace('_', ' ')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-surface/30 border border-border">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0"><MapPin size={16} /></div>
                  <div className="space-y-0.5">
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Destinatário</p>
                     <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                       {delivery.client?.name || 'Venda de Balcão'}
                     </p>
                  </div>
                </div>
                
                <div className="p-3 rounded-xl bg-bg-surface/20 border border-border">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Manifesto</p>
                  <div className="max-h-[80px] overflow-y-auto custom-scrollbar space-y-1 pr-1">
                    {delivery.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-[10px] font-medium">
                        <span className="text-slate-400">{item.quantity}x {item.product.name}</span>
                        <span className="text-slate-200">R$ {(item.quantity * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-auto flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Pedido</span>
                    <p className="font-bold text-xl text-white">R$ {delivery.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-bg-surface border border-border">
                    <Package size={18} className="text-slate-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <DeliveryStatusAction saleId={delivery.id} />
                  <a 
                    href={`https://wa.me/55${delivery.client?.phone || '11999999999'}?text=Olá! Somos do Mundo das Bebidas. Confirmamos que seu pedido #${delivery.id.toString().padStart(4, '0')} está em processamento.`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 bg-bg-surface text-slate-300 border border-border py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-success hover:text-white hover:border-success transition-all"
                  >
                    <MessageSquare size={14} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
