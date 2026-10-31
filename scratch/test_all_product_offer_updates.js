async function testOfferUpdates() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Update Sangria offerPrice to 1299 if root offerPrice is null
  const sangriaId = "84a444c7-f435-4eef-9d4a-c8b5158393e1";
  await fetch(`http://localhost:3000/api/v1/catalog/products/${sangriaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 3049, offerPrice: 1299 })
  });

  // Update ADIDAS RUNNING SHOES offerPrice to 1499 if root offerPrice is null
  const adidasId = "00608043-a5d2-4649-8795-d2cf044bd20e";
  await fetch(`http://localhost:3000/api/v1/catalog/products/${adidasId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 2000, offerPrice: 1499 })
  });

  console.log("Updated Sangria and ADIDAS offer prices successfully!");
}

testOfferUpdates().catch(console.error);
