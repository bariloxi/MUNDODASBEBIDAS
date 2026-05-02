import { useState, useCallback, useMemo } from 'react';

export interface Product {
  id: number;
  name: string;
  sellPrice: number;
  stock: number;
  brand?: string | null;
  volume?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ).filter(item => item.quantity > 0));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setSurcharge(0);
  }, []);

  const subtotal = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.sellPrice * item.quantity), 0),
  [cart]);

  const total = useMemo(() => 
    Math.max(0, subtotal + surcharge - discount),
  [subtotal, surcharge, discount]);

  const totalItems = useMemo(() => 
    cart.reduce((acc, item) => acc + item.quantity, 0),
  [cart]);

  return {
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
    total,
    totalItems
  };
}
