async function checkAdminPricing() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  // Let's test updating FOURFOLDS offerPrice to 799 on backend API to see if PATCH works!
  const fourfoldsId = "11f456ab-435f-45b0-9075-ff4a3c47d016";
  console.log("Calling PATCH /api/v1/catalog/products/11f456ab-435f-45b0-9075-ff4a3c47d016 with offerPrice: 799 ...");
  const patchRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${fourfoldsId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Ecommerce-Id': storeId
    },
    body: JSON.stringify({ price: 2400, offerPrice: 799 })
  });
  const patchData = await patchRes.json();
  console.log("PATCH Response:", JSON.stringify(patchData, null, 2));
}

checkAdminPricing().catch(console.error);
