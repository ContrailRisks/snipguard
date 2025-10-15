import fs from 'fs';
import vm from 'vm';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const detectorsPath = path.resolve(__dirname, '../src/detectors.js');
const code = fs.readFileSync(detectorsPath, 'utf8');

const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const { sgDetectAll, sgSanitize } = sandbox.window.SG;

describe('API key detection', () => {
  it('detects OpenAI keys', () => {
    const t = 'here is a test sk-ABCDEFGHIJKLMNOPQRST123456';
    const r = sgDetectAll(t);
    expect(r.api.length > 0).toBeTruthy();
  });
  it('detects Stripe keys', () => {
    const t = 'sk_test_51H1234567890ABCDEFGHIJKLMNOP';
    const r = sgDetectAll(t);
    expect(r.api.some(m => m.key.includes('stripe'))).toBeTruthy();
  });
});

describe('PII detection', () => {
  it('detects email and phone', () => {
    const t = 'contact me at a@b.co or +491234567890';
    const r = sgDetectAll(t);
    expect(r.pii.length >= 2).toBeTruthy();
  });
  it('detects credit card (Luhn)', () => {
    const visa = '4111 1111 1111 1111';
    const r = sgDetectAll(visa);
    expect(r.pii.some(m => m.key === 'credit_card')).toBeTruthy();
  });
});

describe('Sanitization', () => {
  it('replaces matches with redacted tags', () => {
    const t = 'email a@b.co and key sk-ABCDEFGHIJKLMNOPQRST123456';
    const r = sgDetectAll(t);
    const s = sgSanitize(t, r);
    expect(s.includes('[[REDACTED_EMAIL]]')).toBeTruthy();
    expect(s.includes('[[REDACTED_OPENAI]]') || s.includes('[[REDACTED_HIGH_ENTROPY]]')).toBeTruthy();
  });
});
