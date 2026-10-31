async function resetPrices() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Reset ADIDAS RUNNING SHOES offerPrice to null as configured by user in admin
  const adidasId = "00608043-a5d2-4649-8795-d2cf044bd20e";
  await fetch(`http://localhost:3000/api/v1/catalog/products/${adidasId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 2000, offerPrice: null })
  });

  // Reset Sangria offerPrice to null as configured by user in admin
  const sangriaId = "84a444c7-f435-4eef-9d4a-c8b5158393e1";
  await fetch(`http://localhost:3000/api/v1/catalog/products/${sangriaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 3049, offerPrice: null })
  });

  console.log("Successfully reset ADIDAS and Sangria offer prices to null!");
}

resetPrices().catch(console.error);
