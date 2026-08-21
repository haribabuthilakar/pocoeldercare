const fs = require('fs');
const path = require('path');

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error('Non json specified');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path.resolve(jsonPath), 'utf8'));
for (const [relPath, content] of Object.entries(data)) {
  const fullPath = path.resolve(relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Written:', relPath);
}
