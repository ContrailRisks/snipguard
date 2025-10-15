async function load(){
  const defaults = { allowlist: [], blockOn: {api:true, pii:true, code:true}, orgMarkers: [], modeByHost: {} };
  const p = await chrome.storage.sync.get(defaults);
  document.getElementById('api').checked = p.blockOn.api;
  document.getElementById('pii').checked = p.blockOn.pii;
  document.getElementById('code').checked = p.blockOn.code;
  document.getElementById('allowlist').value = (p.allowlist||[]).join('\n');
  document.getElementById('orgMarkers').value = (p.orgMarkers||[]).join('\n');
  const hostLines = Object.entries(p.modeByHost||{}).map(([h,m])=>`${h}: ${m}`);
  document.getElementById('modeByHost').value = hostLines.join('\n');
}

async function save(){
  const blockOn = {
    api: document.getElementById('api').checked,
    pii: document.getElementById('pii').checked,
    code: document.getElementById('code').checked
  };
  const allowlist = document.getElementById('allowlist').value.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  const orgMarkers = document.getElementById('orgMarkers').value.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  const modeByHost = {};
  document.getElementById('modeByHost').value.split(/\n+/).forEach(line=>{
    const m = line.split(':').map(s=>s.trim());
    if (m[0] && m[1]) modeByHost[m[0]] = m[1];
  });
  await chrome.storage.sync.set({ blockOn, allowlist, orgMarkers, modeByHost });
  const s = document.getElementById('status'); s.textContent = 'Saved ✔'; setTimeout(()=> s.textContent='', 1200);
}

document.getElementById('save').addEventListener('click', save);
load();
