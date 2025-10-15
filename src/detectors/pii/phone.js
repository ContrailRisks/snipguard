(function(){
  const rx = /\+?[1-9]\d{7,14}\b/g;
  const det = {
    name:'phone', kind:'pii',
    test(text){ const out=[]; for (const m of text.matchAll(rx)) out.push({type:'pii', key:'phone', match:m[0], index:m.index??0, severity:'low'}); return out; },
    redact(){ return '[[REDACTED_PHONE]]'; }
  };
  window.SG_DETECTORS.register(det);
})();
