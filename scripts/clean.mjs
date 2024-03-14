import fs from 'fs';

fs.rmSync('dist', {
  recursive: true,
  force: true,
});

// npm pack files
const files = [
  'decorators',
  'index.d.ts',
  'index.js',
  'example.js',
  'example.d.ts',
];

for (const file of files) {
  fs.rmSync(file, {
    recursive: true,
    force: true,
  });
}
