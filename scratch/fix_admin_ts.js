const fs = require('fs');

const file = 'd:/Projects/admin-dashboard/src/app/products/new/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 1: Add type annotation to cat parameter if needed
content = content.replace(
  /\(cat\)\s*=>/g,
  '(cat: Category) =>'
);

// Fix 2: Ensure optionValueMap index is safely typed
content = content.replace(
  /const backendOptionValueIds = \(v\.optionValues \|\| \[\]\)\s*\.map\(\(ov\) => optionValueMap\[ov\.id\]\)\s*\.filter\(Boolean\);/,
  `const backendOptionValueIds = (v.optionValues || [])
                .map((ov) => (ov.id ? optionValueMap[ov.id] : undefined))
                .filter((id): id is string => Boolean(id));`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Admin Dashboard TypeScript fixes applied!");
