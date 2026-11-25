// Whitestep — search page
(function(){
  const C = window.WHITESTEP || {};
  const Saved = window.WhitestepSaved;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const num = s => { const n = parseInt(String(s).replace(/[^0-9]/g, ""), 10); return isNaN(n) ? null : n; };
  const money = n => "$" + n.toLocaleString("en-US");
  const short = n => n >= 1e6 ? "$" + (+(n/1e6).toFixed(2)) + "M" : "$" + Math.round(n/1e3) + "K";

  const HOMES = (window.LISTINGS || []).filter(h => h.status === "available" && h.price > 0);
  const idOf = h => h.id || h.url;

  $("stat-count").textContent = HOMES.filter(h => h.type !== "fractional").length;
  $("stat-date").textContent = window.LISTINGS_UPDATED || "";

  [...new Set(HOMES.map(h => h.parish))].sort().forEach(p => {
    const o = document.createElement("option"); o.value = o.textContent = p; $("parish").appendChild(o);
  });

  const ICON = {
    house:`<svg viewBox="0 0 24 24" fill="none" stroke="#12343B" stroke-width="1.7" stroke-linecap="round"><path d="M9.5 4h5M7 7h10M4.5 10h15"/><path d="M6 10v10h12V10"/><path d="M10.5 20v-4.5h3V20"/></svg>`,
    condo:`<svg viewBox="0 0 24 24" fill="none" stroke="#12343B" stroke-width="1.7" stroke-linecap="round"><path d="M8 4h8M5.5 7h13"/><path d="M6.5 7v13h11V7"/><path d="M9.5 10.5h1M13.5 10.5h1M9.5 14h1M13.5 14h1M11 20v-2.5h2V20"/></svg>`
  };
  ICON.fractional = ICON.condo; ICON.other = ICON.house;
  const HEART = `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>`;
  const TYPE_LABEL = { house:"House", condo:"Condo", fractional:"Fractional share", other:"Property" };

  // ---------- State ----------
  const DEFAULT = { min:null, max:null, type:"all", parish:"", beds:0, sort:"pa", q:"" };
  let state = { ...DEFAULT };
  try { const s = JSON.parse(localStorage.getItem("whitestep-filters") || "null"); if (s) state = { ...state, ...s }; } catch(e){}
  const save = () => { try { localStorage.setItem("whitestep-filters", JSON.stringify(state)); } catch(e){} };
  const savedView = () => location.hash === "#saved";

  function syncUI(){
    $("min").value = state.min ? state.min.toLocaleString("en-US") : "";
    $("max").value = state.max ? state.max.toLocaleString("en-US") : "";
    document.querySelectorAll("#types button").forEach(b => b.setAttribute("aria-pressed", b.dataset.t === state.type));
    syncPresets();
    $("parish").value = state.parish; $("beds").value = state.beds; $("sort").value = state.sort; $("q").value = state.q;
  }
  function syncPresets(){
    document.querySelectorAll("#presets .chip").forEach(b =>
      b.setAttribute("aria-pressed", num(b.dataset.min) === state.min && num(b.dataset.max) === state.max));
  }

  // ---------- Cards ----------
  function homeCard(h){
    const id = idOf(h), on = Saved.has(id);
    const facts = [];
    if (h.beds != null) facts.push(h.beds === 0 ? "Studio" : `${h.beds} bed`);
    if (h.baths != null) facts.push(`${h.baths} bath`);
    facts.push(TYPE_LABEL[h.type] || "Home");
    return `<article class="card">
      <div class="card-top">
        <div class="kind">${ICON[h.type] || ICON.house}</div>
        <div class="where">${esc(h.parish)}<small>Bermuda</small></div>
        <button class="save" type="button" data-id="${esc(id)}" aria-pressed="${on}" aria-label="${on ? "Remove from saved" : "Save"} ${esc(h.name)}">${HEART}</button>
      </div>
      <div class="price">${money(h.price)}</div>
      <h3 class="name"><a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.name)}</a></h3>
      <div class="facts">${facts.map(f => `<span>${f}</span>`).join("")}</div>
      <div class="card-foot"><span class="agency">${esc(h.agency)}</span><span class="go">View listing</span></div>
    </article>`;
  }

  let sponsorIdx = 0;
  function sponsorCard(){
    const list = C.sponsors || [];
    if (!list.length) return `<aside class="sponsor" aria-label="Advertising space">
      <span class="tag">Advertise here</span>
      <h3>Reach Bermuda home buyers</h3>
      <p>Mortgage lenders, lawyers, movers, insurers and inspectors can sponsor this space.</p>
      <a class="btn light" href="advertise.html">See sponsor options</a>
    </aside>`;
    const s = list[sponsorIdx++ % list.length];
    return `<aside class="sponsor filled" aria-label="Sponsored">
      <span class="tag">Sponsored</span>
      <div class="who">${s.logo ? `<img src="${esc(s.logo)}" alt="">` : ""}<div><h3>${esc(s.name)}</h3><div class="cat">${esc(s.category || "")}</div></div></div>
      <p>${esc(s.message)}</p>
      <a class="btn sea" href="${esc(s.url)}" target="_blank" rel="noopener sponsored">${esc(s.cta || "Learn more")}</a>
    </aside>`;
  }

  // ---------- Render ----------
  function render(){
    save();
    const sv = savedView();
    document.querySelectorAll("[data-nav-saved]").forEach(a => sv ? a.setAttribute("aria-current","page") : a.removeAttribute("aria-current"));
    document.querySelectorAll('.nav-links a[href="index.html"], .tabbar a[href="index.html"]').forEach(a => sv ? a.removeAttribute("aria-current") : a.setAttribute("aria-current","page"));

    let rows;
    if (sv) {
      const ids = Saved.all();
      rows = HOMES.filter(h => ids.includes(idOf(h)));
    } else {
      const q = state.q.trim().toLowerCase();
      rows = HOMES.filter(h => {
        if (state.type === "all" ? h.type === "fractional" : (h.type !== state.type && !(state.type === "house" && h.type === "other"))) return false;
        if (state.parish && h.parish !== state.parish) return false;
        if (state.beds && !(h.beds >= state.beds)) return false;
        if (state.min != null && h.price < state.min) return false;
        if (state.max != null && h.price > state.max) return false;
        if (q && !(h.name + " " + h.parish + " " + h.agency).toLowerCase().includes(q)) return false;
        return true;
      });
    }
    if (state.sort === "pa") rows.sort((a,b) => a.price - b.price);
    else if (state.sort === "pd") rows.sort((a,b) => b.price - a.price);
    else rows.sort((a,b) => (b.beds||0) - (a.beds||0) || a.price - b.price);

    const n = rows.length;
    $("count").textContent = sv ? (n ? `${n} saved ${n === 1 ? "home" : "homes"}` : "Saved homes")
                                : (n ? `${n} ${n === 1 ? "home" : "homes"} for sale` : "No matching homes");
    const ps = rows.map(r => r.price);
    $("range").textContent = n ? (n === 1 ? short(ps[0]) : `${short(Math.min(...ps))} to ${short(Math.max(...ps))}`) : "";
    $("clear").textContent = sv ? "Back to all homes" : "Clear filters";
    $("search").style.opacity = sv ? ".55" : "";
    $("search").inert = sv;

    $("notice").innerHTML = (C.previewNotice && !sv) ? `<div class="notice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg><span>Preview: Whitestep is gathering listings directly from Bermuda agencies. Until then, homes shown here link to their public listings. Check details with the agent.</span></div>` : "";

    if (!n) {
      $("grid").innerHTML = sv
        ? `<div class="empty"><h3>No saved homes yet</h3><p>Tap the heart on any home to keep it here. Saved homes stay on this device.</p><a class="btn" href="index.html">Browse homes</a></div>`
        : `<div class="empty"><h3>No homes match these filters</h3><p>Try a higher top price, another parish, or fewer bedrooms.</p><button class="btn" type="button" id="reset2">Clear filters</button></div>`;
      const r2 = $("reset2"); if (r2) r2.onclick = clearAll;
      return;
    }
    sponsorIdx = 0;
    const every = Math.max(3, C.sponsorEvery || 9), out = [];
    rows.forEach((h, i) => {
      out.push(homeCard(h));
      if (!sv && (i + 1) % every === 0 && i !== n - 1) out.push(sponsorCard());
    });
    if (!sv && n < every) out.push(sponsorCard());
    $("grid").innerHTML = out.join("");
  }

  function clearAll(){
    if (savedView()) { history.pushState("", "", location.pathname); render(); return; }
    state = { ...DEFAULT }; syncUI(); render();
  }

  // ---------- Events ----------
  ["min","max"].forEach(id => {
    $(id).addEventListener("input", () => { state[id] = num($(id).value); syncPresets(); render(); });
    $(id).addEventListener("blur", () => { const v = num($(id).value); $(id).value = v == null ? "" : v.toLocaleString("en-US"); });
  });
  document.querySelectorAll("#presets .chip").forEach(b => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") === "true";
    state.min = on ? null : num(b.dataset.min); state.max = on ? null : num(b.dataset.max);
    syncUI(); render();
  }));
  document.querySelectorAll("#types button").forEach(b => b.addEventListener("click", () => { state.type = b.dataset.t; syncUI(); render(); }));
  $("parish").addEventListener("change", e => { state.parish = e.target.value; render(); });
  $("beds").addEventListener("change", e => { state.beds = +e.target.value; render(); });
  $("sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
  $("q").addEventListener("input", e => { state.q = e.target.value; render(); });
  $("clear").addEventListener("click", clearAll);
  $("grid").addEventListener("click", e => {
    const b = e.target.closest(".save"); if (!b) return;
    const on = Saved.toggle(b.dataset.id);
    b.setAttribute("aria-pressed", on);
    if (savedView()) render();
  });
  window.addEventListener("hashchange", () => { render(); if (savedView()) document.querySelector(".results").scrollIntoView(); });

  syncUI(); render();
  if (savedView()) document.querySelector(".results").scrollIntoView();
})();
