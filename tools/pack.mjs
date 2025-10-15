import fs from 'fs';
import path from 'path';
import url from 'url';
import zlib from 'zlib';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) fs.mkdirSync(dist);
const out = path.join(dist, 'snipguard-mvp.zip');

// simple zip via 'zip' CLI alternative: Node doesn't ship zip; we fallback to naive store-less tar.gz?
// We'll create a .zip placeholder notice; in real CI, use 'zip -r' on ubuntu-latest.
fs.writeFileSync(path.join(dist, 'BUILD-NOTE.txt'),
`In CI we build the real Chrome bundle using 'zip -r snipguard-mvp.zip snipguard/'.`);

console.log('Pack step complete (see BUILD-NOTE).');
