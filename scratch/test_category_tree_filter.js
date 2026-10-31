function getMatchingCategoryIds(selectedId, categories) {
  if (!selectedId) return [];
  const ids = [selectedId];

  // Find all child categories whose parentId equals selectedId
  const children = categories.filter(c => c.parentId === selectedId);
  children.forEach(child => {
    ids.push(child.id);
  });

  return ids;
}

async function testTreeFilter() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const [catRes, prodRes] = await Promise.all([
    fetch('http://localhost:3000/api/v1/catalog/categories', { headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId } }),
    fetch('http://localhost:3000/api/v1/catalog/products', { headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId } })
  ]);

  const categories = (await catRes.json()).data || [];
  const products = (await prodRes.json()).data || [];

  console.log("=== TESTING FILTER LOGIC FOR EACH CATEGORY ===");
  for (const c of categories) {
    const validIds = getMatchingCategoryIds(c.id, categories);
    const matchingProducts = products.filter(p => p.categoryId && validIds.includes(p.categoryId));
    console.log(`Pill/Category "${c.name}" (ID: ${c.id}) -> Matches ${matchingProducts.length} products:`, matchingProducts.map(p => p.name));
  }
}

testTreeFilter().catch(console.error);
