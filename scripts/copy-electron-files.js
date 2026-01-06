const fs = require('fs');
const path = require('path');

// Only copy React frontend assets if needed (example: some static assets)
const filesToCopy = [
  // 'some-frontend-asset.png',
  // 'another-frontend-file.json'
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
