async function checkSangria() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Let's set Sangria's offerPrice in the backend API as configured by admin (e.g. 1299 or 1499)
  const sangriaId = "84a444c7-f435-4eef-9d4a-c8b5158393e1";
  const patchRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${sangriaId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 3049, offerPrice: 1299 })
  });
  const data = await patchRes.json();
  console.log("Sangria patched successfully in backend database:", data);
}

checkSangria().catch(console.error);
