async function investigateGallery() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";
  const adidasId = "00608043-a5d2-4649-8795-d2cf044bd20e";
  const nikeId = "dfc510c7-ac38-46d3-be55-67273d8f2fb0";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  console.log("=================== 1. API RESPONSE FOR ADIDAS RUNNING SHOES ===================");
  const adidasRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${adidasId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const adidasData = (await adidasRes.json()).data;
  console.log("Root Product Images:", adidasData.images?.map(i => ({ id: i.id, url: i.url })));
  console.log("Variants Count:", adidasData.variants?.length);
  adidasData.variants?.forEach((v, idx) => {
    if (v.images && v.images.length > 0) {
      console.log(`Variant [${v.sku}] (ID: ${v.id}) -> Images:`, v.images.map(i => ({ id: i.id, url: i.url })));
    } else {
      console.log(`Variant [${v.sku}] (ID: ${v.id}) -> Images: [] (No variant images)`);
    }
  });

  console.log("\n=================== 2. API RESPONSE FOR NIKE AIR PRO ===================");
  const nikeRes = await fetch(`http://localhost:3000/api/v1/catalog/products/${nikeId}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const nikeData = (await nikeRes.json()).data;
  console.log("Root Product Images:", nikeData.images?.map(i => ({ id: i.id, url: i.url })));
  console.log("Variants Count:", nikeData.variants?.length);
  nikeData.variants?.forEach((v, idx) => {
    if (v.images && v.images.length > 0) {
      console.log(`Variant [${v.sku}] (ID: ${v.id}) -> Images:`, v.images.map(i => ({ id: i.id, url: i.url })));
    } else {
      console.log(`Variant [${v.sku}] (ID: ${v.id}) -> Images: [] (No variant images)`);
    }
  });
}

investigateGallery().catch(console.error);
