'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem } from '@/types/api';
import { calculateEffectivePrice } from '@/utils/pricing';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    variant: ProductVariant | null,
    selectedOptions: Record<string, string>,
    quantity?: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'alpha_enterprise_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart state:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (e) {
        console.error('Failed to save cart state:', e);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (
    product: Product,
    variant: ProductVariant | null,
    selectedOptions: Record<string, string>,
    quantity: number = 1
  ) => {
    const pricing = calculateEffectivePrice(product, variant);
    // Create unique cart item key based on product and variant/options combination
    const variantKey = variant
      ? variant.id
      : Object.entries(selectedOptions)
          .sort(([k1], [k2]) => k1.localeCompare(k2))
          .map(([k, v]) => `${k}:${v}`)
          .join('|');

    const cartItemId = `${product.id}_${variantKey || 'base'}`;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prevItems,
        {
          id: cartItemId,
          product,
          variant,
          selectedOptions,
          quantity,
          pricing,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.pricing.effectivePrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
