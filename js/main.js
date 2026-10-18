const $ = s => document.querySelector(s);

const THEME_KEYS = ["boy", "girl"];

function storageGet(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
function storageSet(key, val) { try { sessionStorage.setItem(key, val); } catch (e) { } }

function defaultProgress() {
  return { total: 0, best: {} };
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}
function normProgress(p) {
  const out = defaultProgress();
  if (p && typeof p === "object") {
    out.total = safeNum(p.total);
    const best = (p.best && typeof p.best === "object") ? p.best : {};
    Object.keys(MODES).forEach(m => { out.best[m] = safeNum(best[m]); });
  }
  return out;
}

const store = {

  theme: THEME_KEYS.indexOf(storageGet("vl.theme")) >= 0 ? storageGet("vl.theme") : "",
  progress: (() => {
    try {
      const p = JSON.parse(storageGet("vl.progress") || "null");
      if (p && p.boy && p.girl) return { boy: normProgress(p.boy), girl: normProgress(p.girl) };
    } catch (e) { }
    return { boy: defaultProgress(), girl: defaultProgress() };
  })(),
};
function saveStore() {
  if (THEME_KEYS.indexOf(store.theme) < 0) return;
  storageSet("vl.theme", store.theme);
  storageSet("vl.progress", JSON.stringify(store.progress));
}
const progress = () => store.progress[store.theme] || defaultProgress();

let lastPlay = null;

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  fitScreen(document.getElementById(id));
  requestAnimationFrame(() => fitScreen(document.getElementById(id)));
}

function fitScreen(sc) {
  if (!sc || !sc.classList.contains("active")) return;
  const fit = sc.querySelector(".fit");
  if (!fit) return;
  fit.style.transform = "";
  const host = sc.querySelector(".screen-body") || sc;
  const vw = host.clientWidth, vh = host.clientHeight;
  if (!vw || !vh) return;
  const r = fit.getBoundingClientRect();
  const needW = Math.max(r.width, fit.scrollWidth);
  const needH = Math.max(r.height, fit.scrollHeight);
  const s = Math.min(1, vw / needW, vh / needH);
  if (s < 0.999) fit.style.transform = "scale(" + s.toFixed(4) + ")";
}

