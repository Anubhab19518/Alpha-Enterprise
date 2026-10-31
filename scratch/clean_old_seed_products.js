async function cleanOldSeedProducts() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const oldProductIds = [
    '1d565597-d401-4d7a-9fbd-52033a8389f9', // Oversized Streetwear Fleece Hoodie
    'b62722ec-3130-43de-ad57-edc877a925c4', // Classic Cotton Crewneck T-Shirt
  ];

  for (const id of oldProductIds) {
    console.log(`Deleting old product ${id} ...`);
    const delRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
    });
    console.log(`Delete ${id} status: ${delRes.status}`);
  }

  // Verify remaining active products in backend database
  const prodRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const prodData = await prodRes.json();
  console.log("\n=== REMAINING ACTIVE PRODUCTS IN BACKEND DATABASE ===");
  console.log("Count:", prodData.data?.length);
  prodData.data?.forEach(p => console.log(`- ${p.id}: "${p.name}" (Price: ${p.price}, CategoryId: ${p.categoryId})`));
}

cleanOldSeedProducts().catch(console.error);
