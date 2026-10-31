async function testCategoryFilter() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // 1. Get Categories
  const catRes = await fetch('http://localhost:3000/api/v1/catalog/categories', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const catData = await catRes.json();
  const categories = catData.data || [];

  console.log("=================== CATEGORIES & PRODUCT COUNTS ===================");
  for (const c of categories) {
    const pRes = await fetch(`http://localhost:3000/api/v1/catalog/products?categoryId=${c.id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const pData = await pRes.json();
    console.log(`Category "${c.name}" (ID: ${c.id}, Parent: ${c.parentId}): ${pData.data?.length || 0} products`);
    if (pData.data && pData.data.length > 0) {
      console.log("  Products:", pData.data.map(p => `"${p.name}" (${p.id})`));
    }
  }

  // Also check all products without category filter
  const allRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const allData = await allRes.json();
  console.log("\n=== ALL PRODUCTS & THEIR CATEGORIES ===");
  allData.data?.forEach(p => {
    console.log(`Product "${p.name}" (ID: ${p.id}) -> CategoryId: "${p.categoryId}"`);
  });
}

testCategoryFilter().catch(console.error);
