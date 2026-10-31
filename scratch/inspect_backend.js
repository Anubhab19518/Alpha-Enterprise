async function checkAllAdminsAndStores() {
  const admins = [
    { email: 'urbanvogue_admin@bazar.com', pass: 'Password123!' },
    { email: 'freshharvest_admin@bazar.com', pass: 'Password123!' },
    { email: 'volttech_admin@bazar.com', pass: 'Password123!' },
    { email: 'fitpulse_admin@bazar.com', pass: 'Password123!' },
    { email: 'pureclean_admin@bazar.com', pass: 'Password123!' },
    { email: 'admin@bazar.com', pass: 'Password123!' }
  ];

  for (const a of admins) {
    try {
      const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: a.email, password: a.pass })
      });
      const loginData = await loginRes.json();
      if (loginData.status === 'ok' && loginData.data) {
        const org = loginData.data.organisation;
        const token = loginData.data.accessToken;

        // Query products for this org
        const prodRes = await fetch('http://localhost:3000/api/v1/catalog/products', {
          headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': org.id }
        });
        const prodData = await prodRes.json();

        console.log(`\nUser: ${a.email} | Org: ${org?.name} (${org?.id}) | Products Count: ${prodData.data?.length}`);
        if (prodData.data) {
          console.table(prodData.data.map(p => ({ id: p.id, name: p.name, price: p.price, status: p.status })));
        }
      } else {
        console.log(`User ${a.email} login failed: ${loginData.message}`);
      }
    } catch (e) {
      console.log(`Error checking ${a.email}:`, e.message);
    }
  }
}

checkAllAdminsAndStores().catch(console.error);
