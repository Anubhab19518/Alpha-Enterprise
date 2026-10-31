'use client';

import React from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-sm max-w-md w-full p-6 shadow-2xl space-y-5 border border-neutral-100 z-10">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-neutral-900 uppercase tracking-wide">
            Checkout Service Preview
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Welcome to the <strong>{STORE_CONFIG.name}</strong> customer storefront demonstration.
          </p>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Order creation (`/api/v1/orders`) and payment processing APIs are currently pending implementation on the multi-tenant backend platform. Your item selection has been preserved in client session.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-neutral-950 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xs hover:bg-black transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
