// Whitestep — shared header, footer, saved homes, install prompt and forms.
(function(){
  const C = window.WHITESTEP || {};
  const page = document.body.dataset.page || "";

  const MARK = `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#fff"><rect x="23" y="12" width="18" height="8" rx="2"/><rect x="15" y="23" width="34" height="8" rx="2"/><rect x="7" y="34" width="50" height="8" rx="2"/></g><rect x="1" y="45" width="62" height="8" rx="2" fill="#5FB3A1"/></svg>`;
  const I = {
    home:`<svg viewBox="0 0 24 24"><path d="M3 11h18M6 7.5h12M9 4h6M5 11v9h14v-9"/></svg>`,
    heart:`<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`,
    key:`<svg viewBox="0 0 24 24"><circle cx="8" cy="12" r="4"/><path d="M12 12h9m-3 0v3m-3-3v2"/></svg>`,
    mega:`<svg viewBox="0 0 24 24"><path d="M4 10v4h3l6 4V6L7 10H4zm13-1.5a4 4 0 0 1 0 7"/></svg>`
  };

  // ---------- Saved homes ----------
  const KEY = "whitestep-saved";
  const Saved = {
    all(){ try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e){ return []; } },
    has(id){ return this.all().includes(id); },
    toggle(id){
      const s = this.all(); const i = s.indexOf(id);
      if (i >= 0) s.splice(i,1); else s.push(id);
      try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){}
      updateBadges(); return i < 0;
    }
  };
  function updateBadges(){
    const n = Saved.all().length;
    document.querySelectorAll("[data-saved-count]").forEach(el => el.textContent = n ? n : "");
  }
  window.WhitestepSaved = Saved;

  // ---------- Header & tab bar ----------
  const cur = (p) => page === p ? ' aria-current="page"' : "";
  const nav = document.getElementById("site-nav");
  if (nav) nav.outerHTML = `
    <header class="nav">
      <div class="container">
        <a class="brand" href="index.html" aria-label="Whitestep home">${MARK}<span>Whitestep</span></a>
        <nav class="nav-links" aria-label="Main">
          <a href="index.html"${cur("home")}>Homes</a>
          <a href="index.html#saved"${cur("saved")} data-nav-saved>Saved <span class="badge" data-saved-count></span></a>
          <a href="agents.html"${cur("agents")}>For agents</a>
          <a href="advertise.html"${cur("advertise")}>Advertise</a>
        </nav>
        <button class="install" id="install-btn" type="button">Install app</button>
      </div>
    </header>
    <nav class="tabbar" aria-label="App">
      <a href="index.html"${cur("home")}>${I.home}Homes</a>
      <a href="index.html#saved"${cur("saved")} data-nav-saved>${I.heart}Saved<span class="badge" data-saved-count></span></a>
      <a href="agents.html"${cur("agents")}>${I.key}Agents</a>
      <a href="advertise.html"${cur("advertise")}>${I.mega}Advertise</a>
    </nav>`;

  // ---------- Footer ----------
  const foot = document.getElementById("site-foot");
  if (foot) foot.outerHTML = `
    <footer class="site-foot">
      <div class="container">
        <div class="about">
          <a class="brand" href="index.html">${MARK}<span>Whitestep</span></a>
          <p>Every Bermuda home for sale, in one calm place. Search by budget, save the ones you like, and contact the listing agent directly.</p>
        </div>
        <div>
          <h3>Buyers</h3>
          <ul><li><a href="index.html">Search homes</a></li><li><a href="index.html#saved">Saved homes</a></li><li><a href="privacy.html">Privacy</a></li></ul>
        </div>
        <div>
          <h3>Business</h3>
          <ul><li><a href="agents.html">List your properties</a></li><li><a href="advertise.html">Advertise on Whitestep</a></li><li><a href="mailto:${C.contactEmail}">${C.contactEmail}</a></li></ul>
        </div>
      </div>
      <div class="fineprint"><div class="container">Listing details are supplied by the listing agencies. Always confirm price and availability with the agent. Non-Bermudians can generally only buy homes above the government's Annual Rental Value threshold. © ${new Date().getFullYear()} Whitestep.</div></div>
    </footer>`;

  updateBadges();
  window.addEventListener("storage", updateBadges);

  // ---------- Install as an app ----------
  let deferred = null;
  const btn = document.getElementById("install-btn");
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; btn && btn.classList.add("show"); });
  if (btn && isIOS && !standalone) btn.classList.add("show");
  btn && btn.addEventListener("click", async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; btn.classList.remove("show"); return; }
    showTip("Add Whitestep to your home screen", "In Safari, tap the Share button, then choose “Add to Home Screen”.");
  });
  function showTip(title, text){
    let d = document.getElementById("ws-tip");
    if (!d) {
      d = document.createElement("div"); d.id = "ws-tip";
      d.style.cssText = "position:fixed;inset:auto 16px calc(90px + env(safe-area-inset-bottom)) 16px;max-width:420px;margin:0 auto;z-index:60;background:#fff;border-radius:16px;padding:18px 20px;box-shadow:0 20px 50px -20px rgba(18,52,59,.6);border:1px solid #DDE4E1";
      document.body.appendChild(d);
    }
    d.innerHTML = `<strong style="display:block;font:700 17px var(--display);margin-bottom:4px">${title}</strong><span style="color:#5A6B6E">${text}</span><div style="margin-top:12px"><button class="btn light" type="button">Got it</button></div>`;
    d.querySelector("button").onclick = () => d.remove();
  }
  window.WhitestepTip = showTip;

  // Offline support once the site is hosted on https
  if ("serviceWorker" in navigator && location.protocol === "https:" && !/claude\.ai|claudeusercontent/.test(location.hostname)) {
    try { navigator.serviceWorker.register("sw.js").catch(()=>{}); } catch(e){}
  }

  // ---------- Forms (agents & advertisers) ----------
  window.WhitestepForm = function(form, subject){
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const ok = form.querySelector(".form-ok");
      const body = Object.entries(data).map(([k,v]) => `${k}: ${v}`).join("\n");
      if (C.formEndpoint) {
        try {
          const r = await fetch(C.formEndpoint, { method:"POST", headers:{ "Accept":"application/json", "Content-Type":"application/json" }, body: JSON.stringify({ _subject: subject, ...data }) });
          if (!r.ok) throw new Error();
          ok.textContent = "Thanks. Your details were sent and we'll reply within two working days.";
          ok.classList.add("show"); form.reset(); return;
        } catch(err) {
          ok.textContent = `Your details couldn't be sent. Please email ${C.contactEmail} instead.`;
          ok.classList.add("show"); return;
        }
      }
      location.href = `mailto:${C.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      ok.textContent = `Your email app should open with your details filled in. If it doesn't, email ${C.contactEmail}.`;
      ok.classList.add("show");
    });
  };
})();
