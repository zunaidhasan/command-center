import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const releaseDir = path.join(root, 'release');
const outputPath = path.join(releaseDir, 'extension.zip');

if (!fs.existsSync(path.join(distDir, 'manifest.json'))) {
  console.error('[pack] dist/manifest.json not found. Run "npm run build" first.');
  process.exit(1);
}

// The zip lives outside dist/ so it can never archive itself.
fs.mkdirSync(releaseDir, { recursive: true });
fs.rmSync(outputPath, { force: true });

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn('[pack] warning:', err);
  } else {
    throw err;
  }
});

await new Promise((resolve, reject) => {
  output.on('close', resolve);
  archive.on('error', reject);

  archive.pipe(output);

  // Only ship what Chrome needs; never bundle packaging artifacts.
  archive.glob('**/*', {
    cwd: distDir,
    dot: false,
    ignore: ['**/*.zip', '**/*.crx', '**/*.pem', 'update.xml'],
  });

  archive.finalize();
});

const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
const bytes = fs.statSync(outputPath).size;
console.log(
  `[pack] ${path.relative(root, outputPath)} created for v${version} (${(bytes / 1024).toFixed(1)} KB)`,
);
