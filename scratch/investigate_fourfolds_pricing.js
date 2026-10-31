async function inspectFourfolds() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Search products list for FOURFOLDS
  const listRes = await fetch(`http://localhost:3000/api/v1/catalog/products`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const listData = await listRes.json();

  console.log("=== ALL PRODUCTS IN STORE ===");
  listData.data?.forEach(p => {
    console.log(`ID: ${p.id} | Name: "${p.name}" | price: ${p.price} | offerPrice: ${p.offerPrice}`);
  });

  const fourfolds = listData.data?.find(p => p.name.toUpperCase().includes("FOURFOLDS"));
  if (fourfolds) {
    const detailRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${fourfolds.id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const detailData = await detailRes.json();
    console.log("\n=== FOURFOLDS FULL DETAIL ===");
    console.log(JSON.stringify(detailData, null, 2));
  }
}

inspectFourfolds().catch(console.error);
