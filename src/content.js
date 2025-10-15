// SnipGuard content script: intercepts paste on AI/chat sites and warns user.
const SG_TARGETS = [
  /chat\.openai\.com/, /claude\.ai/, /gemini\.google\.com|bard\.google\.com/,
  /copilot\.microsoft\.com/, /perplexity\.ai/, /poe\.com/
];

function sgIsTarget(){ return SG_TARGETS.some(r => r.test(location.hostname)); }

async function sgGetPolicy(){
  const defaults = { allowlist: [], blockOn: {api:true, pii:true, code:true}, orgMarkers: [], modeByHost: {} };
  const p = await chrome.storage.sync.get(defaults);
  return Object.assign(defaults, p);
}

function sgFindActiveElement(){
  const el = document.activeElement;
  return el && (el.isContentEditable || /^(textarea|input)$/i.test(el.tagName)) ? el : null;
}

function sgInsertText(el, txt){
  if (!el) return;
  if (el.isContentEditable){
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) { el.focus(); }
    document.execCommand('insertText', false, txt);
  } else {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const before = el.value.slice(0,start), after = el.value.slice(end);
    el.value = before + txt + after;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.selectionStart = el.selectionEnd = start + txt.length;
  }
}

async function sgHandlePaste(e){
  const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
  if (!text) return;

  const policy = await sgGetPolicy();
  // allowlist
  if (policy.allowlist.some(dom => location.hostname.endsWith(dom))) return;

  // per-host mode
  const hostMode = policy.modeByHost[location.hostname] || (sgIsTarget() ? 'block' : 'warn');

  const results = window.SG.sgDetectAll(text, policy.orgMarkers);
  const hasRisk = results.hasRisk &&
    ((policy.blockOn.api && results.api.length) ||
     (policy.blockOn.pii && results.pii.length) ||
     (policy.blockOn.code && results.code.length));

  if (!hasRisk) return;

  // Intercept default paste
  e.stopPropagation(); e.preventDefault();

  const el = sgFindActiveElement();
  const summary = `Found ${results.api.length} API key(s), ${results.pii.length} PII hit(s), ${results.code.length} code indicator(s). Click title to preview sanitized output.`;
  const sanitized = window.SG.sgSanitize(text, results);

  if (hostMode === 'block' || hostMode === 'warn'){
    window.SG_UI.toast({
      summary,
      detail: sanitized,
      onProceed: () => sgInsertText(el, text),
      onSanitize: () => sgInsertText(el, sanitized)
    });
  } else {
    // ignore mode
    sgInsertText(el, text);
  }
}

document.addEventListener('paste', sgHandlePaste, true);
