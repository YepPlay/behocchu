const Game = (() => {
  const PAIR_COLORS = ["#ef4444", "#2563eb", "#16a34a", "#d97706", "#9333ea"];
  const TRACE_W = 560, TRACE_H = 380;

  let state = null;
  let onEnd = null;
  let abort = null;
  let ticker = null;

  function clearTicker() { if (ticker) { clearTimeout(ticker); ticker = null; } }

  const area = () => document.getElementById("play-area");
  const D = l => LETTER_MAP[l];
  const rnd = n => Math.floor(Math.random() * n);
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rnd(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randomGroup() {
    let key = "";
    for (let i = 0; i < 5; i++) {
      const g = shuffle(LETTERS).slice(0, 4);
      key = g.slice().sort().join("");
      if (!state || state.lastGroup !== key) {
        if (state) state.lastGroup = key;
        return g;
      }
    }
    return shuffle(LETTERS).slice(0, 4);
  }
  function buildOptions(correct, n = 4) {
    const base = baseText(correct);
    const others = state.pool.filter(l => l !== correct);

    const far = shuffle(others.filter(l => baseText(l) !== base));
    const near = shuffle(others.filter(l => baseText(l) === base));
    const picked = far.concat(near).slice(0, n - 1);
    return shuffle([correct, ...picked]);
  }

  function pickWords(letters, avoidDupEmoji, avoidFor) {
    const used = new Set();
    const map = {};
    letters.forEach(l => {
      let list = wordsOf(l);
      const avoid = avoidFor ? avoidFor(l) : null;
      if (avoid && avoid.length) {
        const filtered = list.filter(w => !wordHasAny(w.w, avoid));
        if (filtered.length) list = filtered;
      }
      let w = list[rnd(list.length)];
      if (avoidDupEmoji) {
        let tries = 0;
        while (used.has(w.e) && tries++ < 8) w = list[rnd(list.length)];
        if (used.has(w.e)) {
          const alt = list.find(x => !used.has(x.e));
          if (alt) w = alt;
        }
      }
      used.add(w.e);
      map[l] = w;
    });
    return map;
  }
  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function start(mode, cb) {
    cleanup();
    onEnd = cb;

    const endless = mode === "match";
    const pool = LETTERS;
    const rounds = endless ? Infinity : pool.length;
    state = {
      mode, pool, endless, idx: 0, stars: 0, streak: 0, correct: 0,
      rounds, total: endless ? 0 : rounds, phase: "study",
    };
    Voice.preload(pool);
    if (endless) UI.hideProgress();
    else UI.progressDots(rounds);
    UI.updateStars(0);
    next();
  }

  function cleanup() {
    clearTicker();
    if (abort) { abort.abort(); abort = null; }
    Voice.stop();
  }

  function cancel() {
    cleanup();
    state = null;
  }

  function end() {
    cleanup();
    const s = state;
    state = null;
    if (onEnd) onEnd(s);
  }

  function next() {
    if (!state) return;
    clearTicker();
    if (state.idx >= state.rounds) { end(); return; }
    UI.updateStars(state.stars);
    UI.setDot(state.idx, "current");
    const render = { learn: renderLearn, pic: renderPic, listen: renderListen, match: renderMatch, write: renderWrite, beauty: renderBeauty };
    render[state.mode]();
  }

  function awardStar(firstTry) {
    if (!firstTry) { state.streak = 0; return; }
    state.streak++;
    state.stars++;
    if (state.streak % 3 === 0) {
      state.stars++;
      UI.praise("🔥");
      UI.confetti(16);
      Sfx.cheer();
    }
  }

  function advance(delay) {
    const s = state;
    if (!s) return;
    UI.setDot(s.idx, "done");
    s.idx++;
    UI.updateStars(s.stars);
    if (s.idx >= s.rounds) {
      setTimeout(() => { if (state) end(); }, (delay || 700) + 500);
    } else {
      setTimeout(() => { if (state) next(); }, delay || 900);
    }
  }

  function renderLearn() {
    const letter = state.pool[state.idx];
    const L = D(letter);
    const phase = state.phase || "study";

    if (phase === "study") {
      const words = shuffle(wordsOf(letter));
      area().innerHTML = `
        <div class="q-center">
          <button class="learn-card" id="learn-card">
            <span class="big-letter">${L.letter}</span>
          </button>
          <p class="learn-hint">Ấn vào chữ để nghe nhé!</p>
        </div>
        <div class="word-chips">
          ${words.map(w => `
            <button class="word-chip" data-k="${w.k}">
              <span class="opt-emoji">${w.e}</span><b>${w.w}</b>
            </button>`).join("")}
        </div>
        <div class="learn-btns">
          <button class="btn big" id="btn-learn-next">Tiếp ➡️</button>
        </div>`;

      const card = area().querySelector("#learn-card");
      card.onclick = () => {
        Sfx.pop();
        Voice.sayLetter(letter);
        card.classList.remove("playing");
        void card.offsetWidth;
        card.classList.add("playing");
      };
      area().querySelectorAll(".word-chip").forEach(chip => {
        chip.onclick = () => { Sfx.pop(); Voice.sayWord(letter, +chip.dataset.k); };
      });
      area().querySelector("#btn-learn-next").onclick = () => {
        Sfx.click();
        state.phase = "quiz";
        renderLearn();
      };
      return;
    }

    const opts = buildOptions(letter);
    area().innerHTML = `
      <div class="q-center">
        <button class="listen-btn sm" id="btn-hear">🔊</button>
        <p class="q-ask">Chọn chữ vừa học</p>
      </div>
      <div class="opt-grid">
        ${opts.map(o => `
          <button class="opt-btn letter-opt" data-l="${o}">
            <span class="big-letter sm">${o}</span>
          </button>`).join("")}
      </div>`;

    const hear = () => { Sfx.pop(); Voice.sayLetter(letter); };
    area().querySelector("#btn-hear").onclick = hear;
    setTimeout(hear, 350);

    let first = true, locked = false;
    area().querySelectorAll(".opt-btn").forEach(btn => {
      btn.onclick = () => {
        if (locked) return;
        if (btn.dataset.l === letter) {
          locked = true;
          awardStar(first);
          state.correct++;
          Sfx.correct();
          btn.classList.add("good");
          UI.celebrate(btn);
          Voice.sayPair(letter);
          state.phase = "study";
          advance(1300);
        } else {
          first = false;
          state.streak = 0;
          Sfx.wrong();
          btn.classList.add("bad");
          btn.disabled = true;
        }
      };
    });
  }

  function renderPic() {
    const letter = state.pool[state.idx];
    const L = D(letter);
    const opts = buildOptions(letter);

    const wmap = pickWords(opts, true, l => (l === letter ? [] : [letter]));

    area().innerHTML = `
      <div class="q-center">
        <div class="letter-card"><div class="big-letter">${L.letter}</div></div>
        <p class="q-ask">Chọn hình có chữ <b>${L.letter}</b></p>
      </div>
      <div class="opt-grid">
        ${opts.map(o => `
          <button class="opt-btn" data-l="${o}">
            <span class="opt-emoji">${wmap[o].e}</span>
            <span class="opt-word">${wmap[o].w}</span>
          </button>`).join("")}
      </div>`;

    let first = true, locked = false;
    area().querySelectorAll(".opt-btn").forEach(btn => {
      btn.onclick = () => {
        if (locked) return;

        const ok = btn.dataset.l === letter || wordHasLetter(wmap[btn.dataset.l].w, letter);
        if (ok) {
          locked = true;
          awardStar(first);
          state.correct++;
          Sfx.correct();
          btn.classList.add("good");
          UI.celebrate(btn);
          Voice.sayPair(letter, wmap[letter]);
          advance(1200);
        } else {
          first = false;
          state.streak = 0;
          Sfx.wrong();
          btn.classList.add("bad");
          btn.disabled = true;
        }
      };
    });
  }

  function renderListen() {
    const letter = state.pool[state.idx];
    const opts = buildOptions(letter);

    area().innerHTML = `
      <div class="q-center">
        <button class="listen-btn" id="btn-hear">🔊</button>
        <p class="q-ask">Chọn chữ vừa nghe</p>
      </div>
      <div class="opt-grid">
        ${opts.map(o => `
          <button class="opt-btn letter-opt" data-l="${o}">
            <span class="big-letter sm">${o}</span>
          </button>`).join("")}
      </div>`;

    const START_DELAY = 2000;
    const REPEAT_MS = 5000;
    const READS_MAX = 5;
    let locked = false, first = true, reads = 0;

    const hear = () => { Sfx.pop(); Voice.sayLetter(letter); };
    const schedule = ms => { clearTicker(); ticker = setTimeout(tick, ms); };
    function tick() {
      if (locked || !state) return;
      reads++;
      if (reads <= READS_MAX) { hear(); schedule(REPEAT_MS); }
      else { Voice.sayPhrase("still"); }
    }
    schedule(START_DELAY);

    area().querySelector("#btn-hear").onclick = () => {
      if (locked) return;
      hear();
      schedule(REPEAT_MS);
    };

    area().querySelectorAll(".opt-btn").forEach(btn => {
      btn.onclick = () => {
        if (locked) return;
        const ok = btn.dataset.l === letter;
        if (ok) {
          locked = true;
          clearTicker();
          awardStar(first);
          state.correct++;
          Sfx.correct();
          btn.classList.add("good");
          UI.celebrate(btn);

          setTimeout(() => { if (state) Voice.sayLetter(letter); }, 700);
          advance(1300);
        } else {
          first = false;
          state.streak = 0;
          Sfx.wrong();
          btn.classList.add("bad");
          btn.disabled = true;
        }
      };
    });
  }

  function renderMatch() {
    const picks = randomGroup();
    const pics = shuffle(picks);
    const letters = shuffle(picks);

    const wmap = pickWords(picks, true, l => picks.filter(x => x !== l));
    const done = new Set();
    let selected = null, moved = false;

    area().innerHTML = `
      <p class="q-ask center">Nối hình với chữ</p>
      <div class="match-board" id="mboard">
        <div class="match-col" id="col-pics">
          ${pics.map(p => `
            <div class="m-pic" data-l="${p}">
              <span class="m-emoji">${wmap[p].e}</span>
              <span class="m-word">${wmap[p].w}</span>
            </div>`).join("")}
        </div>
        <svg class="match-lines" id="mlines"></svg>
        <div class="match-col" id="col-letters">
          ${letters.map(p => `
            <div class="m-letter" data-l="${p}">
              <span class="big-letter sm">${p}</span>
            </div>`).join("")}
        </div>
      </div>`;

    const board = area().querySelector("#mboard");
    abort = new AbortController();
    const A = { signal: abort.signal };

    function clearSel() {
      if (selected) selected.classList.remove("sel");
      selected = null;
    }

    function drawLine(pic, lc, color) {
      const svg = area().querySelector("#mlines");
      const br = board.getBoundingClientRect();

      const k = board.offsetWidth ? br.width / board.offsetWidth : 1;
      const ra = pic.getBoundingClientRect();
      const rb = lc.getBoundingClientRect();
      const X = v => (v - br.left) / k;
      const Y = v => (v - br.top) / k;
      const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
      ln.setAttribute("x1", X(ra.right));
      ln.setAttribute("y1", Y(ra.top + ra.height / 2));
      ln.setAttribute("x2", X(rb.left));
      ln.setAttribute("y2", Y(rb.top + rb.height / 2));
      ln.setAttribute("stroke", color);
      ln.setAttribute("stroke-width", "6");
      ln.setAttribute("stroke-linecap", "round");
      ln.setAttribute("class", "match-line");
      svg.appendChild(ln);
    }

    function tryMatch(pic, lc) {
      const a = pic.dataset.l, b = lc.dataset.l;
      if (done.has(a)) return;
      if (a === b) {
        done.add(a);
        const color = PAIR_COLORS[done.size - 1];
        pic.classList.add("matched");
        lc.classList.add("matched");
        pic.style.setProperty("--pair", color);
        lc.style.setProperty("--pair", color);
        drawLine(pic, lc, color);
        state.correct++;
        if (pic.dataset.retried !== "1") state.stars++;
        Sfx.correct();
        Voice.sayPair(a, wmap[a]);
        clearSel();
        UI.celebrate(pic, { praise: false, big: false });
        UI.updateStars(state.stars);
        if (done.size === picks.length) {
          state.idx++;
          Sfx.win();
          UI.praise("🎉");
          UI.confetti(30);

          setTimeout(() => { if (state) next(); }, 1600);
        }
      } else {
        pic.dataset.retried = "1";
        Sfx.wrong();
        lc.classList.add("shake");
        pic.classList.add("shake");
        setTimeout(() => { lc.classList.remove("shake"); pic.classList.remove("shake"); }, 480);
        if (selected === pic) clearSel();
      }
    }

    area().querySelectorAll(".m-pic").forEach(pic => {
      pic.addEventListener("pointerdown", e => {
        if (done.has(pic.dataset.l)) return;
        e.preventDefault();
        Sfx.pop();
        moved = false;
        pic.classList.add("lift");
        const ghost = document.createElement("div");
        ghost.className = "ghost";
        ghost.textContent = wmap[pic.dataset.l].e;
        document.body.appendChild(ghost);
        ghost.style.left = e.clientX + "px";
        ghost.style.top = e.clientY + "px";

        const move = ev => {
          moved = true;
          ghost.style.left = ev.clientX + "px";
          ghost.style.top = ev.clientY + "px";
        };
        const up = ev => {
          window.removeEventListener("pointermove", move);
          ghost.remove();
          pic.classList.remove("lift");
          const el = document.elementFromPoint(ev.clientX, ev.clientY);
          const lc = el && el.closest ? el.closest(".m-letter") : null;
          if (lc) tryMatch(pic, lc);
          else if (!moved) {
            if (selected === pic) clearSel();
            else { clearSel(); selected = pic; pic.classList.add("sel"); }
          }
          moved = false;
        };
        window.addEventListener("pointermove", move, A);
        window.addEventListener("pointerup", up, { signal: abort.signal });
      }, A);
    });

    area().querySelectorAll(".m-letter").forEach(lc => {
      lc.addEventListener("click", () => {
        if (selected) tryMatch(selected, lc);
      }, A);
    });
  }

  function renderWrite() {

    if (!state.traceCase) { renderCasePick(); return; }

    const letter = state.pool[state.idx];
    const word = randWord(letter);
    const g = state.traceCase === "lower" ? letter.toLowerCase() : letter;

    area().innerHTML = `
      <div class="trace-title">
        <span class="trace-big${state.traceCase === "lower" ? " lower" : ""}">${g}</span>
        <span class="trace-word">${word.e} ${word.w}</span>
      </div>
      <div class="trace-wrap">
        <canvas id="tcanvas" width="${TRACE_W}" height="${TRACE_H}"></canvas>
      </div>
      <div class="trace-btns">
        <button class="btn" id="btn-say">🔊 Nghe</button>
        <button class="btn" id="btn-model">👁️ Ẩn mẫu</button>
        <button class="btn" id="btn-clear">🧽 Xoá</button>
        <button class="btn" id="btn-prev">⬅️ Quay Lại</button>
        <button class="btn" id="btn-next">Tiếp ➡️</button>
      </div>`;

    setupFreeWrite(letter, word, g, {});
  }

  function renderCasePick(fontClass) {
    const fc = fontClass || "";
    const demo = state.pool[0];
    area().innerHTML = `
      <div class="case-pick">
        <button class="case-pick-btn" data-case="upper">
          <span class="case-pick-glyph ${fc}">${demo}</span>
          <span class="case-pick-label">Chữ hoa</span>
        </button>
        <button class="case-pick-btn" data-case="lower">
          <span class="case-pick-glyph ${fc}">${demo.toLowerCase()}</span>
          <span class="case-pick-label">Chữ thường</span>
        </button>
      </div>`;
    area().querySelectorAll(".case-pick-btn").forEach(b => {
      b.onclick = () => {
        Sfx.click();
        state.traceCase = b.dataset.case;
        next();
      };
    });
  }

  function setupFreeWrite(letter, word, g, opts) {
    opts = opts || {};
    const isLower = g !== g.toUpperCase();
    const fontStack = opts.font || (isLower
      ? '"Playwrite VN","Trebuchet MS","Comic Sans MS",Arial,sans-serif'
      : '"Trebuchet MS","Comic Sans MS",Arial,sans-serif');
    const fw = opts.weight != null ? opts.weight : (isLower ? 400 : 900);

    const cv = area().querySelector("#tcanvas");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const cx = TRACE_W / 2, cy = TRACE_H / 2;
    const PEN = 14;

    const mk = () => {
      const c = document.createElement("canvas");
      c.width = TRACE_W; c.height = TRACE_H;
      return c;
    };
    const gridL = mk(), modelL = mk(), inkL = mk();
    const gctx = gridL.getContext("2d"), mctx = modelL.getContext("2d"), ictx = inkL.getContext("2d");

    let showModel = true, drawing = false, path = null;

    function composite() {
      ctx.clearRect(0, 0, TRACE_W, TRACE_H);
      ctx.drawImage(gridL, 0, 0);
      if (showModel) ctx.drawImage(modelL, 0, 0);
      ctx.drawImage(inkL, 0, 0);
    }

    function paint() {
      ctx.font = `${fw} 200px ${fontStack}`;
      const mm = ctx.measureText(g);
      const h0 = (mm.actualBoundingBoxAscent || 150) + (mm.actualBoundingBoxDescent || 40);
      const w0 = mm.width || 1;
      const fs = Math.max(40, Math.floor(200 * Math.min((TRACE_H * 0.52) / h0, (TRACE_W * 0.8) / w0)));
      const font = `${fw} ${fs}px ${fontStack}`;

      ctx.font = gctx.font = mctx.font = ictx.font = font;
      ctx.textAlign = gctx.textAlign = mctx.textAlign = ictx.textAlign = "center";
      ctx.textBaseline = gctx.textBaseline = mctx.textBaseline = ictx.textBaseline = "alphabetic";

      const m2 = mctx.measureText(g);
      const asc = m2.actualBoundingBoxAscent || fs * 0.75;
      const desc = m2.actualBoundingBoxDescent || 0;
      const ty = cy + (asc - desc) / 2;

      const S = 40;
      gctx.clearRect(0, 0, TRACE_W, TRACE_H);
      gctx.strokeStyle = "rgba(188,220,245,0.75)";
      gctx.lineWidth = 1;
      gctx.beginPath();
      for (let k = -Math.ceil(cx / S) - 1; k <= Math.ceil((TRACE_W - cx) / S) + 1; k++) {
        const x = Math.round(cx + k * S) + 0.5;
        gctx.moveTo(x, 0); gctx.lineTo(x, TRACE_H);
      }
      for (let k = -Math.ceil(ty / S) - 1; k <= Math.ceil((TRACE_H - ty) / S) + 1; k++) {
        const y = Math.round(ty + k * S) + 0.5;
        gctx.moveTo(0, y); gctx.lineTo(TRACE_W, y);
      }
      gctx.stroke();

      mctx.clearRect(0, 0, TRACE_W, TRACE_H);
      mctx.fillStyle = cssVar("--guide");
      mctx.fillText(g, cx, ty);
      mctx.lineWidth = 3;
      mctx.strokeStyle = cssVar("--guide-line");
      mctx.setLineDash([7, 9]);
      mctx.strokeText(g, cx, ty);
      mctx.setLineDash([]);

      ictx.lineCap = ictx.lineJoin = "round";
      ictx.lineWidth = PEN;
      ictx.strokeStyle = cssVar("--ink-stroke");

      composite();
    }

    const at = e => {
      const r = cv.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * TRACE_W / r.width,
        y: (e.clientY - r.top) * TRACE_H / r.height,
      };
    };

    const ready = (document.fonts && document.fonts.load)
      ? document.fonts.load(`${fw} 200px ${fontStack}`, g).catch(() => {})
      : Promise.resolve();
    ready.then(() => { if (cv.isConnected) paint(); });

    abort = new AbortController();
    const A = { signal: abort.signal };
    cv.addEventListener("pointerdown", e => {
      const p = at(e);
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      drawing = true; path = p;
      ictx.fillStyle = ictx.strokeStyle;
      ictx.beginPath();
      ictx.arc(p.x, p.y, PEN / 2, 0, Math.PI * 2);
      ictx.fill();
      composite();
    }, A);
    cv.addEventListener("pointermove", e => {
      if (!drawing) return;
      const p = at(e);
      ictx.beginPath();
      ictx.moveTo(path.x, path.y);
      ictx.quadraticCurveTo(path.x, path.y, (path.x + p.x) / 2, (path.y + p.y) / 2);
      ictx.stroke();
      path = p;
      composite();
    }, A);
    const stop = () => { drawing = false; path = null; };
    cv.addEventListener("pointerup", stop, A);
    cv.addEventListener("pointercancel", stop, A);

    const q = id => area().querySelector(id);
    if (q("#btn-say")) q("#btn-say").onclick = () => { Sfx.pop(); Voice.sayPair(letter, word); };
    if (q("#btn-model")) q("#btn-model").onclick = () => {
      Sfx.click();
      showModel = !showModel;
      const b = q("#btn-model");
      if (b) b.textContent = showModel ? "👁️ Ẩn mẫu" : "👁️ Hiện mẫu";
      composite();
    };
    if (q("#btn-clear")) q("#btn-clear").onclick = () => {
      Sfx.click();
      ictx.clearRect(0, 0, TRACE_W, TRACE_H);
      composite();
    };
    if (q("#btn-prev")) q("#btn-prev").onclick = () => { Sfx.click(); goPrev(); };
    if (q("#btn-next")) q("#btn-next").onclick = () => { Sfx.click(); goNext(); };
  }

  function goPrev() {
    if (!state || state.idx <= 0) return;
    clearTicker();
    state.idx--;
    state.phase = "study";
    UI.updateStars(state.stars);
    UI.setDot(state.idx, "current");
    next();
  }

  function goNext() {
    if (!state) return;
    clearTicker();
    UI.setDot(state.idx, "done");
    state.idx++;
    state.phase = "study";
    UI.updateStars(state.stars);
    if (state.idx >= state.rounds) end();
    else next();
  }

  function renderBeauty() {
    if (!state.traceCase) { renderCasePick("hp"); return; }
    const letter = state.pool[state.idx];
    const word = randWord(letter);
    const g = state.traceCase === "lower" ? letter.toLowerCase() : letter;

    area().innerHTML = `
      <div class="trace-title">
        <span class="trace-big hp">${g}</span>
        <span class="trace-word">${word.e} ${word.w}</span>
      </div>
      <div class="trace-wrap beauty-wrap">
        <canvas id="tcanvas" width="${TRACE_W}" height="${TRACE_H}"></canvas>
      </div>
      <div class="trace-btns">
        <button class="btn" id="btn-say">🔊 Nghe</button>
        <button class="btn" id="btn-model">👁️ Ẩn mẫu</button>
        <button class="btn" id="btn-clear">🧽 Xoá</button>
        <button class="btn" id="btn-prev">⬅️ Quay Lại</button>
        <button class="btn" id="btn-next">Tiếp ➡️</button>
      </div>`;
    setupFreeWrite(letter, word, g, { font: '"HP001","Trebuchet MS",Arial,sans-serif', weight: 400 });
  }

  function jumpTo(idx) {
    if (!state) return;
    clearTicker();
    if (abort) { abort.abort(); abort = null; }
    state.idx = Math.max(0, Math.min(state.rounds - 1, idx));
    state.phase = "study";
    UI.updateStars(state.stars);
    UI.setDot(state.idx, "current");
    next();
  }

  return { start, cancel, jumpTo, currentIdx: () => (state ? state.idx : -1) };
})();
