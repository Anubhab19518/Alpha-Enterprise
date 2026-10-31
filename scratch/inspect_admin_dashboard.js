const fs = require('fs');
const path = require('path');

const adminDir = 'd:/Projects/admin-dashboard';

console.log("=== INSPECTING ADMIN DASHBOARD FILES ===");

function findFiles(dir, matchStr) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.next' && item.name !== '.git') {
        results.push(...findFiles(fullPath, matchStr));
      }
    } else if (item.isFile()) {
      if (item.name.endsWith('.tsx') || item.name.endsWith('.ts') || item.name.endsWith('.jsx') || item.name.endsWith('.js')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(matchStr)) {
          results.push(fullPath);
        }
      }
    }
  }
  return results;
}

try {
  const categoryFiles = findFiles(adminDir, 'category');
  console.log(`Found ${categoryFiles.length} files referencing 'category':`);
  categoryFiles.forEach(f => console.log(`- ${f}`));
} catch (err) {
  console.error('Error reading admin dir:', err);
}
