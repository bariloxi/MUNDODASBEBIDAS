'use client';

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchProducts } from '@/lib/actions';
import { useDebounce } from '@/hooks/useDebounce';
import { Product } from '@/hooks/useCart';

interface ProductGridProps {
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchProducts = async () => {
      const results = await searchProducts(debouncedSearch);
      setProducts(results as Product[]);
    };
    fetchProducts();
  }, [debouncedSearch]);

  // Listen for F1 to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        document.getElementById('product-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Terminal de Vendas</h1>
        <div className="h-1 w-20 bg-primary rounded-full mt-1" />
        <p className="text-slate-500 text-xs mt-1 font-medium italic opacity-80">
          Selecione os produtos para compor o pedido rapidamente.
        </p>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
        </div>
        <input
          id="product-search"
          type="text"
          placeholder="Buscar por nome, marca ou categoria (F1)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full pl-12 pr-6 py-4 rounded-xl bg-bg-surface/50 border border-border",
            "focus:border-primary focus:bg-bg-surface outline-none transition-all",
            "text-base font-medium shadow-sm placeholder:text-slate-600"
          )}
        />
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 content-start pr-2 custom-scrollbar">
        {products.map(product => (
          <button
            key={product.id}
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product)}
            className={cn(
              "premium-card group text-left transition-all relative min-h-[160px]",
              product.stock <= 0 && "opacity-40 cursor-not-allowed grayscale"
            )}
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-2">
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                  {product.brand || 'PREMIUM'}
                </span>
                <h3 className="font-extrabold text-base text-white mt-1 leading-tight group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </div>
              
              <div className="mt-auto pt-4 flex flex-col gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-slate-500">R$</span>
                  <span className="text-2xl font-black text-white tracking-tighter">
                    {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Estoque</span>
                  <div className={cn(
                    "px-2 py-0.5 rounded flex items-center gap-1.5 border",
                    product.stock <= 5 
                      ? "bg-danger/10 border-danger/20 text-danger" 
                      : "bg-success/10 border-success/20 text-success"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full", product.stock <= 5 ? "bg-danger animate-pulse" : "bg-success")} />
                    <span className="text-[10px] font-black">{product.stock} UN</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
        {products.length === 0 && searchTerm && (
          <div className="col-span-full py-20 text-center opacity-40">
            <p className="text-lg font-bold">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