const UI = {
  cssVar(name) { return getComputedStyle(document.body).getPropertyValue(name).trim(); },

  progressDots(n) {
    UI._dots = n;
    const el = $("#play-progress");
    if (!el) return;
    if (n > 12) {
      el.innerHTML = `<span class="prog-list" title="Chọn chữ cái nhanh" aria-label="Chọn chữ cái">≡</span>`;
    } else {
      el.innerHTML = Array.from({ length: n }, () => '<span class="dot"></span>').join("");
    }
  },
  setDot(i, cls) {
    const el = $("#play-progress");
    if (!el) return;
    if (UI._dots > 12) {
      if (cls === "done" || cls === "current") {

      }
      return;
    }
    const d = el.children[i];
    if (d) d.className = "dot " + cls;
  },

  hideProgress() {
    UI._dots = 0;
    const el = $("#play-progress");
    if (el) el.innerHTML = "";
  },
  updateStars(n) { const el = $("#play-stars"); if (el) el.textContent = n; },

  confetti(n) {
    n = n || 12;
    if (store.theme === "girl") UI.hearts(Math.max(24, n * 2));
    else UI.fireworks(Math.max(4, Math.round(n / 4)));
  },

  _fx() { return $("#fx-layer"); },

  flash() {
    const l = UI._fx();
    if (!l) return;
    const d = document.createElement("div");
    d.className = "flash";
    l.appendChild(d);
    setTimeout(() => d.remove(), 700);
  },

  hearts(n) {
    const l = UI._fx();
    if (!l) return;
    const set = ["💗", "💖", "💕", "❤️", "💝", "🩷", "🌸"];
    n = n || 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "heart-fall";
      s.textContent = set[Math.floor(Math.random() * set.length)];
      s.style.left = (2 + Math.random() * 94) + "vw";
      s.style.fontSize = (16 + Math.random() * 26).toFixed(0) + "px";
      s.style.setProperty("--sway", (Math.random() * 80 - 40).toFixed(0) + "px");
      s.style.animationDuration = (1.4 + Math.random() * 1.4).toFixed(2) + "s";
      s.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
      s.addEventListener("animationend", () => s.remove());
      l.appendChild(s);
    }
  },

  fireworks(shells) {
    const l = UI._fx();
    if (!l) return;
    shells = shells || 4;
    const w = window.innerWidth, h = window.innerHeight;
    for (let i = 0; i < shells; i++) {
      const x = w * (0.08 + Math.random() * 0.84);
      const ty = h * (0.10 + Math.random() * 0.40);
      const rk = document.createElement("span");
      rk.className = "fw-rocket";
      rk.textContent = "✨";
      rk.style.left = x.toFixed(0) + "px";
      rk.style.top = h.toFixed(0) + "px";
      rk.style.fontSize = "20px";
      rk.style.setProperty("--ty", (ty - h).toFixed(0) + "px");
      rk.style.animationDuration = (0.5 + Math.random() * 0.3).toFixed(2) + "s";
      rk.style.animationDelay = (i * 0.11 + Math.random() * 0.05).toFixed(2) + "s";
      rk.addEventListener("animationend", () => {
        rk.remove();
        UI.fireBurst(x, ty, 24 + Math.floor(Math.random() * 12));
      });
      l.appendChild(rk);
    }
  },

  fireBurst(x, y, n) {
    const l = UI._fx();
    if (!l) return;
    const set = (store.theme === "boy" ? ["✨", "⭐", "🌟", "💥", "🎇", "🎆"] : ["✨", "⭐", "🌟"]);
    n = n || 26;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "fw-spark";
      s.textContent = set[Math.floor(Math.random() * set.length)];
      s.style.left = x.toFixed(0) + "px";
      s.style.top = y.toFixed(0) + "px";
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 150;
      s.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 20).toFixed(1) + "px");
      s.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
      s.style.fontSize = (16 + Math.random() * 20).toFixed(0) + "px";
      s.style.animationDelay = (Math.random() * 0.05).toFixed(2) + "s";
      s.addEventListener("animationend", () => s.remove());
      l.appendChild(s);
    }
  },

  burst(x, y, n) {
    const l = UI._fx();
    if (!l) return;
    const em = (THEMES[store.theme] || THEMES.boy).confetti;
    n = n || 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "burst-p";
      s.textContent = em[Math.floor(Math.random() * em.length)];
      s.style.left = x + "px";
      s.style.top = y + "px";
      const ang = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 160;
      s.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(1) + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 30).toFixed(1) + "px");
      s.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
      s.style.fontSize = (18 + Math.random() * 22).toFixed(0) + "px";
      s.style.animationDelay = (Math.random() * 0.08).toFixed(2) + "s";
      s.addEventListener("animationend", () => s.remove());
      l.appendChild(s);
    }
  },

  praise(emoji) {
    const l = UI._fx();
    if (!l) return;
    const set = ["👍", "💯"];
    const el = document.createElement("div");
    el.className = "praise";
    el.textContent = emoji || set[Math.floor(Math.random() * set.length)];
    l.appendChild(el);
    el.addEventListener("animationend", () => el.remove());
  },

  flyStar(fromEl) {
    const l = UI._fx();
    const target = $(".play-stars");
    if (!l) return;
    if (!fromEl || !target) { UI.bumpStars(); return; }
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const s = document.createElement("div");
    s.className = "star-fly";
    s.textContent = "⭐";
    s.style.left = (a.left + a.width / 2) + "px";
    s.style.top = (a.top + a.height / 2) + "px";
    l.appendChild(s);
    requestAnimationFrame(() => {
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
      const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
      s.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(.5)`;
      s.style.opacity = "0.3";
    });
    setTimeout(() => { s.remove(); UI.bumpStars(); }, 620);
  },

  bumpStars() {
    const el = $(".play-stars");
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  },

  celebrate(el, opts) {
    const o = opts || {};
    const big = o.big !== false;
    UI.flash();
    if (store.theme === "girl") UI.hearts(big ? 40 : 20);
    else UI.fireworks(big ? 6 : 3);

    if (el) {
      const r = el.getBoundingClientRect();
      UI.burst(r.left + r.width / 2, r.top + r.height / 2, big ? 16 : 8);
    }
    UI.flyStar(el);
    if (o.praise !== false) UI.praise(o.emoji);
  },
};

function buildDecor() {
  const th = THEMES[store.theme];
  const el = $("#decor");
  if (!th || !el) return;
  el.innerHTML = "";

  const vw = window.innerWidth, vh = window.innerHeight;
  const narrow = vw <= 900 || vh <= 620;

  const nLeft = th.decor.filter(d => d.side === "left").length;
  const nRight = th.decor.filter(d => d.side === "right").length;
  let iLeft = 0, iRight = 0;

  th.decor.forEach((d, i) => {
    const s = document.createElement("span");
    s.className = "deco " + d.side;
    s.textContent = d.e;
    s.style.animationDuration = (6 + (i % 4) * 1.3) + "s";
    s.style.animationDelay = (-i * 1.1) + "s";

    if (narrow) {

      const isLeft = d.side === "left";
      const idx = isLeft ? iLeft++ : iRight++;
      const n = isLeft ? nLeft : nRight;
      const size = Math.round(Math.max(20, Math.min(d.size * 0.32, 30)));
      const pad = size / 2 + 6;
      const step = (vw - pad * 2) / Math.max(1, n);
      const cx = pad + step * (idx + 0.5);

      const drift = 28;
      const y = isLeft
        ? 6 + (idx % 2) * 8
        : Math.max(4, vh - size - drift - 6 - (idx % 2) * 8);

      s.style.left = Math.round(cx - size / 2) + "px";
      s.style.top = Math.round(y) + "px";
      s.style.fontSize = size + "px";
    } else {

      const gutter = Math.max(0, (vw - Math.min(900, vw)) / 2);
      const size = Math.round(Math.min(d.size, Math.max(38, gutter * 0.95)));
      const maxX = Math.max(2, gutter - size - 6);
      const x = Math.round(maxX * d.x);

      if (d.side === "left") s.style.left = x + "px";
      else s.style.right = x + "px";
      s.style.top = d.y + "%";
      s.style.fontSize = size + "px";
    }

    el.appendChild(s);
  });
}

function applyTheme(theme) {

  store.theme = THEME_KEYS.indexOf(theme) >= 0 ? theme : "boy";
  saveStore();
  document.body.className = "theme-" + store.theme;
  const th = THEMES[store.theme] || THEMES.boy;

  buildDecor();

  const av = $("#menu-avatar");
  if (av && th) av.textContent = th.avatar;
}

function buildMenu() {
  const p = progress();
  const ts = $("#total-stars");
  if (ts) ts.textContent = p.total;

  Object.keys(MODES).forEach(m => {
    const best = p.best[m] || 0;
    const el = $("#best-" + m);
    if (el) el.textContent = best ? `⭐ ${best}` : "";
  });
}

function startMode(mode) {
  lastPlay = { mode };
  show("screen-play");
  Game.start(mode, endRound);
}

function endRound(s) {
  const mode = lastPlay.mode;
  const p = progress();
  p.total += s.stars;
  p.best[mode] = Math.max(p.best[mode] || 0, s.stars);
  saveStore();

  const maxStars = s.total || 1;
  const ratio = s.stars / maxStars;

  const free = mode === "write" || mode === "beauty";
  const emoji = free ? "🎉" : ratio >= 0.9 ? "🏆" : ratio >= 0.55 ? "🎉" : "💪";
  const title = free ? "Giỏi quá!" : ratio >= 0.9 ? "Giỏi quá!" : ratio >= 0.55 ? "Giỏi lắm!" : "Cố lên nhé!";

  $("#summary-emoji").textContent = emoji;
  $("#summary-title").textContent = title;
  $("#summary-stars").innerHTML = free
    ? `<div class="big-stars">✍️ ✨ ✍️</div>
       <div class="star-count">Đã luyện ${s.total} chữ cái</div>`
    : `<div class="big-stars">${"⭐".repeat(Math.min(s.stars, 12))}${s.stars > 12 ? "…" : ""}</div>
       <div class="star-count">${s.stars} ngôi sao</div>`;
  $("#summary-text").innerHTML = mode === "learn"
    ? `Bé đã học hết <b>${MODES.learn.name}</b> · ${s.total} chữ cái 💛`
    : free
      ? `Bé đã luyện <b>${MODES[mode].name}</b> · ${s.total} chữ cái ✍️`
      : `Bé đã chơi <b>${MODES[mode].name}</b> · ${s.correct} câu đúng 💛`;

  show("screen-summary");
  Sfx.win();
  UI.confetti(24);
}

function init() {

  document.querySelectorAll(".choose-card").forEach(card => {
    card.onclick = () => {
      Sfx.warm();
      Sfx.click();
      applyTheme(card.dataset.theme);
      buildMenu();
      show("screen-menu");
    };
  });

  document.querySelectorAll(".mode-card").forEach(card => {
    card.onclick = () => {
      Sfx.warm();
      Sfx.click();
      startMode(card.dataset.mode);
    };
  });

  $("#btn-switch").onclick = () => { Sfx.click(); show("screen-choose"); };

  $("#menu-avatar").onclick = () => {
    Sfx.click();
    applyTheme(store.theme === "girl" ? "boy" : "girl");
    buildMenu();
  };
  $("#btn-back").onclick = () => { Sfx.click(); Game.cancel(); buildMenu(); show("screen-menu"); };
  $("#btn-menu").onclick = () => { Sfx.click(); buildMenu(); show("screen-menu"); };
  $("#btn-replay").onclick = () => { Sfx.click(); if (lastPlay) startMode(lastPlay.mode); };

  const pp = $("#play-progress");
  const lp = $("#letter-picker");
  const lg = $("#letter-grid");
  const curIdx = () => (Game.currentIdx ? Game.currentIdx() : -1);
  function closeLetterPicker() { if (lp) lp.classList.remove("open"); }
  if (pp) pp.addEventListener("click", () => {
    if (UI._dots <= 12) return;
    if (!lp || !lg) return;
    Sfx.click();
    const active = curIdx();
    lg.innerHTML = LETTERS.map((l, i) =>
      `<button class="popup-chip${i === active ? " active" : ""}" data-idx="${i}">${l}</button>`).join("");
    lp.classList.add("open");
  });
  if ($("#letter-picker-backdrop")) $("#letter-picker-backdrop").addEventListener("click", closeLetterPicker);
  if ($("#popup-close")) $("#popup-close").addEventListener("click", () => { Sfx.click(); closeLetterPicker(); });
  if (lg) lg.addEventListener("click", e => {
    const btn = e.target.closest(".popup-chip");
    if (!btn) return;
    Sfx.click();
    Game.jumpTo(parseInt(btn.dataset.idx, 10));
    closeLetterPicker();
  });

  const donate = $("#donate-popup");
  const closeDonate = () => { if (donate) donate.classList.remove("open"); };
  document.querySelectorAll(".donate-btn").forEach(b => b.addEventListener("click", () => {
    Sfx.click();
    if (donate) donate.classList.add("open");
  }));
  if ($("#donate-backdrop")) $("#donate-backdrop").addEventListener("click", closeDonate);
  if ($("#donate-close")) $("#donate-close").addEventListener("click", () => { Sfx.click(); closeDonate(); });

  const copyBtn = $("#donate-copy");
  if (copyBtn) copyBtn.addEventListener("click", async () => {
    const numEl = $("#donate-stk-num");
    const stk = (numEl ? numEl.textContent : "").trim();
    Sfx.click();
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(stk);
        ok = true;
      }
    } catch (e) { ok = false; }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = stk;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, stk.length);
        ok = document.execCommand("copy");
        ta.remove();
      } catch (e) { ok = false; }
    }
    copyBtn.textContent = ok ? "✅ Đã copy STK" : "❌ Không copy được";
    copyBtn.disabled = true;
    setTimeout(() => { copyBtn.textContent = "📋 Copy STK"; copyBtn.disabled = false; }, 1600);
  });

  document.addEventListener("pointerdown", () => Sfx.warm(), { once: true });

  const ro = new ResizeObserver(entries => {
    for (const e of entries) {
      const sc = e.target.closest(".screen");
      if (sc && sc.classList.contains("active")) fitScreen(sc);
    }
  });
  document.querySelectorAll(".screen .fit").forEach(f => ro.observe(f));

  let rzT;
  const refit = delay => {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      if (store.theme) buildDecor();
      fitScreen(document.querySelector(".screen.active"));
    }, delay);
  };
  window.addEventListener("resize", () => refit(160));
  window.addEventListener("orientationchange", () => refit(260));

  if (store.theme) {
    applyTheme(store.theme);
    buildMenu();
    show("screen-menu");
  } else {
    document.body.className = "theme-boy";
    show("screen-choose");
  }
}

document.addEventListener("DOMContentLoaded", init);
