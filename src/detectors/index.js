(function(){
  const { escapeForRx, shannonH } = window.SG_CORE;

  function list(){ return window.SG_DETECTORS.list; }

  function detectAll(text, cfg){
    const enabled = new Set((cfg && cfg.enabled) || list().map(d => d.name));
    (cfg && cfg.disabled || []).forEach(n => enabled.delete(n));
    const out = [];
    for (const d of list()){
      if (!enabled.has(d.name)) continue;
      out.push(...d.test(text, cfg));
    }
    // Generic high-entropy catch-all (as last resort)
    const blobs = text.match(/[A-Za-z0-9+\/=_-]{32,}/g) || [];
    for (const b of blobs){ if (shannonH(b)>3.2) out.push({type:'api', key:'high_entropy', match:b, index:text.indexOf(b), severity:'medium'}); }
    return out;
  }

  function sanitize(text, detections){
    let out = text;
    for (const det of detections){
      const d = window.SG_DETECTORS.list.find(x => x.name === det.key || x.name === det.name);
      const replacement = (d && d.redact) ? d.redact(det.match) : `[[REDACTED_${det.key.toUpperCase()}]]`;
      out = out.replace(new RegExp(escapeForRx(det.match), 'g'), replacement);
    }
    return out;
  }

  window.SG = Object.assign(window.SG || {}, { detectAll, sanitize });
})();
