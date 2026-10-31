async function testApiParams() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const testProductUrls = [
    'http://localhost:3000/api/v1/catalog/products',
    'http://localhost:3000/api/v1/catalog/products?status=PUBLISHED',
    'http://localhost:3000/api/v1/catalog/products?status=ACTIVE',
    'http://localhost:3000/api/v1/catalog/products?status=DRAFT',
    'http://localhost:3000/api/v1/catalog/products?status=ARCHIVED',
    'http://localhost:3000/api/v1/catalog/products?includeInactive=false',
    'http://localhost:3000/api/v1/catalog/products?includeDeleted=false',
    'http://localhost:3000/api/v1/catalog/products?isActive=true',
    'http://localhost:3000/api/v1/catalog/products?categoryId=154e5591-5b00-4eed-b169-2b0de4d52132',
  ];

  console.log("=================== TESTING PRODUCT ENDPOINTS ===================");
  for (const url of testProductUrls) {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const data = await res.json();
    console.log(`\nURL: ${url}`);
    console.log(`Status: ${data.status}, Count: ${data.data?.length}`);
    if (data.data && data.data.length > 0) {
      console.log("Product Names:", data.data.map(p => `"${p.name}" (Status: ${p.status}, CatId: ${p.categoryId})`));
    }
  }

  const testCategoryUrls = [
    'http://localhost:3000/api/v1/catalog/categories',
    'http://localhost:3000/api/v1/catalog/categories?includeInactive=false',
    'http://localhost:3000/api/v1/catalog/categories?includeInactive=true',
    'http://localhost:3000/api/v1/catalog/categories?parentId=null',
    'http://localhost:3000/api/v1/catalog/categories?status=ACTIVE',
  ];

  console.log("\n=================== TESTING CATEGORY ENDPOINTS ===================");
  for (const url of testCategoryUrls) {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const data = await res.json();
    console.log(`\nURL: ${url}`);
    console.log(`Status: ${data.status}, Count: ${data.data?.length}`);
    if (data.data && data.data.length > 0) {
      console.log("Category Names:", data.data.map(c => `"${c.name}" (Slug: ${c.slug}, Parent: ${c.parentId})`));
    }
  }
}

testApiParams().catch(console.error);
