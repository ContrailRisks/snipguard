// SnipGuard detectors: API keys, PII, simple code heuristics (on-device only)
const SG_RE = {
  // Secrets
  openai: /sk-[A-Za-z0-9]{20,}/g,                 // OpenAI
  gh_pat: /github_pat_[A-Za-z0-9_]{80,}/g,        // GitHub PAT
  slack: /xo(?:xa|xb|xp)-[A-Za-z0-9-]{10,48}/g,   // Slack tokens
  stripe: /sk_(?:test|live)_[A-Za-z0-9]{20,}/g,   // Stripe secret key
  aws_akid: /AKIA[0-9A-Z]{16}/g,                  // AWS access key id
  gcp_api: /\bAIza[0-9A-Za-z\-_]{35}\b/g,      // Google API key
  twilio: /SK[0-9a-fA-F]{32}/g,                   // Twilio API key (one pattern)
  telegram_bot: /(?:(?:^|[^a-zA-Z]))\d{9,10}:[A-Za-z0-9_-]{35}/g, // Telegram bot token
  // PEM blocks
  pem: /-----BEGIN (?:RSA|EC|OPENSSH|PRIVATE) KEY-----[\s\S]+?-----END [^-]+-----/g,
  // PII
  email: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  phone: /\+?[1-9]\d{7,14}/g,
  cc: /\b(?:\d[ -]*?){13,19}\b/g
};

function sgShannonH(s){
  const freq = {}; for (const c of s) freq[c] = (freq[c]||0)+1;
  const len = s.length || 1;
  let h = 0; for (const n of Object.values(freq)) { const p = n/len; h -= p * Math.log2(p); }
  return h;
}

function sgLuhnOK(num){
  const digits = (num||"").replace(/\D/g,'');
  if (digits.length < 13) return false;
  let sum=0, dbl=false;
  for (let i=digits.length-1;i>=0;i--){
    let d = digits.charCodeAt(i)-48;
    if (dbl){ d*=2; if (d>9) d-=9; }
    sum+=d; dbl=!dbl;
  }
  return sum%10===0;
}

function sgDetectAPI(text){
  const matches = [];
  for (const [k, rx] of Object.entries(SG_RE)) {
    if (['email','phone','cc'].includes(k)) continue;
    const hits = text.match(rx);
    if (hits) matches.push({ type: 'api', key: k, sample: hits[0] });
  }
  // high-entropy catch-all
  const blobs = text.match(/[A-Za-z0-9+\/=_-]{32,}/g) || [];
  blobs.forEach(b => { if (sgShannonH(b)>3.2) matches.push({ type:'api', key:'high_entropy', sample:b.slice(0,16)+'…' }); });
  return matches;
}

function sgDetectPII(text){
  const out = [];
  (text.match(SG_RE.email)||[]).forEach(s=> out.push({type:'pii', key:'email', sample:s}));
  (text.match(SG_RE.phone)||[]).forEach(s=> out.push({type:'pii', key:'phone', sample:s}));
  (text.match(SG_RE.cc)||[]).forEach(s=> { if (sgLuhnOK(s)) out.push({type:'pii', key:'credit_card', sample:s}); });
  // IBAN basic (very rough, EU focus)
  const iban = text.match(/\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g);
  (iban||[]).forEach(s=> out.push({type:'pii', key:'iban', sample:s}));
  return out;
}

function sgDetectCode(text, orgMarkers=[]){
  const lines = text.split('\n').length;
  const codey = /(\bclass\b|\bdef\b|\bfunction\b|=>|import\s|\bpackage\.json\b|^#include|\busing\s)/m.test(text);
  const org = (orgMarkers||[]).some(m => m && text.includes(m));
  const license = /MIT License|Apache License|All rights reserved/i.test(text);
  const configFiles = /(pom\.xml|\.csproj|Cargo\.toml|requirements\.txt|package\.json)/i.test(text);
  if ((lines>=25 && codey) || org || license || configFiles) {
    return [{type:'code', key: org?'org_marker':(license?'license':(configFiles?'config':'heuristic')), sample: text.slice(0,80)}];
  }
  return [];
}

function sgDetectAll(text, orgMarkers=[]){
  const api = sgDetectAPI(text);
  const pii = sgDetectPII(text);
  const code = sgDetectCode(text, orgMarkers);
  return { hasRisk: !!(api.length||pii.length||code.length), api, pii, code };
}

function sgSanitize(text, results){
  let out = text;
  [...results.api, ...results.pii].forEach(r => {
    const val = r.sample.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    out = out.replace(new RegExp(val,'g'), `[[REDACTED_${r.key.toUpperCase()}]]`);
  });
  return out;
}

// Expose to window for content.js
window.SG = { sgDetectAll, sgSanitize };
