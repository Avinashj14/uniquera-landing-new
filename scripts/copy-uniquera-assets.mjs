import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const sourceAssets = path.join(root, 'uniquera-consultation-form', 'assets');
const targetAssets = path.join(root, 'dist', 'uniquera-consultation-form', 'assets');
const sourceShortJs = path.join(root, 'uniquera-consultation-form-short', 'assets', 'js');
const targetShortJs = path.join(root, 'dist', 'uniquera-consultation-form-short', 'assets', 'js');
const sourceApi = path.join(root, 'uniquera-consultation-form', 'public', 'api');
const targetApi = path.join(root, 'dist', 'api');

if (!fs.existsSync(sourceAssets)) {
  throw new Error(`Source assets folder not found: ${sourceAssets}`);
}
if (!fs.existsSync(sourceShortJs)) {
  throw new Error(`Source short form JS folder not found: ${sourceShortJs}`);
}
if (!fs.existsSync(sourceApi)) {
  throw new Error(`Source api folder not found: ${sourceApi}`);
}

fs.mkdirSync(path.dirname(targetAssets), { recursive: true });
fs.cpSync(sourceAssets, targetAssets, { recursive: true, force: true });
fs.mkdirSync(targetShortJs, { recursive: true });
fs.cpSync(sourceShortJs, targetShortJs, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetApi), { recursive: true });
fs.cpSync(sourceApi, targetApi, {
  recursive: true,
  force: true,
  // Never publish local secrets.
  filter: (src) => !src.endsWith(`${path.sep}.env`),
});

console.log(`Copied ${path.relative(root, sourceAssets)} -> ${path.relative(root, targetAssets)}`);
console.log(`Copied ${path.relative(root, sourceShortJs)} -> ${path.relative(root, targetShortJs)}`);
console.log(`Copied ${path.relative(root, sourceApi)} -> ${path.relative(root, targetApi)}`);
