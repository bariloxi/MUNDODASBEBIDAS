'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode,
  User,
  Ticket,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchProducts, completeSale } from '@/lib/actions';
import InvoiceAction from '@/components/InvoiceAction';

interface Product {
  id: number;
  name: string;
  sellPrice: number;
  stock: number;
  brand?: string | null;
  volume?: string | null;
}

interface CartItem extends Product {
  quantity: number;
}

const PDVPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [amountReceived, setAmountReceived] = useState<number | string>('');

  // Load products from DB
  useEffect(() => {
    const fetchProducts = async () => {
      const results = await searchProducts(searchTerm);
      setProducts(results as Product[]);
    };
    
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const addToCart = (product: Product) => {
    if (isSuccess) setIsSuccess(false);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const handleFinalize = async () => {
    if (cart.length === 0) return;
    
    setIsLoading(true);
    try {
      const res = await completeSale({
        userId: 1, // Mocked admin ID
        paymentMethod,
        discount,
        total,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.sellPrice
        }))
      });
      
      if (res.success && res.sale) {
        setLastSaleId(res.sale.id);
        setIsSuccess(true);
        setCart([]);
        setDiscount(0);
        setSurcharge(0);
        
        // Auto-reset success after 30 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 30000); 
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao finalizar venda. Verifique o estoque.');
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cart.reduce((acc: number, item) => acc + (item.sellPrice * item.quantity), 0);
  const total = Math.max(0, subtotal + surcharge - discount);
  const change = typeof amountReceived === 'number' ? Math.max(0, amountReceived - total) : 0;

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 pb-6">
      {/* Left Column: Product Selection */}
      <div className="flex-1 flex flex-col gap-6">
        <header className="flex flex-col gap-1 print:hidden">
          <h1 className="text-2xl font-bold text-white tracking-tight">Terminal de Vendas</h1>
          <div className="h-0.5 w-16 bg-primary rounded-none mt-1" />
          <p className="text-slate-500 text-[11px] mt-1 font-medium italic">Selecione os produtos para compor o pedido rapidamente.</p>
        </header>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, marca ou categoria (F1)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 rounded-none bg-bg-surface/50 border border-border focus:border-primary focus:bg-bg-surface outline-none transition-all text-sm font-medium shadow-sm placeholder:text-slate-600"
          />
        </div>

        {/* Product Grid - Melhorado para alta densidade e zoom */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 content-start pr-2 custom-scrollbar">
          {products.map(product => (
            <button 
              key={product.id}
              disabled={product.stock <= 0}
              onClick={() => addToCart(product)}
              className={cn(
                "premium-card flex flex-col group text-left h-full transition-all hover:scale-[1.02] active:scale-[0.98]",
                product.stock <= 0 && "opacity-40 cursor-not-allowed grayscale"
              )}
            >
              <div className="flex-1 space-y-1.5 mb-4">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{product.brand || 'Premium'}</p>
                <h3 className="font-bold text-[13px] text-white group-hover:text-primary transition-colors leading-snug line-clamp-2">
                  {product.name} - R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-border/60">
                <span className="text-sm font-medium text-slate-400 tracking-tight">Estoque:</span>
                <div className={cn(
                  "px-2 py-0.5 rounded-none text-[9px] font-bold uppercase border",
                  product.stock <= 5 ? "bg-danger/10 border-danger/30 text-danger" : "bg-primary/10 border-primary/30 text-primary"
                )}>
                   {product.stock} un
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Checkout Sidebar - Largura adaptativa */}
      <div className="w-[340px] lg:w-[380px] flex-shrink-0 flex flex-col gap-4">
        <div className="glass rounded-none flex-1 flex flex-col overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-primary/20 flex items-center justify-between bg-bg-secondary/20 h-[72px]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-none bg-primary/10 text-primary"><ShoppingCart size={18} /></div>
              <h2 className="font-bold text-sm text-white">Carrinho</h2>
            </div>
            <div className="px-3 py-1.5 rounded-none bg-bg-accent border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider mt-0.5">
              {cart.reduce((acc, item) => acc + item.quantity, 0)} Itens
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-success gap-4 animate-fade-in">
                <div className="p-4 rounded-none bg-success/10 border border-success/20">
                  <CheckCircle2 size={48} />
                </div>
                <div className="text-center space-y-3">
                  <div className="space-y-1">
                    <p className="font-bold text-white uppercase tracking-tight">Venda Sucesso!</p>
                    <p className="text-[10px] font-semibold text-success uppercase tracking-widest opacity-80">Estoque atualizado</p>
                  </div>
                  {lastSaleId && (
                    <InvoiceAction saleId={lastSaleId} />
                  )}
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-30">
                <ShoppingCart size={48} strokeWidth={1.5} />
                <p className="text-[11px] font-bold uppercase tracking-wider">Seu carrinho está vazio</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="group relative p-3 rounded-none bg-bg-surface/40 border border-border hover:border-primary/30 transition-all">
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-100 truncate group-hover:text-primary transition-colors">
                        {item.name} - R$ {item.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">{item.brand || 'S/M'}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-bg-secondary/50 rounded-none p-1 border border-border">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-500 hover:text-white transition-colors disabled:opacity-20"><Minus size={12}/></button>
                      <span className="text-xs font-bold min-w-[18px] text-center text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-500 hover:text-white transition-colors"><Plus size={12}/></button>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border/30 flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">Total: R$ {(item.sellPrice * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-slate-500 hover:text-danger hover:bg-danger/5 rounded-none transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 bg-bg-secondary/40 border-t-2 border-primary space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Subtotal</span>
                <span className="text-sm font-semibold text-zinc-300">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-none bg-bg-surface/60 border border-primary/20 focus-within:border-primary transition-all">
                <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-primary" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Desconto</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-xs font-bold text-zinc-500">R$</span>
                  <input 
                    type="number" 
                    value={discount || ''}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 bg-transparent text-right outline-none text-base font-bold text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-none bg-bg-surface/60 border border-primary/20 focus-within:border-primary transition-all">
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-primary" />
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Acréscimo</span>
                </div>
                <div className="flex items-center gap-1.5 text-white">
                  <span className="text-xs font-bold text-zinc-500">R$</span>
                  <input 
                    type="number" 
                    value={surcharge || ''}
                    onChange={(e) => setSurcharge(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 bg-transparent text-right outline-none text-base font-bold text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 px-1 border-t border-primary/20">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Total Pedido</span>
                <span className="text-2xl font-bold text-white tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              {paymentMethod === 'DINHEIRO' && !isSuccess && (
                <div className="space-y-4 pt-4 border-t border-primary/20 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center p-3 rounded-none bg-bg-surface/80 border-2 border-primary/40 shadow-inner">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest leading-none">Recebido</span>
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-primary" />
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Valor em Espécie</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <span className="text-xs font-bold text-zinc-500">R$</span>
                      <input 
                        type="number" 
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="0,00"
                        className="w-24 bg-transparent text-right outline-none text-xl font-bold text-primary placeholder:text-zinc-800"
                      />
                    </div>
                  </div>

                  {typeof amountReceived === 'number' && amountReceived > 0 && (
                    <div className="flex justify-between items-center p-4 rounded-none bg-success/10 border border-success/20">
                      <span className="text-xs font-bold text-success uppercase tracking-widest">Troco a Devolver</span>
                      <span className="text-2xl font-bold text-white tracking-tighter">R$ {change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'DINHEIRO', icon: Banknote, label: 'Especie' },
                { id: 'PIX', icon: QrCode, label: 'Pix' },
                { id: 'CARTAO', icon: CreditCard, label: 'Cartão' },
              ].map(method => (
                <button 
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-none border transition-all text-center min-h-[64px]",
                    paymentMethod === method.id 
                      ? "border-primary bg-primary/20 text-primary shadow-lg" 
                      : "border-border bg-bg-surface/40 text-zinc-500 hover:border-primary/40 hover:text-zinc-300"
                  )}
                >
                  <method.icon size={20} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{method.label}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleFinalize}
              disabled={cart.length === 0 || isLoading}
              className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-none font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              <Receipt size={18} className="group-hover:rotate-12 transition-transform" />
              Finalizar Pedido (F9)
            </button>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="premium-card !p-4 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-bg-accent flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
              <User size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cliente Selecionado</p>
              <p className="text-sm font-bold text-slate-200">Consumidor de Balcão</p>
            </div>
          </div>
          <button className="p-2 rounded-none hover:bg-zinc-800/50 transition-colors">
            <ChevronRight size={18} className="text-zinc-600 group-hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDVPage;
