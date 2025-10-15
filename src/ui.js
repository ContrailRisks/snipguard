(function(){
  function removeToast(){ const el = document.getElementById('sg-toast'); if (el) el.remove(); }
  function toast({summary, detail, onProceed, onSanitize}){
    removeToast();
    const t = document.createElement('div'); t.id='sg-toast';
    t.innerHTML = `
      <div style="font-weight:600;margin-bottom:4px">SnipGuard blocked a risky paste</div>
      <div style="opacity:.9">${summary}</div>
      <div id="sg-mask-preview" style="display:none"></div>
      <div style="margin-top:8px">
        <button class="sg-btn sg-primary" id="sg-sanitize">Mask & paste</button>
        <button class="sg-btn sg-secondary" id="sg-proceed" title="Hold Alt to bypass next time">Paste anyway</button>
        <button class="sg-btn sg-danger" id="sg-cancel">Cancel</button>
      </div>`;
    document.documentElement.appendChild(t);

    const maskPreview = t.querySelector('#sg-mask-preview');

    t.querySelector('#sg-sanitize').onclick = () => { onSanitize && onSanitize(); removeToast(); };
    
    const proceedBtn = t.querySelector('#sg-proceed');
    let holdTimer = null, armed = false;
    proceedBtn.disabled = true;
    proceedBtn.textContent = 'Hold to confirm';
    proceedBtn.onmousedown = () => {
      proceedBtn.textContent = 'Hold...';
      holdTimer = setTimeout(() => { armed = true; proceedBtn.disabled = false; proceedBtn.textContent = 'Paste anyway'; }, 1200);
    };
    proceedBtn.onmouseup = proceedBtn.onmouseleave = () => { if (holdTimer) clearTimeout(holdTimer); if (!armed){ proceedBtn.disabled = true; proceedBtn.textContent = 'Hold to confirm'; } };
    proceedBtn.onclick = () => { if (!armed) return; onProceed && onProceed(); removeToast(); };
    
    t.querySelector('#sg-cancel').onclick = () => removeToast();

    // toggle preview on title click
    t.querySelector('div').onclick = () => {
      if (!detail) return;
      if (maskPreview.style.display === 'none'){ maskPreview.style.display='block'; maskPreview.textContent = detail; }
      else { maskPreview.style.display='none'; }
    };
  }

  window.SG_UI = { toast };
})();
