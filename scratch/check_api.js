async function checkApiSummary() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Categories
  const catRes = await fetch('http://localhost:3000/api/v1/catalog/categories', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const catData = await catRes.json();
  console.log('\n=== CATEGORIES ===');
  console.table(catData.data?.map(c => ({ id: c.id, name: c.name, slug: c.slug, path: c.path, parentId: c.parentId })));

  // Products
  const prodRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const prodData = await prodRes.json();
  console.log('\n=== PRODUCTS ===');
  console.table(prodData.data?.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    offerPrice: p.offerPrice,
    categoryId: p.categoryId,
    hasVariants: p.hasVariants,
    imagesCount: p.images?.length || 0,
    mainImage: p.images?.[0]?.url || 'NONE'
  })));

  if (prodData.data && prodData.data.length > 0) {
    for (const p of prodData.data) {
      const detailRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${p.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
      });
      const detailData = await detailRes.json();
      console.log(`\nProduct Details: ${p.name}`);
      console.log('Options:', detailData.data?.options?.map(o => `${o.name}: [${o.values.map(v => v.value).join(', ')}]`));
      console.log('Variants count:', detailData.data?.variants?.length);
      console.log('Sample variant option values:', detailData.data?.variants?.[0]?.optionValues?.map(ov => ov.value));
    }
  }
}

checkApiSummary().catch(console.error);
