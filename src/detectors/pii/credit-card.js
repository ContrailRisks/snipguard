(function(){
  const rx = /\b(?:\d[ -]*?){13,19}\b/g;
  const { luhnOk } = window.SG_CORE;
  const det = {
    name:'credit_card', kind:'pii',
    test(text){
      const out=[]; for (const m of text.matchAll(rx)){ const raw=m[0].replace(/\D/g,''); if (luhnOk(raw)) out.push({type:'pii', key:'credit_card', match:m[0], index:m.index??0, severity:'high'}); }
      return out;
    },
    redact(m){ const d=m.replace(/\D/g,''); return `[[REDACTED_CREDIT_CARD_${d.slice(0,6)}...${d.slice(-4)}]]`; }
  };
  window.SG_DETECTORS.register(det);
})();
