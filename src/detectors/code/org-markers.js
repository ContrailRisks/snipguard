(function(){
  const det = {
    name:'org_markers', kind:'code',
    test(text, ctx){
      const markers = (ctx && ctx.orgMarkers) || [];
      const hit = markers.find(m => m && text.includes(m));
      return hit ? [{ type:'code', key:'org_marker', match: hit, index: text.indexOf(hit), severity:'high' }] : [];
    }
  };
  window.SG_DETECTORS.register(det);
})();
