const fs = require('fs');

const prodPage = 'd:/Projects/admin-dashboard/src/app/products/page.tsx';
const catalogApi = 'd:/Projects/admin-dashboard/src/lib/api/catalog.api.ts';

console.log("=================== ADMIN PRODUCTS PAGE HANDLESUBMIT ===================");
const prodContent = fs.readFileSync(prodPage, 'utf8');
const submitMatch = prodContent.match(/handleSubmit[\s\S]*?};/);
if (submitMatch) {
  console.log(submitMatch[0]);
} else {
  console.log("handleSubmit not found directly, showing snippet...");
  console.log(prodContent.slice(0, 2000));
}

console.log("\n=================== CATALOG API PRODUCT METHODS ===================");
const apiContent = fs.readFileSync(catalogApi, 'utf8');
console.log(apiContent);
