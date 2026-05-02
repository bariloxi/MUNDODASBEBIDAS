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
              "premium-card group text-left h-full transition-all",
              product.stock <= 0 && "opacity-40 cursor-not-allowed grayscale"
            )}
          >
            <div className="flex-1 space-y-2 mb-4">
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{product.brand || 'PREMIUM'}</span>
              <h3 className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="text-lg font-black text-white mt-1">
                R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Disponível</span>
              <div className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase border",
                product.stock <= 5 
                  ? "bg-danger/10 border-danger/30 text-danger shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                  : "bg-primary/10 border-primary/30 text-primary"
              )}>
                {product.stock} un
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
