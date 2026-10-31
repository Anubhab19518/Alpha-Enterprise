const fs = require('fs');

const prodPagePath = 'd:/Projects/admin-dashboard/src/app/products/page.tsx';
const catPagePath = 'd:/Projects/admin-dashboard/src/app/categories/page.tsx';

function fixUseClient(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove any 'use client'; directives in the body
  content = content.replace(/['"]use client['"];?\r?\n?/g, '');

  // Add 'use client'; at line 1
  content = `'use client';\n\n` + content.trimStart();

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`FIXED: Moved 'use client'; to line 1 in ${filePath}`);
}

fixUseClient(prodPagePath);
fixUseClient(catPagePath);
