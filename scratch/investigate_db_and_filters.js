async function investigate() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  console.log("=== 1. STORE SETTINGS & CURRENCY ===");
  const storeRes = await fetch('http://localhost:3000/api/v1/catalog/ecommerce', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const storeData = await storeRes.json();
  console.log("Stores response:", JSON.stringify(storeData, null, 2));

  console.log("\n=== 2. ALL PRODUCTS IN DETAIL (All Fields) ===");
  const prodRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const prodData = await prodRes.json();
  console.log("Products Count:", prodData.data?.length);
  if (prodData.data) {
    prodData.data.forEach((p, i) => {
      console.log(`\n--- Product [${i+1}]: ${p.name} (ID: ${p.id}) ---`);
      console.log(JSON.stringify(p, null, 2));
    });
  }

  console.log("\n=== 3. ALL CATEGORIES IN DETAIL (All Fields) ===");
  const catRes = await fetch('http://localhost:3000/api/v1/catalog/categories', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const catData = await catRes.json();
  console.log("Categories Count:", catData.data?.length);
  if (catData.data) {
    catData.data.forEach((c, i) => {
      console.log(`\n--- Category [${i+1}]: ${c.name} (ID: ${c.id}) ---`);
      console.log(JSON.stringify(c, null, 2));
    });
  }
}

investigate().catch(console.error);
