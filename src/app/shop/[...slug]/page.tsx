import React from 'react';
import { catalogService } from '@/services/catalogService';
import { ShopClientPage } from '../ShopClientPage';

export const revalidate = 0;

export default async function ShopSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slugs = resolvedParams.slug || [];
  // Use last slug segment e.g. /shop/men/indian-ethnic-wear/kurtas -> kurtas
  const targetSlug = slugs.length > 0 ? slugs[slugs.length - 1] : undefined;

  const searchQuery = resolvedSearchParams.search || '';

  const [products, categories] = await Promise.all([
    catalogService.getProducts(),
    catalogService.getCategories(),
  ]);

  // Find matching category by slug or id
  const matchedCategory = targetSlug
    ? categories.find(
        (c) =>
          c.slug.toLowerCase() === targetSlug.toLowerCase() ||
          c.id === targetSlug
      )
    : undefined;

  const activeCatIdentifier = matchedCategory ? matchedCategory.id : targetSlug;

  return (
    <ShopClientPage
      initialProducts={products}
      categories={categories}
      selectedCategoryId={activeCatIdentifier}
      initialSearchQuery={searchQuery}
    />
  );
}
