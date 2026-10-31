async function testServiceEnrichment() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // 1. Fetch LISTING endpoint
  const listRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const listData = await listRes.json();
  const products = listData.data || [];

  // Enrich products missing images by fetching product detail in parallel
  const enrichedProducts = await Promise.all(
    products.map(async (p) => {
      if (!p.images || p.images.length === 0) {
        try {
          const detailRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${p.id}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
          });
          const detailData = await detailRes.json();
          if (detailData.data) {
            return {
              ...p,
              images: detailData.data.images || [],
              options: detailData.data.options || [],
              variants: detailData.data.variants || p.variants || [],
            };
          }
        } catch (e) {
          console.error(`Failed to enrich product ${p.id}:`, e);
        }
      }
      return p;
    })
  );

  console.log("=== ENRICHED PRODUCTS IN CATALOG SERVICE ===");
  enrichedProducts.forEach(p => {
    console.log(`\nProduct: "${p.name}" (ID: ${p.id})`);
    console.log("Images count:", p.images?.length);
    console.log("Main image URL:", p.images?.[0]?.url);
  });
}

testServiceEnrichment().catch(console.error);
