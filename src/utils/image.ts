import { Product, ProductVariant } from '@/types/api';

export function getProductImageUrl(
  product: Product | null | undefined,
  variant?: ProductVariant | null,
  index: number = 0
): string | null {
  if (!product) return null;

  // 1. Check variant images first if a specific variant is selected
  if (variant?.images && variant.images.length > index && variant.images[index]?.url) {
    return variant.images[index].url;
  }

  // 2. Check product images
  if (product.images && product.images.length > index && product.images[index]?.url) {
    return product.images[index].url;
  }

  // 3. Fallback to any variant image if product images array is not populated directly
  if (product.variants && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v.images && v.images.length > index && v.images[index]?.url) {
        return v.images[index].url;
      }
    }
  }

  return null;
}
