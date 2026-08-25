/* Soft passphrase gate for the GE / ERAC engagement hub.
   Client-side SHA-256 check — lightweight sharing, not strong security.
   Passphrase shared out-of-band. Styled to match the hub (GE navy + Microsoft blue). */
(function () {
  const STORAGE_KEY = 'erac-hub-unlocked';
  const PASS_HASH = 'fca58c792b58bd36a92cb8e13844e941b2331cdeb324d419004d153fe575ccef';

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  function unlocked() {
    try { return sessionStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  }
  function markUnlocked() {
    try { sessionStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      html.erac-gate-locked, html.erac-gate-locked body { overflow: hidden !important; }
      .erac-gate-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center; padding: 24px;
        background: rgba(11, 31, 58, 0.82); backdrop-filter: blur(10px);
      }
      .erac-gate-card {
        width: min(500px, 100%); border-radius: 16px; background: #ffffff; color: #1f2a37;
        box-shadow: 0 24px 60px rgba(11, 31, 58, 0.32); border: 1px solid rgba(11, 31, 58, 0.08);
        overflow: hidden; font-family: 'Segoe UI', Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .erac-gate-band { padding: 20px 24px; background: linear-gradient(135deg, #0B1F3A 0%, #13315c 100%); color: #fff; }
      .erac-gate-ge { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
      .erac-gate-ge .ring {
        width: 34px; height: 34px; border-radius: 50%; border: 2px solid #fff;
        display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; letter-spacing: .5px;
      }
      .erac-gate-ge .lbl { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #9fb4cc; font-weight: 700; }
      .erac-gate-band h2 { margin: 0; font-size: 1.15rem; font-weight: 800; }
      .erac-gate-band p { margin: 6px 0 0; opacity: .9; font-size: .9rem; }
      .erac-gate-body { padding: 22px 24px; }
      .erac-gate-body p { margin: 0 0 14px; line-height: 1.5; color: #5c6b7a; font-size: .92rem; }
      .erac-gate-input {
        width: 100%; padding: 13px 14px; border-radius: 10px; border: 1px solid #cbd5e1;
        font-size: 1rem; margin-bottom: 12px;
      }
      .erac-gate-input:focus { outline: 2px solid #0078D4; border-color: #0078D4; }
      .erac-gate-actions { display: flex; align-items: center; gap: 12px; }
      .erac-gate-button {
        border: 0; border-radius: 10px; background: #0078D4; color: #fff;
        padding: 11px 18px; font-weight: 700; cursor: pointer; font-size: .95rem;
      }
      .erac-gate-button:hover { background: #106EBE; }
      .erac-gate-error { min-height: 1.2em; color: #c50f1f; font-size: .85rem; }
      .erac-gate-note { margin-top: 12px; font-size: .78rem; color: #8a97a6; }
    `;
    document.head.appendChild(style);
  }

  function renderGate() {
    document.documentElement.classList.add('erac-gate-locked');
    installStyles();
    const overlay = document.createElement('div');
    overlay.className = 'erac-gate-overlay';
    overlay.innerHTML = `
      <div class="erac-gate-card" role="dialog" aria-modal="true" aria-labelledby="erac-gate-title">
        <div class="erac-gate-band">
          <div class="erac-gate-ge"><div class="ring">GE</div><div class="lbl">GE Verisk &middot; ERAC &nbsp;&times;&nbsp; Microsoft</div></div>
          <h2 id="erac-gate-title">ERAC Lite CRM — Engagement Hub</h2>
          <p>Enter the shared passphrase to view your recap, deck, and download package.</p>
        </div>
        <div class="erac-gate-body">
          <p>This is a soft front-end gate for customer review — lightweight sharing, not strong security.</p>
          <input class="erac-gate-input" id="erac-gate-input" type="password" autocomplete="current-password" placeholder="Enter passphrase" />
          <div class="erac-gate-actions">
            <button class="erac-gate-button" id="erac-gate-button" type="button">Open hub</button>
            <div class="erac-gate-error" id="erac-gate-error"></div>
          </div>
          <div class="erac-gate-note">Unlock persists only for this browser tab session.</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#erac-gate-input');
    const button = overlay.querySelector('#erac-gate-button');
    const error = overlay.querySelector('#erac-gate-error');

    async function attemptUnlock() {
      const value = input.value.trim();
      if (!value) { error.textContent = 'Enter the passphrase.'; return; }
      const hash = await sha256(value);
      if (hash === PASS_HASH) {
        markUnlocked();
        document.documentElement.classList.remove('erac-gate-locked');
        overlay.remove();
        return;
      }
      error.textContent = 'Passphrase did not match.';
      input.select();
    }
    button.addEventListener('click', attemptUnlock);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); attemptUnlock(); } });
    setTimeout(() => input.focus(), 40);
  }

  if (!unlocked()) {
    window.addEventListener('DOMContentLoaded', renderGate, { once: true });
  }
})();
