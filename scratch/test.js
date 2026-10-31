async function run() {
  // Test customer registration
  const regEmail = `customer_${Date.now()}@example.com`;
  const regRes = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: regEmail,
      password: 'Password123!',
      firstName: 'Customer',
      lastName: 'User'
    })
  });
  const regData = await regRes.json();
  console.log('Customer Reg Response:', JSON.stringify(regData, null, 2));

  if (regData.data?.accessToken) {
    const custToken = regData.data.accessToken;
    const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

    const catWithCust = await (await fetch('http://localhost:3000/api/v1/catalog/categories', {
      headers: { 'Authorization': `Bearer ${custToken}`, 'X-Ecommerce-Id': storeId }
    })).json();
    console.log("Categories with customer token:", catWithCust.status, catWithCust.data?.length);

    const prodWithCust = await (await fetch('http://localhost:3000/api/v1/catalog/products', {
      headers: { 'Authorization': `Bearer ${custToken}`, 'X-Ecommerce-Id': storeId }
    })).json();
    console.log("Products with customer token:", prodWithCust.status, prodWithCust.data?.length);
  }
}

run().catch(console.error);
