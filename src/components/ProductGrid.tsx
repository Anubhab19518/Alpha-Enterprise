'use client';

import React from 'react';
import { Product } from '@/types/api';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No Products Found',
  emptySubtitle = 'There are currently no products matching your criteria in this catalog collection.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-white border border-neutral-100 rounded-sm p-4 space-y-4">
            <div className="aspect-[3/4] bg-neutral-200 rounded-xs" />
            <div className="h-3 bg-neutral-200 rounded w-1/3" />
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400 font-serif text-lg font-bold">
          !
        </div>
        <h3 className="text-lg font-serif font-bold text-neutral-900 uppercase tracking-wide">
          {emptyTitle}
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
