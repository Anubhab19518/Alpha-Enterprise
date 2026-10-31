'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, ChevronDown } from 'lucide-react';
import { STORE_CONFIG } from '@/config/store';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Category } from '@/types/api';
import { buildCategoryTree } from '@/utils/category';

import { CategoryTreeNode } from '@/utils/category';

interface HeaderProps {
  categories?: Category[];
}

// Recursive Navigation Subcategory Item Component for arbitrary depth
const NavSubCategoryItem: React.FC<{ node: CategoryTreeNode }> = ({ node }) => {
  const hasChildren = node.childrenNodes && node.childrenNodes.length > 0;

  return (
    <div className="relative group/sub">
      <div className="flex items-center justify-between hover:bg-neutral-50 rounded-xs px-2 py-1.5">
        <Link
          href={`/shop/${node.slug}`}
          className="text-xs font-medium text-neutral-700 hover:text-black transition-colors flex-1"
        >
          {node.name}
        </Link>
        {hasChildren && (
          <ChevronDown className="w-3 h-3 text-neutral-400 -rotate-90 group-hover/sub:text-black" />
        )}
      </div>

      {hasChildren && (
        <div className="absolute left-full top-0 ml-1 w-56 bg-white border border-neutral-200 shadow-xl rounded-sm p-3 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
          <Link
            href={`/shop/${node.slug}`}
            className="block text-xs font-semibold text-neutral-900 hover:text-black hover:bg-neutral-50 px-2 py-1 mb-1 rounded-xs transition-colors"
          >
            All {node.name}
          </Link>
          {node.childrenNodes.map((sub: CategoryTreeNode) => (
            <NavSubCategoryItem key={sub.id} node={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ categories = [] }) => {
  const router = useRouter();
  const { totalCount, setIsCartOpen } = useCart();
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryTree = buildCategoryTree(categories);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all shadow-xs">
      {/* Top Announcement Ticker */}
      <div className="bg-neutral-950 text-neutral-300 text-[11px] font-medium tracking-widest uppercase py-1.5 px-4 text-center">
        <span>Complimentary Express Worldwide Delivery On Orders Over {STORE_CONFIG.currencySymbol}2,000</span>
      </div>

      {/* Main Single Navbar Container (Myntra / Luxury D2C Style Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 lg:gap-6">
        
        {/* 1. Left: Mobile Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-700 hover:text-black focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link href="/" className="flex items-center gap-3 group whitespace-nowrap">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0">
              <Image
                src={STORE_CONFIG.logoUrl}
                alt={STORE_CONFIG.name}
                fill
                priority
                className="object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-neutral-950 uppercase whitespace-nowrap hidden sm:inline-block">
              {STORE_CONFIG.name}
            </span>
          </Link>
        </div>

        {/* 2. Primary Navigation Links with Mega Menu Flyout on Hover */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-xs font-bold uppercase tracking-wider text-neutral-800">
          {categoryTree.map((rootNode) => (
            <div key={rootNode.id} className="relative group py-5">
              <Link
                href={`/shop/${rootNode.slug}`}
                className="hover:text-black transition-colors inline-flex items-center gap-1 border-b-2 border-transparent group-hover:border-neutral-950 py-1"
              >
                <span>{rootNode.name}</span>
                {rootNode.childrenNodes.length > 0 && (
                  <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-black transition-colors" />
                )}
              </Link>

              {/* Hover Recursive Mega Menu Overlay */}
              {rootNode.childrenNodes.length > 0 && (
                <div className="absolute top-full left-0 min-w-64 bg-white border border-neutral-200 shadow-2xl rounded-sm p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-900 border-b border-neutral-100 pb-2 mb-2">
                    {rootNode.name} Categories
                  </div>
                  <div className="space-y-1.5">
                    <Link
                      href={`/shop/${rootNode.slug}`}
                      className="block text-xs font-semibold text-neutral-900 hover:text-black hover:bg-neutral-50 px-2 py-1.5 rounded-xs transition-colors"
                    >
                      All {rootNode.name}
                    </Link>
                    {rootNode.childrenNodes.map((child) => (
                      <NavSubCategoryItem key={child.id} node={child} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <Link
            href="/shop"
            className="hover:text-black transition-colors border-b-2 border-transparent hover:border-neutral-950 py-1 whitespace-nowrap"
          >
            Shop All
          </Link>
        </nav>

        {/* 3. Center: Wide Search Input */}
        <div className="flex-1 max-w-xs lg:max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search catalog, products & brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-100/80 border border-neutral-200/80 text-xs text-neutral-800 rounded-sm pl-9 pr-4 py-2 focus:outline-none focus:border-black focus:bg-white transition-all placeholder:text-neutral-400"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </form>
        </div>

        {/* 4. Right: Profile & Shopping Bag Icons */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {user ? (
            <div className="relative group">
              <button className="flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-wider text-neutral-800 hover:text-black transition-colors whitespace-nowrap">
                <User className="w-4 h-4 stroke-[1.75]" />
                <span className="mt-0.5 line-clamp-1">{user.name?.split(' ')[0] || 'Profile'}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-neutral-200 shadow-xl rounded-sm py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-4 py-2 border-b border-neutral-100 text-[11px] font-bold text-neutral-900 truncate">
                  Hi, {user.name || user.email?.split('@')[0]}
                </div>
                <Link
                  href="/profile?tab=profile"
                  className="block text-left px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  My Account Profile
                </Link>
                <Link
                  href="/profile?tab=addresses"
                  className="block text-left px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  Saved Address Book
                </Link>
                <Link
                  href="/profile?tab=orders"
                  className="block text-left px-4 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  My Order History
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-neutral-50 border-t border-neutral-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (           <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-wider text-neutral-800 hover:text-black transition-colors whitespace-nowrap"
            >
              <User className="w-4 h-4 stroke-[1.75]" />
              <span className="mt-0.5">Profile</span>
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center relative p-1 text-neutral-900 hover:text-black transition-colors"
            aria-label="View Shopping Bag"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Bag</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-4 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-100 text-sm text-neutral-800 rounded-lg pl-9 pr-4 py-2.5 outline-none"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </form>
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-wider text-neutral-800 py-2 border-b border-neutral-100"
          >
            Home
          </Link>
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold uppercase tracking-wider text-neutral-800 py-2 border-b border-neutral-100"
          >
            Shop All Catalog
          </Link>

          {categoryTree.map((rootNode) => (
            <div key={rootNode.id} className="py-1 border-b border-neutral-100 last:border-0">
              <Link
                href={`/shop/${rootNode.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-neutral-900 py-1.5 uppercase tracking-wide hover:text-black"
              >
                {rootNode.name}
              </Link>

              {rootNode.childrenNodes.length > 0 && (
                <div className="pl-4 space-y-1 py-1">
                  {rootNode.childrenNodes.map((child) => (
                    <Link
                      key={child.id}
                      href={`/shop/${child.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-xs font-medium text-neutral-600 py-1 hover:text-black"
                    >
                      → {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
