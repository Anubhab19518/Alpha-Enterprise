const { execSync } = require('child_process');

try {
  const out = execSync('npx tsc --noEmit', { cwd: 'd:/Projects/Alpha-Enterprise', encoding: 'utf8' });
  console.log("Alpha-Enterprise TypeScript Check Passed with 0 errors!");
  console.log(out);
} catch (err) {
  console.error("Alpha-Enterprise TypeScript Check Output:");
  console.error(err.stdout || err.message);
}
