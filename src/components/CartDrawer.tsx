'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { STORE_CONFIG } from '@/config/store';
import { CheckoutModal } from './CheckoutModal';
import { getProductImageUrl } from '@/utils/image';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalCount } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <h2 className="font-serif text-lg font-bold uppercase tracking-wider text-neutral-900">
                  Shopping Bag ({totalCount})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label="Close Cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-neutral-900 uppercase tracking-wide">
                      Your bag is empty
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Discover our new arrivals and essential pieces.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xs hover:bg-black transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const imageUrl = getProductImageUrl(item.product, item.variant);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b border-neutral-100 last:border-0"
                    >
                      <div className="relative w-20 aspect-[3/4] bg-neutral-100 rounded-xs overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider text-center p-1">
                            No Image
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Selected Option chips */}
                          {Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.selectedOptions).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded-xs"
                                >
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.variant?.sku && (
                            <span className="text-[10px] text-neutral-400 block mt-0.5">
                              SKU: {item.variant.sku}
                            </span>
                          )}
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-neutral-200 rounded-xs">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-neutral-100 text-neutral-600"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-neutral-100 text-neutral-600"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-neutral-900">
                            {STORE_CONFIG.currencySymbol}
                            {(item.pricing.effectivePrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">
                      {STORE_CONFIG.currencySymbol}
                      {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Shipping & Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <button
                  onClick={() => { setIsCartOpen(false); router.push('/checkout'); }}
                  className="w-full bg-neutral-950 text-white text-xs font-bold uppercase tracking-widest py-4 px-6 rounded-xs hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal Notice */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
      />
    </>
  );
};
