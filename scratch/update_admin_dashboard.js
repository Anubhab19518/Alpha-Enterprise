const fs = require('fs');

const prodPagePath = 'd:/Projects/admin-dashboard/src/app/products/page.tsx';
let content = fs.readFileSync(prodPagePath, 'utf8');

// 1. Add helper getCategoryFullPath function to products/page.tsx if not present
if (!content.includes('function getCategoryPath(')) {
  const helperCode = `
// Helper to construct complete hierarchy path (e.g. "Women → Hoodies")
function getCategoryPath(cat: any, allCategories: any[]): string {
  if (!cat) return '';
  if (!cat.parentId) return cat.name;
  const parent = allCategories.find((c) => c.id === cat.parentId);
  if (!parent) return cat.name;
  return \`\${getCategoryPath(parent, allCategories)} → \${cat.name}\`;
}
`;
  content = helperCode + content;
}

// 2. Replace categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>)) with full path
const oldOptionCode = `categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))`;

const newOptionCode = `categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {getCategoryPath(c, categories)}
                          </option>
                        ))`;

if (content.includes(oldOptionCode)) {
  content = content.replace(oldOptionCode, newOptionCode);
  fs.writeFileSync(prodPagePath, content, 'utf8');
  console.log("SUCCESS: Updated Admin Products Page category dropdown to display full hierarchy paths!");
} else {
  console.log("Target option code not matched cleanly. Checking existing options...");
}
