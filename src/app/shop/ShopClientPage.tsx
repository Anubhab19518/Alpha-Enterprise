'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Category, Product } from '@/types/api';
import { ProductGrid } from '@/components/ProductGrid';
import { calculateEffectivePrice } from '@/utils/pricing';

interface ShopClientPageProps {
  initialProducts: Product[];
  categories: Category[];
  selectedCategoryId?: string;
  initialSearchQuery?: string;
}

export const ShopClientPage: React.FC<ShopClientPageProps> = ({
  initialProducts,
  categories,
  selectedCategoryId,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    selectedCategoryId
  );
  const [sortOption, setSortOption] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');

  useEffect(() => {
    setActiveCategoryId(selectedCategoryId);
  }, [selectedCategoryId]);

  const handleCategorySelect = (category?: Category | string) => {
    if (!category) {
      setActiveCategoryId(undefined);
      window.history.pushState({}, '', '/shop');
      return;
    }

    let targetCat: Category | undefined;
    if (typeof category === 'string') {
      targetCat = categories.find((c) => c.id === category || c.slug === category);
    } else {
      targetCat = category;
    }

    if (targetCat) {
      setActiveCategoryId(targetCat.id);
      window.history.pushState({}, '', '/shop/' + targetCat.slug);
    } else {
      setActiveCategoryId(typeof category === 'string' ? category : undefined);
    }
  };

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === activeCategoryId || c.slug.toLowerCase() === activeCategoryId?.toLowerCase()),
    [activeCategoryId, categories]
  );

  // Construct active category trail from root down to active category at arbitrary depth
  const activeCategoryTrail = useMemo(() => {
    if (!activeCategory) return [];
    const trail: Category[] = [];
    let curr: Category | undefined = activeCategory;
    while (curr) {
      trail.unshift(curr);
      curr = curr.parentId ? categories.find((c) => c.id === curr!.parentId) : undefined;
    }
    return trail;
  }, [activeCategory, categories]);

  // Recursively collect active category ID and all descendant category IDs
  const validCategoryIds = useMemo(() => {
    const targetId = activeCategory ? activeCategory.id : activeCategoryId;
    if (!targetId) return null;
    const descendantSet = new Set<string>([targetId]);

    function collectChildren(parentId: string) {
      const children = categories.filter((c) => c.parentId === parentId);
      children.forEach((child) => {
        descendantSet.add(child.id);
        collectChildren(child.id);
      });
    }

    collectChildren(targetId);
    return descendantSet;
  }, [activeCategory, activeCategoryId, categories]);

  // Direct root categories list
  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories]
  );

  // Direct subcategories of the active category
  const activeSubcategories = useMemo(() => {
    const targetId = activeCategory ? activeCategory.id : activeCategoryId;
    if (!targetId) return [];
    return categories.filter((c) => c.parentId === targetId);
  }, [activeCategory, activeCategoryId, categories]);

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by category and all descendant categories recursively
    if (validCategoryIds) {
      result = result.filter((p) => p.categoryId && validCategoryIds.has(p.categoryId));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort Products
    if (sortOption === 'price-low') {
      result.sort((a, b) => {
        const priceA = calculateEffectivePrice(a).effectivePrice;
        const priceB = calculateEffectivePrice(b).effectivePrice;
        return priceA - priceB;
      });
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => {
        const priceA = calculateEffectivePrice(a).effectivePrice;
        const priceB = calculateEffectivePrice(b).effectivePrice;
        return priceB - priceA;
      });
    } else if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [initialProducts, validCategoryIds, searchQuery, sortOption]);

  return (
    <div className="w-full px-3 sm:px-5 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs & Header Title */}
      <div className="space-y-3 border-b border-neutral-100 pb-6">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-300" />
          <Link href="/shop" className="hover:text-black font-semibold transition-colors">
            Shop Catalog
          </Link>

          {activeCategoryTrail.map((cat, idx) => {
            const isLast = idx === activeCategoryTrail.length - 1;
            return (
              <React.Fragment key={cat.id}>
                <ChevronRight className="w-3 h-3 text-neutral-300" />
                {isLast ? (
                  <span className="text-neutral-900 font-bold">{cat.name}</span>
                ) : (
                  <button
                    onClick={() => handleCategorySelect(cat.id)}
                    className="hover:text-black transition-colors"
                  >
                    {cat.name}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 uppercase tracking-tight">
              {activeCategoryTrail.length > 0
                ? activeCategoryTrail.map((c) => c.name).join(' › ')
                : 'All Catalog Products'}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 font-light">
              Showing {filteredProducts.length} items from store catalog
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Filter by product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 text-xs rounded-xs pl-9 pr-4 py-2.5 outline-none focus:border-black transition-colors"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter & Sort Navigation Bar */}
      <div className="space-y-3 bg-neutral-50 p-4 rounded-xs border border-neutral-100">
        {/* Tier 1: Root Categories / Parent Level */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-500" />
              Collection:
            </span>

            <button
              onClick={() => handleCategorySelect(undefined)}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all ${
                !activeCategoryId
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-900 hover:text-black'
              }`}
            >
              All Products
            </button>

            {rootCategories.map((cat) => {
              const isSelected = activeCategoryTrail.length > 0 && activeCategoryTrail[0].id === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all ${
                    isSelected
                      ? 'bg-neutral-950 text-white shadow-xs'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:border-neutral-900 hover:text-black'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1 whitespace-nowrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
              Sort By:
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'default' | 'price-low' | 'price-high' | 'name')}
              className="bg-white border border-neutral-200 text-xs font-medium text-neutral-800 rounded-xs px-3 py-1.5 outline-none focus:border-black cursor-pointer"
            >
              <option value="default">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Tier 2: Subcategories of the active category */}
        {activeSubcategories.length > 0 && (
          <div className="pt-3 border-t border-neutral-200/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mr-2">
              {activeCategory?.name} Subcategories:
            </span>

            {activeSubcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleCategorySelect(sub.id)}
                className="px-3 py-1 text-xs font-medium bg-white border border-neutral-200 text-neutral-700 rounded-full hover:bg-neutral-950 hover:text-white transition-all"
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Catalog Grid */}
      <ProductGrid
        products={filteredProducts}
        emptyTitle="No Catalog Matches Found"
        emptySubtitle="There are no published products matching this category in the store catalog."
      />
    </div>
  );
};
