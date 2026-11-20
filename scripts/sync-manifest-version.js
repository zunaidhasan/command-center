import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

const targets = [
  path.join(root, 'public', 'manifest.json'),
  path.join(root, 'dist', 'manifest.json'),
];

for (const manifestPath of targets) {
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  if (manifest.version === version) {
    console.log(`[manifest] ${path.relative(root, manifestPath)} already at ${version}`);
    continue;
  }

  manifest.version = version;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
  console.log(`[manifest] ${path.relative(root, manifestPath)} version -> ${version}`);
}
