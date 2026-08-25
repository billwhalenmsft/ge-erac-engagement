(function () {
  const STORAGE_KEY = "erac-lite-crm-handoff-unlocked";
  const PASS_HASH = "fca58c792b58bd36a92cb8e13844e941b2331cdeb324d419004d153fe575ccef";

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function isUnlocked() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }

  function setUnlocked() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // The page remains open for this document even if storage is unavailable.
    }
  }

  function renderGate() {
    const style = document.createElement("style");
    style.textContent = `
      html.erac-gate-locked, html.erac-gate-locked body { overflow: hidden; }
      .erac-gate-overlay {
        position: fixed; inset: 0; z-index: 99999; display: grid; place-items: center;
        padding: 24px; background: var(--cp-overlay);
      }
      .erac-gate-card {
        width: min(520px, 100%); overflow: hidden; border: 1px solid var(--cp-border);
        border-radius: 16px; background: var(--cp-surface); color: var(--cp-text);
        box-shadow: var(--cp-shadow);
        font-family: "Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .erac-gate-band { padding: 20px 22px; background: var(--cp-bg-elevated); }
      .erac-gate-band h2 { margin: 0; font-size: 1.25rem; }
      .erac-gate-band p, .erac-gate-body p { color: var(--cp-text-muted); }
      .erac-gate-body { padding: 22px; }
      .erac-gate-input {
        width: 100%; margin: 0 0 12px; padding: 12px 14px;
        border: 1px solid var(--cp-border-strong); border-radius: 0.625rem;
        background: var(--cp-surface); color: var(--cp-text); font-size: 1rem;
      }
      .erac-gate-button {
        border: 0; border-radius: 0.625rem; padding: 11px 16px;
        background: var(--cp-accent); color: var(--cp-accent-fg);
        font-weight: 700; cursor: pointer;
      }
      .erac-gate-button:hover { background: var(--cp-accent-hover); }
      .erac-gate-button:focus-visible, .erac-gate-input:focus-visible {
        outline: 3px solid var(--cp-accent); outline-offset: 3px;
      }
      .erac-gate-error { min-height: 1.4em; margin-top: 10px; color: var(--cp-danger); }
      .erac-gate-note { margin-top: 12px; color: var(--cp-text-soft); font-size: 0.82rem; }
    `;
    document.head.appendChild(style);

    document.documentElement.classList.add("erac-gate-locked");
    const overlay = document.createElement("div");
    overlay.className = "erac-gate-overlay";
    overlay.innerHTML = `
      <div class="erac-gate-card" role="dialog" aria-modal="true" aria-labelledby="erac-gate-title">
        <div class="erac-gate-band">
          <h2 id="erac-gate-title">ERAC Lite CRM resource center</h2>
          <p>Enter the passphrase shared by your Microsoft team.</p>
        </div>
        <div class="erac-gate-body">
          <p>This site includes the delivery package and guided install steps.</p>
          <label for="erac-gate-input">Passphrase</label>
          <input class="erac-gate-input" id="erac-gate-input" type="password" autocomplete="off">
          <button class="erac-gate-button" id="erac-gate-button" type="button">Open package</button>
          <div class="erac-gate-error" id="erac-gate-error" aria-live="polite"></div>
          <div class="erac-gate-note">The unlock persists only for this browser session.</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector("#erac-gate-input");
    const button = overlay.querySelector("#erac-gate-button");
    const error = overlay.querySelector("#erac-gate-error");
    async function unlock() {
      if ((await sha256(input.value.trim())) !== PASS_HASH) {
        error.textContent = "Passphrase did not match.";
        input.select();
        return;
      }
      setUnlocked();
      document.documentElement.classList.remove("erac-gate-locked");
      overlay.remove();
      document.querySelector("a[href='#main']").focus();
    }
    button.addEventListener("click", unlock);
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && document.activeElement === input) {
        event.preventDefault();
        unlock();
      }
      if (event.key !== "Tab") return;
      const first = input;
      const last = button;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    input.focus();
  }

  if (!isUnlocked()) {
    window.addEventListener("DOMContentLoaded", renderGate, { once: true });
  }
})();
