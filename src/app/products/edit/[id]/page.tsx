import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getCategories, getProduct, updateProduct } from '@/lib/actions';
import { redirect } from 'next/navigation';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = parseInt(id);
  const product = await getProduct(productId);
  const categories = await getCategories();

  if (!product) {
    redirect('/products');
  }

  const updateProductWithId = updateProduct.bind(null, productId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="p-2.5 bg-bg-surface border border-border hover:border-primary/50 rounded-full text-text-secondary hover:text-primary transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Catálogo Geral</span>
               <span className="text-[10px] text-text-muted">•</span>
               <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">ID #{product.id}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Editar Produto</h1>
            <p className="text-text-secondary font-medium">Atualize as informações técnicas e comerciais do item.</p>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="premium-card !p-8 shadow-2xl border-white/5 bg-bg-surface/50 backdrop-blur-sm">
        <form action={updateProductWithId} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Informações Estruturais</h2>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Nome do Produto</label>
                <input 
                  required 
                  name="name"
                  type="text" 
                  defaultValue={product.name}
                  placeholder="Ex: Heineken 600ml"
                  className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Categoria</label>
                  <select 
                    required 
                    name="categoryId"
                    defaultValue={product.categoryId}
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white appearance-none cursor-pointer"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Marca / Produtor</label>
                  <input 
                    name="brand"
                    type="text" 
                    defaultValue={product.brand || ''}
                    placeholder="Ex: Heineken"
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Volume / Unid</label>
                  <input 
                    name="volume"
                    type="text" 
                    defaultValue={product.volume || ''}
                    placeholder="Ex: 600ml"
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Código EAN</label>
                  <input 
                    name="barcode"
                    type="text" 
                    defaultValue={product.barcode || ''}
                    placeholder="789..."
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                  />
                </div>
              </div>
            </div>

            {/* Preços e Estoque */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Mercado & Inventário</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Custo Aquisição (R$)</label>
                  <input 
                    required 
                    name="costPrice"
                    type="number" 
                    step="0.01"
                    defaultValue={product.costPrice}
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Preço PDV (R$)</label>
                  <input 
                    required 
                    name="sellPrice"
                    type="number" 
                    step="0.01"
                    defaultValue={product.sellPrice}
                    placeholder="0,00"
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-primary font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Qtd em Estoque</label>
                  <input 
                    required 
                    name="stock"
                    type="number" 
                    defaultValue={product.stock}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Estoque Mínimo</label>
                  <input 
                    required 
                    name="minStock"
                    type="number" 
                    defaultValue={product.minStock}
                    placeholder="5"
                    className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider ml-1">Vencimento em Lote</label>
                <input 
                  name="expiry"
                  type="date" 
                  defaultValue={product.expiry ? new Date(product.expiry).toISOString().split('T')[0] : ''}
                  className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-transparent focus:border-primary/50 outline-none transition-all text-sm text-white shadow-inner appearance-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex justify-between items-center">
            <div className="flex items-center gap-2 text-[10px] text-text-muted italic font-medium">
               * Todos os campos são monitorados para auditoria.
            </div>
            <div className="flex gap-4">
                <Link href="/products" className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-white transition-colors">
                  Cancelar
                </Link>
                <button type="submit" className="btn-primary shadow-indigo-500/20 shadow-lg px-8">
                  <Save size={18} />
                  Salvar Alterações
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
