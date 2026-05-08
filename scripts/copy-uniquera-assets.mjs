import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const sourceAssets = path.join(root, 'uniquera-consultation-form', 'assets');
const targetAssets = path.join(root, 'dist', 'uniquera-consultation-form', 'assets');

if (!fs.existsSync(sourceAssets)) {
  throw new Error(`Source assets folder not found: ${sourceAssets}`);
}

fs.mkdirSync(path.dirname(targetAssets), { recursive: true });
fs.cpSync(sourceAssets, targetAssets, { recursive: true, force: true });

console.log(`Copied ${path.relative(root, sourceAssets)} -> ${path.relative(root, targetAssets)}`);
