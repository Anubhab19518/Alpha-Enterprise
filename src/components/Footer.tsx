'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_CONFIG } from '@/config/store';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Info & Newsletter */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                <Image
                  src={STORE_CONFIG.logoUrl}
                  alt={STORE_CONFIG.name}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif text-[19px] font-bold text-white uppercase tracking-wider">
                {STORE_CONFIG.name}
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Crafting premium luxury fashion essentials for the discerning modern lifestyle.
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Subscribe to Get 15% Off
              </h4>
              {subscribed ? (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-2.5 rounded-xs">
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 rounded-xs px-3 py-2 flex-1 outline-none focus:border-white"
                  />
                  <button
                    type="submit"
                    className="bg-white text-neutral-900 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs hover:bg-neutral-200 transition-colors"
                  >
                    Sign Up
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Lookbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  My Account
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Tracking Order
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  FAQ & Assistance
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Contact Us
                </span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">
              Policies
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Shipping Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Returns & Cancellation Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-neutral-800 text-center text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {STORE_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
