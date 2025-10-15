import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const testsDir = path.resolve(__dirname, '../tests');

let failed = 0, passed = 0;
const green = s => `\x1b[32m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;

globalThis.describe = (name, fn) => { console.log(name); fn(); };
globalThis.it = (name, fn) => {
  try { fn(); console.log('  ' + green('✓') + ' ' + name); passed++; }
  catch (e) { console.log('  ' + red('✗') + ' ' + name); console.error(String(e)); failed++; }
};
globalThis.expect = (val) => ({
  toBe: (v) => { if (val !== v) throw new Error(`${val} !== ${v}`); },
  toMatch: (re) => { if (!re.test(val)) throw new Error(`${val} does not match ${re}`); },
  toBeTruthy: () => { if (!val) throw new Error(`${val} is not truthy`); },
  toBeFalsy: () => { if (val) throw new Error(`${val} is not falsy`); },
  toEqual: (v) => {
    const a = JSON.stringify(val); const b = JSON.stringify(v);
    if (a !== b) throw new Error(`${a} !== ${b}`);
  }
});

const files = fs.readdirSync(testsDir).filter(f => f.endsWith('.mjs'));
for (const f of files) {
  await import(path.join(testsDir, f));
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
