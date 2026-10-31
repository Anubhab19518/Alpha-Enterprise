const fs = require('fs');

const catPage = 'd:/Projects/admin-dashboard/src/app/categories/page.tsx';
const prodPage = 'd:/Projects/admin-dashboard/src/app/products/page.tsx';

console.log("=================== CATEGORIES PAGE (ADMIN) ===================");
if (fs.existsSync(catPage)) {
  console.log(fs.readFileSync(catPage, 'utf8'));
} else {
  console.log("File not found:", catPage);
}

console.log("\n=================== PRODUCTS PAGE (ADMIN) ===================");
if (fs.existsSync(prodPage)) {
  console.log(fs.readFileSync(prodPage, 'utf8'));
} else {
  console.log("File not found:", prodPage);
}
