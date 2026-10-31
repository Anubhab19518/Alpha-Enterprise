const fs = require('fs');

const prodPage = 'd:/Projects/admin-dashboard/src/app/products/page.tsx';
const content = fs.readFileSync(prodPage, 'utf8');

console.log("=================== ADMIN PRODUCTS PAGE FORM DATA & SUBMIT ===================");

// Find handleSubmit
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('handleSubmit') || line.includes('createProduct') || line.includes('updateProduct') || line.includes('createProductVariant') || line.includes('offerPrice')) {
    console.log(`L${idx+1}: ${line}`);
  }
});
