import React from 'react';
import { notFound } from 'next/navigation';
import { catalogService } from '@/services/catalogService';
import { ProductDetailClient } from './ProductDetailClient';

export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const productId = resolvedParams.id;

  const [product, categories] = await Promise.all([
    catalogService.getProductById(productId),
    catalogService.getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} categories={categories} />;
}
