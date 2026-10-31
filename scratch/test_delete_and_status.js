async function testDelete() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  console.log("=== TESTING PRODUCT STATUS & DELETION API ===");
  // Check products list
  const prodRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const prodData = await prodRes.json();
  console.log("Products Count:", prodData.data?.length);
  prodData.data?.forEach(p => console.log(`- ${p.id}: "${p.name}" (Status: ${p.status}, Updated: ${p.updatedAt})`));
}

testDelete().catch(console.error);
