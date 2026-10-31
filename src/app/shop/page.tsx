import React from 'react';
import { catalogService } from '@/services/catalogService';
import { ShopClientPage } from './ShopClientPage';

export const revalidate = 0;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const categoryId = resolvedSearchParams.category;
  const searchQuery = resolvedSearchParams.search || '';

  // Fetch full store catalog products and categories to allow instant seamless client filtering
  const [products, categories] = await Promise.all([
    catalogService.getProducts(),
    catalogService.getCategories(),
  ]);

  return (
    <ShopClientPage
      initialProducts={products}
      categories={categories}
      selectedCategoryId={categoryId}
      initialSearchQuery={searchQuery}
    />
  );
}
