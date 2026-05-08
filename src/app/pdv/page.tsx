'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart, Product } from '@/hooks/useCart';
import { useToast } from '@/components/Toast';
import { completeSale } from '@/lib/actions';
import { ProductGrid } from './components/ProductGrid';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutActions } from './components/CheckoutActions';
import { ClientSelector } from './components/ClientSelector';

interface Client {
  id: number;
  name: string;
  phone?: string | null;
  address?: string | null;
}

const PDVPage = () => {
  const {
    cart,
    discount,
    surcharge,
    setDiscount,
    setSurcharge,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    total
  } = useCart();

  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<number | null>(null);
  const [amountReceived, setAmountReceived] = useState<number | string>('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dueDate, setDueDate] = useState('');

  const handleAddToCart = (product: Product) => {
    if (isSuccess) setIsSuccess(false);
    addToCart(product);
  };

  const handleFinalize = useCallback(async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'RECEBER_DEPOIS' && !selectedClient) {
      showToast('Selecione um cliente para venda a prazo', 'error');
      return;
    }
    if (paymentMethod === 'RECEBER_DEPOIS' && !dueDate) {
      showToast('Selecione uma data de vencimento', 'error');
      return;
    }
    if (paymentMethod === 'DINHEIRO' && typeof amountReceived === 'number' && amountReceived < total) {
      showToast('Valor recebido é menor que o total', 'error');
      return;
    }
    setIsLoading(true);
    showToast('Processando venda...', 'loading');
    try {
      const res = await completeSale({
        userId: 1, // Em um cenário real, pegar do contexto de auth
        paymentMethod,
        discount,
        total,
        clientId: selectedClient?.id,
        dueDate: paymentMethod === 'RECEBER_DEPOIS' ? dueDate : undefined,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.sellPrice
        }))
      });
      if (res.success && res.sale) {
        setLastSaleId(res.sale.id);
        setIsSuccess(true);
        clearCart();
        setAmountReceived('');
        setSelectedClient(null);
        setDueDate('');
        showToast('Venda finalizada com sucesso!', 'success');
        // Auto-reset success message after 30s
        setTimeout(() => setIsSuccess(false), 30000);
      } else {
        showToast(res.error || 'Erro ao finalizar venda', 'error');
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      showToast('Erro crítico ao processar venda', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [cart, total, paymentMethod, selectedClient, dueDate, amountReceived, discount, showToast, clearCart]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        handleFinalize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFinalize]); // Dependencies for closure

  return (
    <div className="h-[calc(100vh-140px)] flex gap-8 pb-6 animate-in fade-in duration-500">
      {/* Left Column: Product Selection */}
      <ProductGrid onAddToCart={handleAddToCart} />

      {/* Right Column: Checkout Sidebar */}
      <div className="w-[380px] lg:w-[420px] flex-shrink-0 flex flex-col gap-5">
        <div className="flex-1 flex flex-col min-h-0">
          <CartSidebar
            items={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            isSuccess={isSuccess}
            lastSaleId={lastSaleId}
          />

          <CheckoutActions
            subtotal={subtotal}
            total={total}
            discount={discount}
            surcharge={surcharge}
            setDiscount={setDiscount}
            setSurcharge={setSurcharge}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            amountReceived={amountReceived}
            setAmountReceived={setAmountReceived}
            dueDate={dueDate}
            setDueDate={setDueDate}
            isLoading={isLoading}
            onFinalize={handleFinalize}
            isDisabled={cart.length === 0 || isSuccess}
          />
        </div>

        <ClientSelector
          selectedClient={selectedClient}
          onSelect={setSelectedClient}
        />
      </div>
    </div>
  );
};

export default PDVPage;
