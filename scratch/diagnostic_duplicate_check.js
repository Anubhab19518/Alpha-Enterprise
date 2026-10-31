async function diagnosticCheck() {
  const storeId = "3a2bdaa8-668a-46ab-86aa-bccc3764ae87";

  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'urbanvogue_admin@bazar.com', password: 'Password123!' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken;

  const catRes = await fetch('http://localhost:3000/api/v1/catalog/categories', {
    headers: { 'Authorization': `Bearer ${token}`, 'X-Ecommerce-Id': storeId }
  });
  const catData = await catRes.json();
  const categories = catData.data || [];

  // Map category by ID for fast lookup
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  // Helper to build full display path for any category
  function getCategoryPath(cat) {
    if (!cat.parentId) return cat.name;
    const parent = categoryMap.get(cat.parentId);
    if (!parent) return cat.name;
    return `${getCategoryPath(parent)} → ${cat.name}`;
  }

  // Detect duplicate category names
  const nameGroups = new Map();
  categories.forEach(c => {
    const list = nameGroups.get(c.name) || [];
    list.push(c);
    nameGroups.set(c.name, list);
  });

  console.log("=================== CATEGORY HIERARCHY ANALYSIS ===================");
  console.log(`Total Categories for tenant [${storeId}]: ${categories.length}\n`);

  categories.forEach(c => {
    console.log(`- ID: ${c.id}`);
    console.log(`  Name: "${c.name}"`);
    console.log(`  Slug: "${c.slug}"`);
    console.log(`  ParentId: ${c.parentId ? `"${c.parentId}"` : 'null (Root)'}`);
    console.log(`  Full Path: "${getCategoryPath(c)}"\n`);
  });

  console.log("=================== DUPLICATE NAME DETECTION REPORT ===================");
  let duplicateCount = 0;
  nameGroups.forEach((group, name) => {
    if (group.length > 1) {
      duplicateCount++;
      console.log(`Duplicate category name detected: "${name}"`);
      group.forEach(c => {
        const path = getCategoryPath(c);
        console.log(`  - ${c.parentId ? path : `Root → ${name}`} (ID: ${c.id}, Slug: ${c.slug})`);
      });
      console.log('');
    }
  });

  if (duplicateCount === 0) {
    console.log("No duplicate category names detected.");
  }
}

diagnosticCheck().catch(console.error);
