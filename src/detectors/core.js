// Cheap utils: entropy, Luhn, IBAN checksum
window.SG_CORE = (() => {
  function shannonH(s){
    const f = {}; for (const c of s) f[c]=(f[c]||0)+1;
    const n = s.length||1; let h=0; for (const v of Object.values(f)){ const p=v/n; h -= p*Math.log2(p); }
    return h;
  }
  function luhnOk(num){
    const d = num.replace(/\D/g,''); if (d.length<13) return false;
    let sum=0, dbl=false; for (let i=d.length-1;i>=0;i--){ let x=d.charCodeAt(i)-48; if (dbl){ x*=2; if (x>9)x-=9; } sum+=x; dbl=!dbl; }
    return sum%10===0;
  }
  function ibanOk(iban){
    const s = iban.replace(/\s+/g,'').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
    const reord = s.slice(4)+s.slice(0,4);
    const digits = reord.replace(/[A-Z]/g, ch => (ch.charCodeAt(0)-55).toString());
    let rem = 0;
    for (let i=0; i<digits.length; i+=7) rem = parseInt(String(rem)+digits.slice(i,i+7),10)%97;
    return rem === 1;
  }
  function escapeForRx(str){ return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  return { shannonH, luhnOk, ibanOk, escapeForRx };
})();
