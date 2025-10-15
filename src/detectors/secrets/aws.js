(function(){
  const rx = /AKIA[0-9A-Z]{16}/g;
  const det = {
    name:'aws_akid', kind:'api',
    test(text){ const out=[]; for (const m of text.matchAll(rx)) out.push({type:'api', key:'aws_akid', match:m[0], index:m.index??0, severity:'high'}); return out; },
    redact(){ return 'AKIA[REDACTED]'; }
  };
  window.SG_DETECTORS.register(det);
})();
