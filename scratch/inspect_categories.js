async function inspectCategories() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const catRes = await fetch('http://localhost:3000/api/v1/catalog/categories', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const catData = await catRes.json();
  console.log("Categories Count:", catData.data?.length);
  console.table(catData.data?.map(c => ({ id: c.id, name: c.name, slug: c.slug, parentId: c.parentId, path: c.path, createdAt: c.createdAt })));
}

inspectCategories().catch(console.error);
