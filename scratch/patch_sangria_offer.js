async function patchSangriaOffer() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";
  const sangriaId = "84a444c7-f435-4eef-9d4a-c8b5158393e1";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const patchRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${sangriaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 3049, offerPrice: 1499 })
  });
  const data = await patchRes.json();
  console.log("Patched Sangria offerPrice to 1499:", data);
}

patchSangriaOffer().catch(console.error);
