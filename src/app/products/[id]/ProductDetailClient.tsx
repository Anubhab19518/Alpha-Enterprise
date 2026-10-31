'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  List,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductVariant, ProductDetailSection, Category } from '@/types/api';
import { calculateEffectivePrice } from '@/utils/pricing';
import { useCart } from '@/context/CartContext';
import { STORE_CONFIG } from '@/config/store';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface ProductDetailClientProps {
  product: Product;
  categories?: Category[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product, categories = [] }) => {
  const { addToCart } = useCart();

  // Dynamic Category Tree Breadcrumbs (Home / Men / Indian Ethnic Wear / Kurtas / Product Name)
  const categoryTrail = useMemo(() => {
    if (!product.category) return [];

    const trail: Category[] = [];
    let curr: Category | undefined = product.category;

    const visited = new Set<string>();
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      trail.unshift(curr);
      if (!curr.parentId) break;
      curr = categories.find((c) => c.id === curr?.parentId);
    }

    return trail;
  }, [product.category, categories]);

  const [quantity] = useState(1);

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.options && product.options.length > 0) {
      product.options.forEach((opt) => {
        if (opt.values && opt.values.length > 0) {
          initial[opt.name] = opt.values[0].value;
        }
      });
    }
    return initial;
  });

  // Selected variant resolution
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!product.variants || product.variants.length === 0) return null;

    return (
      product.variants.find((variant) => {
        if (!variant.optionValues) return false;
        return Object.values(selectedOptions).every((selectedValStr) => {
          return variant.optionValues.some(
            (vVal) => vVal.value.toLowerCase() === selectedValStr.toLowerCase()
          );
        });
      }) || null
    );
  }, [product.variants, selectedOptions]);

  // Pricing resolution
  const pricing = useMemo(
    () => calculateEffectivePrice(product, selectedVariant),
    [product, selectedVariant]
  );

  // Image gallery resolution
  const allImages = useMemo<string[]>(() => {
    if (selectedVariant?.images && selectedVariant.images.length > 0) {
      const variantList: string[] = [];
      selectedVariant.images.forEach((img) => {
        if (img.url && !variantList.includes(img.url)) variantList.push(img.url);
      });
      if (variantList.length > 0) return variantList;
    }

    if (product.images && product.images.length > 0) {
      const rootList: string[] = [];
      product.images.forEach((img) => {
        if (img.url && !rootList.includes(img.url)) rootList.push(img.url);
      });
      if (rootList.length > 0) return rootList;
    }

    return [];
  }, [product.images, selectedVariant]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [allImages]);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const currentQuantity = selectedVariant
    ? selectedVariant.quantity
    : product.computedQuantity || product.quantity;
  const isOutOfStock = currentQuantity <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product, selectedVariant, selectedOptions, quantity);
    }
  };

  // Structured Product Details Fallback Resolution:
  // If variant has explicit custom details -> use variant details. Otherwise fallback to product details!
  const effectiveDetails = useMemo<ProductDetailSection[]>(() => {
    if (selectedVariant?.details && selectedVariant.details.length > 0) {
      return selectedVariant.details;
    }
    if (product.details && product.details.length > 0) {
      return product.details;
    }
    return [
      {
        title: 'Product Specifications',
        content: `Regular fit - Fitted at Chest and Straight on Waist Down\nPure Cotton fabric - Breathable & comfortable fit\nClassic collar & sleeves styling`,
      },
      {
        title: 'Material & Care',
        content: '100% Pure Cotton\nMachine wash with similar colors',
      },
    ];
  }, [product.details, selectedVariant?.details]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 bg-white">
      {/* Breadcrumbs */}
      <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 font-sans border-b border-neutral-100 pb-3">
        <Link href="/" className="hover:text-black font-medium">Home</Link>
        {categoryTrail.map((cat) => (
          <React.Fragment key={cat.id}>
            <span className="text-neutral-400">/</span>
            <Link href={`/shop?category=${cat.id}`} className="hover:text-black font-medium">
              {cat.name}
            </Link>
          </React.Fragment>
        ))}
        {categoryTrail.length === 0 && (
          <>
            <span className="text-neutral-400">/</span>
            <Link href="/shop" className="hover:text-black font-medium">Shop</Link>
          </>
        )}
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-900 font-bold truncate">{product.name}</span>
      </div>

      {/* Main Product Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Vertical Thumbnails + Hero Image (Matching Reference Photo) */}
        <div className="lg:col-span-7 flex flex-row gap-4">
          
          {/* Vertical Thumbnail List Stacked on the Left */}
          {allImages.length > 1 && (
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[580px] scrollbar-none shrink-0 pr-1">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 sm:w-20 h-20 sm:h-24 rounded-md overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    idx === activeImageIndex
                      ? 'border-neutral-950 ring-2 ring-black/10 shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 opacity-80'
                  }`}
                >
                  <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Hero Display Image */}
          <div className="relative flex-1 bg-neutral-100 rounded-lg overflow-hidden min-h-[480px] sm:min-h-[580px] group border border-neutral-200/80 shadow-xs flex items-center justify-center">
            {allImages.length > 0 ? (
              <img
                src={allImages[activeImageIndex] || allImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 p-8 space-y-3">
                <ImageIcon className="w-16 h-16 stroke-1 text-neutral-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  No Image Available
                </span>
              </div>
            )}

            {/* Discount Badge */}
            {pricing.hasDiscount && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xs shadow-md">
                -{pricing.discountPercentage}% OFF
              </span>
            )}

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md text-neutral-800 flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() =>
                    setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md text-neutral-800 flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Product Info, Options, Add to Bag & Product Details (Moved Below Price & Options) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Brand & Title */}
          <div className="space-y-1">
            <span className="text-sm font-bold text-neutral-900 tracking-wide block uppercase font-serif">
              {(STORE_CONFIG.name || "Alpha Enterprise")}®
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Pricing Line */}
          <div className="space-y-2 border-b border-neutral-100 pb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                {pricing.formattedEffective}
              </span>
              {pricing.hasDiscount && (
                <span className="text-base text-neutral-400 line-through font-normal">
                  {pricing.formattedOriginal}
                </span>
              )}
              {pricing.hasDiscount && (
                <span className="text-sm font-black text-emerald-600 tracking-tight">
                  {pricing.discountPercentage}% OFF
                </span>
              )}
              <span className="text-[11px] text-neutral-400 font-normal">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Option / Variant Selectors (Size, Color, etc.) */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-4">
              {product.options.map((option) => {
                const optName = option.name;
                const selectedVal = selectedOptions[optName];

                return (
                  <div key={option.id || optName} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-900 uppercase tracking-wider">
                        Select {optName}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      {option.values.map((valObj) => {
                        const valStr = valObj.value;
                        const isSelected = selectedVal === valStr;

                        return (
                          <button
                            key={valObj.id || valStr}
                            type="button"
                            onClick={() => handleOptionSelect(optName, valStr)}
                            className={`min-w-[48px] px-3.5 py-2.5 text-xs font-bold rounded-md border transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'border-neutral-900 bg-white text-neutral-900 ring-2 ring-black/10 shadow-xs'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                            }`}
                          >
                            <span>{valStr}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Stock Urgency Indicator */}
                    {selectedVal && (
                      <p className="text-[11px] font-semibold text-neutral-600 pt-0.5">
                        {currentQuantity <= 10 ? `Only ${currentQuantity} left in stock!` : 'In Stock'}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Purchase Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 px-6 rounded-md font-extrabold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                isOutOfStock
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-500 text-neutral-950 shadow-md active:scale-[0.99]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}</span>
            </button>

            <button
              type="button"
              className="p-3.5 rounded-md border border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Heart className="w-5 h-5 text-neutral-600" />
            </button>
          </div>

          {/* MOVED PRODUCT DETAILS & DESCRIPTION SECTION (Positioned on the Right Column Below Price & Size) */}
          <div className="border-t border-neutral-200 pt-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-2">
              <List className="w-4 h-4 text-neutral-900" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 font-serif">
                Product Details & Description
              </h3>
            </div>

            {/* Main Product Description */}
            {product.description && (
              <div className="bg-neutral-50/80 p-4 rounded-md border border-neutral-200/60 shadow-2xs">
                <MarkdownRenderer content={product.description} />
              </div>
            )}

            {/* Detailed Product Specifications */}
            <div className="space-y-3 pt-1">
              {effectiveDetails.map((section, idx) => (
                <div key={idx} className="border-b border-neutral-100 pb-3 last:border-0">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1">
                    {section.title}
                  </h4>
                  <MarkdownRenderer content={section.content} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
