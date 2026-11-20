import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
const version = pkg.version;

const repoOwner = 'zunaidhasan';
const repoName = 'command-center';
const zipUrl = `https://github.com/${repoOwner}/${repoName}/releases/download/v${version}/extension.zip`;

// Chrome only accepts the real 32-character extension ID here (a-p), not a name.
// Set it in the environment before building: EXTENSION_ID=<your-extension-id>
const extensionId = process.env.EXTENSION_ID || process.argv.find((a) => a.startsWith('--appid='))?.split('=')[1];

if (!extensionId) {
  console.warn(
    '[update-xml] Skipped: set EXTENSION_ID=<32-char chrome extension id> to generate dist/update.xml.',
  );
  process.exit(0);
}

if (!/^[a-p]{32}$/.test(extensionId)) {
  console.error(`[update-xml] "${extensionId}" is not a valid Chrome extension ID (32 characters, a-p).`);
  process.exit(1);
}

const updateXml = `<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response" protocol="2.0">
  <app appid="${extensionId}">
    <updatecheck codebase="${zipUrl}" version="${version}" />
  </app>
</gupdate>
`;

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'update.xml'), updateXml, 'utf-8');
console.log(`[update-xml] dist/update.xml generated for ${extensionId} v${version}`);
