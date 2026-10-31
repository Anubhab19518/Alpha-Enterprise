async function inspectAllProducts() {
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

  console.log(`=================== ALL PRODUCTS FOR STORE (${products.length}) ===================`);
  for (const p of products) {
    const detailRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${p.id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const detailData = (await detailRes.json()).data;
    console.log(`\nProduct ID: ${detailData.id} | Name: "${detailData.name}"`);
    console.log(`Root Price: ${detailData.price} | Root Offer Price: ${detailData.offerPrice}`);
    if (detailData.variants && detailData.variants.length > 0) {
      console.log(`Variants (${detailData.variants.length}):`);
      detailData.variants.forEach((v, idx) => {
        console.log(`  [Variant ${idx+1}] SKU: ${v.sku} | price: ${v.price} | offerPrice: ${v.offerPrice}`);
      });
    } else {
      console.log("No variants");
    }
  }
}

inspectAllProducts().catch(console.error);
