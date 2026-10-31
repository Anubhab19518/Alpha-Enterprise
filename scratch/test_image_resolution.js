function getProductImageUrl(product) {
  // 1. Check direct product images array if present
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img?.url) return img.url;
    }
  }

  // 2. Check variants images array if present (listing endpoint returns variants with images!)
  if (product.variants && product.variants.length > 0) {
    for (const variant of product.variants) {
      if (variant.images && variant.images.length > 0) {
        for (const img of variant.images) {
          if (img?.url) return img.url;
        }
      }
    }
  }

  return null;
}

async function testResolution() {
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

  console.log("=== RESOLVED IMAGES ON LISTING ENDPOINT ===");
  if (listData.data) {
    listData.data.forEach(p => {
      const imgUrl = getProductImageUrl(p);
      console.log(`Product "${p.name}" (ID: ${p.id}): Resolved Image URL -> ${imgUrl}`);
    });
  }
}

testResolution().catch(console.error);
