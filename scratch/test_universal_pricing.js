function calculateEffectivePrice(product, variant) {
  const symbol = "₹";

  // 1. Base Original Price
  let originalPrice = product.price || 0;
  if (
    variant &&
    variant.price !== null &&
    variant.price !== undefined &&
    variant.price !== product.price
  ) {
    originalPrice = variant.price;
  } else if (product.price) {
    originalPrice = product.price;
  }

  // 2. Offer Price Resolution
  let offerPrice = null;

  // Case A: Specific variant selected with explicit offerPrice
  if (
    variant &&
    variant.offerPrice !== null &&
    variant.offerPrice !== undefined
  ) {
    offerPrice = variant.offerPrice;
  }
  // Case B: Root product offerPrice
  else if (
    product.offerPrice !== null &&
    product.offerPrice !== undefined
  ) {
    offerPrice = product.offerPrice;
  }
  // Case C: Check minimum valid offerPrice across variants if root offerPrice is null
  else if (product.variants && product.variants.length > 0) {
    const variantOfferPrices = product.variants
      .map((v) => v.offerPrice)
      .filter(
        (op) =>
          op !== null &&
          op !== undefined &&
          op > 0 &&
          op < originalPrice
      );
    if (variantOfferPrices.length > 0) {
      offerPrice = Math.min(...variantOfferPrices);
    }
  }

  // Determine if valid discount applies
  const hasDiscount =
    offerPrice !== null &&
    offerPrice !== undefined &&
    offerPrice > 0 &&
    offerPrice < originalPrice;

  const effectivePrice = hasDiscount ? offerPrice : originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
    : 0;

  const formatMoney = (val) =>
    `${symbol}${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

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

async function testAllStoreProducts() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const listRes = await fetch(`http://localhost:3000/api/v1/catalog/products`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const listData = await listRes.json();
  const products = listData.data || [];

  console.log("=================== UNIVERSAL PRICING RESOLUTION RESULTS ===================");
  for (const p of products) {
    const detailRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${p.id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const detail = (await detailRes.json()).data;
    const cardPricing = calculateEffectivePrice(detail, null);
    console.log(`\nProduct: "${detail.name}" (ID: ${detail.id})`);
    console.log(`- Listing Card Price: ${cardPricing.formattedEffective} | Base: ${cardPricing.formattedOriginal} | Discount: ${cardPricing.hasDiscount ? `${cardPricing.discountPercentage}% OFF` : 'None'}`);

    if (detail.variants && detail.variants.length > 0) {
      const v0 = detail.variants[0];
      const vPricing = calculateEffectivePrice(detail, v0);
      console.log(`- First Variant (${v0.sku}): ${vPricing.formattedEffective} | Base: ${vPricing.formattedOriginal} | Discount: ${vPricing.hasDiscount ? `${vPricing.discountPercentage}% OFF` : 'None'}`);
    }
  }
}

testAllStoreProducts().catch(console.error);
