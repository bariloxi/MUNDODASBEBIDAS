import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Plus, 
  Package, 
  AlertTriangle,
  ChevronRight,
  Archive,
  Layers,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ProductActions from '@/components/ProductActions';
import SearchInput from '@/components/SearchInput';
import { cn } from '@/lib/utils';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q ? {
      OR: [
        { name: { contains: q } },
        { brand: { contains: q } },
        { barcode: { contains: q } },
      ],
    } : {},
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Aurora Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Archive size={14} />
            <span>Catálogo de Produtos</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Gestão de Estoque</h1>
          <p className="text-slate-400 text-sm">Gerencie seus produtos, preços e níveis de estoque em tempo real.</p>
        </div>
        <Link href="/products/new" className="btn-primary py-3 px-6 shadow-lg shadow-primary/20">
          <Plus size={18} />
          <span>Novo Produto</span>
        </Link>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-bg-surface/50 p-4 rounded-xl border border-border">
        <div className="flex-1 w-full relative">
          <SearchInput 
            placeholder="Buscar por nome, marca ou código..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 px-4 placeholder:text-slate-500"
          />
        </div>
        <div className="h-6 w-px bg-border hidden md:block" />
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-accent/50 text-slate-300 hover:text-white border border-border transition-all text-xs font-semibold">
          <Filter size={14} />
          Filtros Avançados
        </button>
      </div>

      {/* Main Table Container */}
      <div className="premium-card !p-0 overflow-hidden">
        <div className="table-container">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th className="text-right">Custo</th>
                <th className="text-right">Venda</th>
                <th className="text-center">Estoque</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Package size={40} className="text-slate-500" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Nenhum produto encontrado</p>
                        <p className="text-xs text-slate-500">Tente buscar por outro termo ou cadastre um novo item.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="group transition-colors">
                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100 group-hover:text-primary transition-colors">{product.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{product.brand || 'Marca standard'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-border text-[10px] font-semibold text-slate-400">
                        <Layers size={11} className="text-primary/70" />
                        {product.category?.name || 'Geral'}
                      </span>
                    </td>
                    <td className="text-right font-medium text-slate-400">
                      R$ {product.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right">
                      <span className="font-bold text-slate-50">R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                          "font-bold text-sm",
                          product.stock <= (product.minStock || 5) ? 'text-danger' : 'text-slate-200'
                        )}>
                          {product.stock} <span className="text-[10px] font-normal text-slate-500 ml-0.5">un</span>
                        </span>
                        {product.stock <= (product.minStock || 5) && (
                          <span className="text-[9px] font-bold text-danger uppercase tracking-tighter">Crítico</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right">
                      <ProductActions productId={product.id} productName={product.name} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-6 py-4 bg-bg-secondary/30 flex justify-between items-center">
           <div className="flex items-center gap-3">
             <BarChart3 size={14} className="text-slate-500" />
             <span className="text-xs text-slate-500 font-medium">Total de {products.length} itens catalogados</span>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 mr-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Estável</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Baixo</span>
                </div>
              </div>
              <button className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors">
                Exportar <ExternalLink size={12} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
