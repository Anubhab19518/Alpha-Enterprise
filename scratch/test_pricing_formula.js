function calculateEffectivePrice(product, variant) {
  const symbol = "₹";

  let originalPrice = product.price;
  if (variant && variant.price !== null && variant.price !== undefined && variant.price !== product.price) {
    originalPrice = variant.price;
  } else if (product.price) {
    originalPrice = product.price;
  }

  let offerPrice = null;
  if (variant && variant.offerPrice !== null && variant.offerPrice !== undefined) {
    offerPrice = variant.offerPrice;
  } else if (product.offerPrice !== null && product.offerPrice !== undefined) {
    offerPrice = product.offerPrice;
  }

  const hasDiscount =
    offerPrice !== null &&
    offerPrice !== undefined &&
    offerPrice > 0 &&
    offerPrice < originalPrice;

  const effectivePrice = hasDiscount ? offerPrice : originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
    : 0;

  const formatMoney = (val) => `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return {
    originalPrice,
    offerPrice,
    effectivePrice,
    hasDiscount,
    discountPercentage,
    formattedOriginal: formatMoney(originalPrice),
    formattedEffective: formatMoney(effectivePrice),
  };
}

// Test FOURFOLDS product
const fourfoldsProduct = {
  price: 2400,
  offerPrice: 799,
  name: "FOURFOLDS"
};

const fourfoldsVariantS = {
  price: 2400,
  offerPrice: null,
  sku: "FOURFO-S"
};

const fourfoldsCustomVariant = {
  price: 3000,
  offerPrice: 1500,
  sku: "FOURFO-CUSTOM"
};

console.log("=== ROOT PRODUCT PRICING ===");
console.log(calculateEffectivePrice(fourfoldsProduct, null));

console.log("\n=== STANDARD VARIANT (Inherited Offer Price) PRICING ===");
console.log(calculateEffectivePrice(fourfoldsProduct, fourfoldsVariantS));

console.log("\n=== EXPLICIT CUSTOM VARIANT PRICING ===");
console.log(calculateEffectivePrice(fourfoldsProduct, fourfoldsCustomVariant));
