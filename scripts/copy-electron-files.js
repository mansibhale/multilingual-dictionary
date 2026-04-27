const fs = require('fs');
const path = require('path');

const filesToCopy = [
  'db.js',
  'electron-preload.js',
  'dictionary.db'
];

const root = process.cwd();
const buildDir = path.join(root, 'build');

if (!fs.existsSync(buildDir)) {
  console.error('Build folder not found. Run `npm run build` first.');
  process.exit(1);
}

filesToCopy.forEach((file) => {
  const src = path.join(root, file);
  const dest = path.join(buildDir, file);
  if (!fs.existsSync(src)) {
    console.warn(`⚠️ ${file} not found, skipping`);
    return;
  }
  fs.copyFileSync(src, dest);
  console.log(`✅ Copied ${file} → build/${file}`);
});