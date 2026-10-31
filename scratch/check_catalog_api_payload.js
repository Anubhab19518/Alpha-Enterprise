async function checkCatalogPayload() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const listRes = await fetch(`http://localhost:3000/api/v1/catalog/products`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const listData = await listRes.json();

  console.log("=================== GET /catalog/products PAYLOAD ===================");
  listData.data?.forEach(p => {
    console.log(`Product: "${p.name}" (ID: ${p.id})`);
    console.log(`  price: ${p.price} | offerPrice: ${p.offerPrice}`);
    console.log(`  variants count: ${p.variants ? p.variants.length : 'undefined'}`);
  });
}

checkCatalogPayload().catch(console.error);
