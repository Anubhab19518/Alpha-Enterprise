async function testAdminEndpoints() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  console.log("=== 1. TEST PATCH PRODUCT STATUS ===");
  // Let's check product dfc510c7-ac38-46d3-be55-67273d8f2fb0 (NIKE AIR PRO)
  const p1Res = await fetch('http://localhost:3000/api/v1/catalog/products/dfc510c7-ac38-46d3-be55-67273d8f2fb0', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const p1Data = await p1Res.json();
  console.log("NIKE AIR PRO details:", p1Data.data?.status);

  console.log("\n=== 2. TEST GET /api/v1/catalog/products WITH DIFFERENT STATUSES ===");
  const statuses = ['ACTIVE', 'PUBLISHED', 'DRAFT', 'ARCHIVED', 'INACTIVE'];
  for (const s of statuses) {
    const res = await fetch(`http://localhost:3000/api/v1/catalog/products?status=${s}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    const d = await res.json();
    console.log(`Status=${s} -> Count: ${d.data?.length}`);
    if (d.data && d.data.length > 0) {
      console.log(d.data.map(p => p.name));
    }
  }
}

testAdminEndpoints().catch(console.error);
