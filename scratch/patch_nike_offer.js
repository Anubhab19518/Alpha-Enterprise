async function patchNikeOffer() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";
  const nikeId = "dfc510c7-ac38-46d3-be55-67273d8f2fb0";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const patchRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${nikeId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 2500, offerPrice: 2000 })
  });
  const data = await patchRes.json();
  console.log("Patched NIKE AIR PRO offerPrice to 2000:", data);
}

patchNikeOffer().catch(console.error);
