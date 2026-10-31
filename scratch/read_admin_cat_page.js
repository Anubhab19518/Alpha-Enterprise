const fs = require('fs');
const catPage = 'd:/Projects/admin-dashboard/src/app/categories/page.tsx';
console.log(fs.readFileSync(catPage, 'utf8'));
