'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Eye, Image as ImageIcon } from 'lucide-react';
import { Product } from '@/types/api';
import { calculateEffectivePrice } from '@/utils/pricing';
import { useCart } from '@/context/CartContext';
import { getProductImageUrl } from '@/utils/image';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const pricing = calculateEffectivePrice(product);

  const mainImage = getProductImageUrl(product, null, 0);
  const secondaryImage = getProductImageUrl(product, null, 1) || mainImage;

  const isOutOfStock = product.computedQuantity <= 0 && product.quantity <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      if (product.hasVariants && product.options && product.options.length > 0) {
        router.push(`/products/${product.id}`);
      } else {
        addToCart(product, null, {}, 1);
      }
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-none overflow-hidden border border-neutral-200/80 hover:border-neutral-900 transition-all duration-300 shadow-2xs hover:shadow-md">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-[3/4] bg-neutral-100 overflow-hidden block">
        {mainImage ? (
          <>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {secondaryImage && secondaryImage !== mainImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          /* Clean Placeholder when backend has no uploaded image for product */
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 space-y-2">
            <ImageIcon className="w-10 h-10 stroke-1 text-neutral-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              No Image Available
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {pricing.hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xs shadow-sm">
            -{pricing.discountPercentage}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xs">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Action Overlay Buttons */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              className="flex-1 bg-neutral-950 text-white text-xs font-semibold uppercase tracking-wider py-2.5 px-3 rounded-xs flex items-center justify-center gap-1.5 hover:bg-black transition-colors shadow-md"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{product.hasVariants ? 'Select Options' : 'Quick Add'}</span>
            </button>

            <span className="bg-white text-neutral-800 p-2.5 rounded-xs hover:bg-neutral-100 transition-colors shadow-md">
              <Eye className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div>
          {product.category && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-1">
              {product.category.name}
            </span>
          )}
          <Link
            href={`/products/${product.id}`}
            className="text-xs sm:text-sm font-medium text-neutral-900 line-clamp-1 hover:underline tracking-tight"
          >
            {product.name}
          </Link>
        </div>

        {/* Price Display */}
        <div className="flex items-baseline gap-2 pt-1 border-t border-neutral-50 flex-wrap">
          <span className="text-xs sm:text-sm font-bold text-neutral-900">
            {pricing.formattedEffective}
          </span>
          {pricing.hasDiscount && (
            <span className="text-xs text-neutral-400 line-through font-normal">
              {pricing.formattedOriginal}
            </span>
          )}
          {pricing.hasDiscount && (
            <span className="text-[11px] font-bold text-orange-600 font-sans">
              ({pricing.discountPercentage}% OFF)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
