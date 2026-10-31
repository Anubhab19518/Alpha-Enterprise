import { Product, ProductVariant, EffectivePricing } from '@/types/api';
import { STORE_CONFIG } from '@/config/store';

/**
 * Authoritative Pricing & Inclusive Tax Engine
 *
 * Rules:
 * 1. Original Base Price (MRP / originalPrice):
 *    - Uses variant.price if variant has an explicit positive price override.
 *    - Otherwise, inherits root product.price.
 *
 * 2. Raw Selling / Offer Price (baseSellingPrice):
 *    - If variant has an explicit valid offerPrice override (< originalPrice), use variant.offerPrice.
 *    - If product has an explicit offerPrice (< originalPrice), use product.offerPrice.
 *    - Otherwise, falls back to originalPrice.
 *
 * 3. Tax Application (taxAmount & finalPriceWithTax):
 *    - Extract taxRate from product.taxRate or product.taxClass (e.g. GST 18% -> 18%, GST 5% -> 5%).
 *    - Tax is calculated on baseSellingPrice: taxAmount = baseSellingPrice * (taxRate / 100).
 *    - Final Customer Price (effectivePrice) = baseSellingPrice + taxAmount.
 *
 * 4. Customer-Facing Discount %:
 *    - Calculated directly on MRP vs Final Price (Inclusive of Tax):
 *      discountPercentage = round(((originalPrice - effectivePrice) / originalPrice) * 100).
 */
export function calculateEffectivePrice(
  product: Product,
  variant?: ProductVariant | null
): EffectivePricing {
  const symbol = STORE_CONFIG.currencySymbol || '₹';

  // 1. Determine Original MRP:
  let originalPrice = Number(product.price) || 0;
  if (
    variant &&
    variant.price !== null &&
    variant.price !== undefined &&
    Number(variant.price) > 0
  ) {
    originalPrice = Number(variant.price);
  }

  // 2. Determine Raw Base Offer / Selling Price:
  let offerPrice: number | null = null;

  const variantOffer =
    variant?.offerPrice !== null && variant?.offerPrice !== undefined
      ? Number(variant.offerPrice)
      : null;
  const productOffer =
    product.offerPrice !== null && product.offerPrice !== undefined
      ? Number(product.offerPrice)
      : null;

  if (variantOffer !== null && variantOffer > 0 && variantOffer < originalPrice) {
    offerPrice = variantOffer;
  } else if (productOffer !== null && productOffer > 0 && productOffer < originalPrice) {
    offerPrice = productOffer;
  }

  // Base selling price before tax
  const baseSellingPrice = offerPrice !== null ? offerPrice : originalPrice;

  // 3. Tax Calculation (from product.taxRate or product.taxClass)
  let taxRate = Number(product.taxRate ?? 0);
  if (!taxRate && product.taxClass) {
    const match = product.taxClass.match(/(\d+(\.\d+)?)%/);
    if (match) taxRate = parseFloat(match[1]);
  }

  const taxAmount = Math.round(baseSellingPrice * (taxRate / 100) * 100) / 100;
  const finalPriceWithTax = Math.round((baseSellingPrice + taxAmount) * 100) / 100;

  // 4. Effective Price displayed to customer and charged in cart
  const effectivePrice = finalPriceWithTax;

  // 5. Discount Evaluation (on MRP vs Final Price Incl. Tax):
  const hasDiscount = effectivePrice < originalPrice;
  const discountPercentage =
    hasDiscount && originalPrice > 0
      ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100)
      : 0;

  const formatMoney = (val: number) => {
    if (isNaN(val) || val === null || val === undefined) return `${symbol}0`;
    const formattedNum =
      val % 1 === 0
        ? val.toLocaleString('en-IN')
        : val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${symbol}${formattedNum}`;
  };

  return {
    originalPrice,
    offerPrice,
    effectivePrice,
    basePriceWithoutTax: baseSellingPrice,
    taxRate,
    taxClass: product.taxClass || (taxRate > 0 ? `GST ${taxRate}%` : null),
    taxAmount,
    hasDiscount,
    discountPercentage,
    formattedOriginal: formatMoney(originalPrice),
    formattedEffective: formatMoney(effectivePrice),
    formattedTaxAmount: formatMoney(taxAmount),
    formattedBasePrice: formatMoney(baseSellingPrice),
  };
}
