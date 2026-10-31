async function testFilter() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Let's test all query parameters supported according to API contract doc:
  // GET /api/v1/catalog/products
  // Query parameters: categoryId, status (PUBLISHED, DRAFT, ARCHIVED)
  
  const pAll = await (await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  })).json();
  console.log("ALL PRODUCTS count:", pAll.data?.length);
  pAll.data?.forEach(p => console.log(`- ID: ${p.id} | Name: "${p.name}" | Status: ${p.status} | DeletedAt: ${p.deletedAt}`));

  const pPub = await (await fetch('http://localhost:3000/api/v1/catalog/products?status=PUBLISHED', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  })).json();
  console.log("PUBLISHED PRODUCTS count:", pPub.data?.length);

  const pAct = await (await fetch('http://localhost:3000/api/v1/catalog/products?status=ACTIVE', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  })).json();
  console.log("ACTIVE PRODUCTS count:", pAct.data?.length);
}

testFilter().catch(console.error);
