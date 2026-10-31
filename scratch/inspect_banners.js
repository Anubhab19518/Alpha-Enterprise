async function inspectBanners() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  console.log("=== GET /catalog/banners?active=true ===");
  const activeRes = await fetch(`http://localhost:3000/api/v1/catalog/banners?active=true`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const activeData = await activeRes.json();
  console.log("Active Banners count:", activeData.data?.length);
  console.log(JSON.stringify(activeData.data, null, 2));

  console.log("\n=== GET /catalog/banners (ALL) ===");
  const allRes = await fetch(`http://localhost:3000/api/v1/catalog/banners`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const allData = await allRes.json();
  console.log("All Banners count:", allData.data?.length);
  console.log(JSON.stringify(allData.data, null, 2));
}

inspectBanners().catch(console.error);
