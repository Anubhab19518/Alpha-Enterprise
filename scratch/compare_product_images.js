async function compareImages() {
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

  console.log("=================== LISTING ENDPOINT: GET /api/v1/catalog/products ===================");
  if (listData.data) {
    listData.data.forEach((p, idx) => {
      console.log(`\n[Product ${idx+1}] ID: ${p.id} | Name: "${p.name}"`);
      console.log("Images property type:", typeof p.images, Array.isArray(p.images) ? `Array length ${p.images.length}` : p.images);
      console.log("Images value:", JSON.stringify(p.images, null, 2));
      console.log("All product keys:", Object.keys(p));
    });
  }

  // 2. Fetch DETAIL endpoint for each product
  console.log("\n=================== DETAIL ENDPOINT: GET /api/v1/catalog/products/:id ===================");
  if (listData.data) {
    for (const p of listData.data) {
      const detailRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${p.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
      });
      const detailData = await detailRes.json();
      const d = detailData.data;
      console.log(`\n[Product Detail] ID: ${d?.id} | Name: "${d?.name}"`);
      console.log("Images property value:", JSON.stringify(d?.images, null, 2));
      console.log("Variants images:", JSON.stringify(d?.variants?.map(v => ({ sku: v.sku, images: v.images })), null, 2));
      console.log("All detail keys:", Object.keys(d || {}));
    }
  }
}

compareImages().catch(console.error);
