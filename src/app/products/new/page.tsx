import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { getCategories, createProduct } from '@/lib/actions';

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href="/products" className="p-2 hover:bg-bg-accent rounded-full text-text-secondary transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
          <p className="text-text-secondary">Preencha as informações para cadastrar no estoque.</p>
        </div>
      </header>

      {/* Form */}
      <div className="premium-card">
        <form action={createProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b border-border pb-2">Informações Básicas</h2>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Nome do Produto *</label>
                <input 
                  required 
                  name="name"
                  type="text" 
                  placeholder="Ex: Heineken 600ml"
                  className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Categoria *</label>
                  <select 
                    required 
                    name="categoryId"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  >
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Marca</label>
                  <input 
                    name="brand"
                    type="text" 
                    placeholder="Ex: Heineken"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Volume (ml/L)</label>
                  <input 
                    name="volume"
                    type="text" 
                    placeholder="Ex: 600ml"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Código de Barras</label>
                  <input 
                    name="barcode"
                    type="text" 
                    placeholder="EAN-13"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Preços e Estoque */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold border-b border-border pb-2">Preços e Disponibilidade</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Preço de Custo (R$)</label>
                  <input 
                    required 
                    name="costPrice"
                    type="number" 
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Preço de Venda (R$)</label>
                  <input 
                    required 
                    name="sellPrice"
                    type="number" 
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Estoque Atual</label>
                  <input 
                    required 
                    name="stock"
                    type="number" 
                    placeholder="0"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-text-secondary">Estoque Mínimo</label>
                  <input 
                    required 
                    name="minStock"
                    type="number" 
                    placeholder="5"
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-secondary">Data de Validade (Opcional)</label>
                <input 
                  name="expiry"
                  type="date" 
                  className="w-full px-4 py-2 rounded-lg bg-bg-secondary border border-border focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end gap-4">
            <Link href="/products" className="btn-secondary">
              Cancelar
            </Link>
            <button type="submit" className="btn-primary">
              <Save size={20} />
              Salvar Produto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
