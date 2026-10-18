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

  // Chế độ "chơi mãi": random vĩnh viễn, bé tự bấm Thoát (không thanh tiến trình).
  const ENDLESS_MODES = { match: true, spell: true, blend: true, compound: true };

  // --- Túi ngẫu nhiên: rút lần lượt từ danh sách đã xáo, hết túi thì xáo lại.
  // Cho cảm giác random vô tận nhưng không lặp liền kề và mọi mục đều có mặt.
  function bagRefill(list) {
    const bag = shuffle(list);
    if (state.bagLast && bag.length > 1 && bag[bag.length - 1] === state.bagLast) {
      const j = rnd(bag.length - 1);
      [bag[j], bag[bag.length - 1]] = [bag[bag.length - 1], bag[j]];
    }
    state.bag = bag;
  }
  function bagNext(list) {
    if (!state.bag || !state.bag.length) bagRefill(list);
    const item = state.bag.pop();
    state.bagLast = item;
    return item;
  }
  // Rút 1 nhóm `size` mục KHÁC NHAU (chế độ Từ Ghép: 4 cặp mỗi vòng).
  function bagNextGroup(list, size) {
    if (!state.bag || state.bag.length < size) bagRefill(list);
    const group = state.bag.splice(-size, size);
    state.bagLast = group[group.length - 1];
    return group;
  }

  function start(mode, cb) {
    cleanup();
    onEnd = cb;

    const endless = !!ENDLESS_MODES[mode];
    const pool = LETTERS; // các chế độ vô hạn tự rút ngẫu nhiên, không dùng pool
    const rounds = endless ? Infinity : pool.length;
    state = {
      mode, pool, endless, idx: 0, stars: 0, streak: 0, correct: 0,
      rounds, total: endless ? 0 : rounds, phase: "study",
      bag: null, bagLast: null, spell: null,
    };
    if (mode === "blend") Voice.preloadClips(BLENDS.map(blendClip));
    else if (mode === "compound") Voice.preloadClips(COMPOUNDS.map(compoundClip));
    // spell rút từ bất kỳ nên nạp sẵn kho audio của cả bảng chữ cái
    else Voice.preload(pool);
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
    const render = {
      learn: renderLearn, pic: renderPic, listen: renderListen, match: renderMatch,
      write: renderWrite, beauty: renderBeauty,
      spell: renderSpell, blend: renderBlend, compound: renderCompound,
    };
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

  // expect: state tại thời điểm lên lịch — nếu bé đã thoát/chuyển chế độ
  // (state bị thay thế) thì bỏ qua, không cộng nhầm vòng cho chế độ mới.
  function advance(delay, expect) {
    const s = state;
    if (!s || (expect && s !== expect)) return;
    UI.setDot(s.idx, "done");
    s.idx++;
    UI.updateStars(s.stars);
    if (s.idx >= s.rounds) {
      setTimeout(() => { if (state === s) end(); }, (delay || 700) + 500);
    } else {
      setTimeout(() => { if (state === s) next(); }, delay || 900);
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
    const st = state;
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
          // Chỉ chuyển vòng mới khi đã đọc xong chữ cái + từ (promise resolve).
          // advance() kiểm `state === st` nên nếu bé bấm Thoát / đổi chế độ
          // giữa chừng thì vòng mới của chế độ khác không bị cộng nhầm.
          Voice.sayPair(letter, wmap[letter]).then(() => advance(500, st));
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

  // CHẾ ĐỘ GHÉP ÂM: "phụ âm + vần = ?" — chọn âm tiết đúng.
  // Phương án nhiễu luôn lấy từ chính BLENDS nên mọi phương án đều phát âm được:
  // ưu tiên cùng vần khác phụ âm, rồi cùng phụ âm khác vần, rồi ngẫu nhiên.
  function buildBlendOptions(item) {
    const sameRhyme = shuffle(BLENDS.filter(b => b.r === item.r && b.syl !== item.syl));
    const sameCons = shuffle(BLENDS.filter(b => b.c === item.c && b.r !== item.r));
    const rest = shuffle(BLENDS.filter(b => b.c !== item.c && b.r !== item.r));
    const picked = sameRhyme.concat(sameCons, rest).slice(0, 3);
    return shuffle([item.syl, ...picked.map(b => b.syl)]);
  }

  function renderBlend() {
    const st = state;
    const item = bagNext(BLENDS);
    const opts = buildBlendOptions(item);

    area().innerHTML = `
      <div class="q-center">
        <div class="blend-eq">
          <span class="blend-chip">${item.c}</span>
          <span class="blend-op">+</span>
          <span class="blend-chip">${item.r}</span>
          <span class="blend-op">=</span>
          <span class="blend-chip q">?</span>
        </div>
        <p class="q-ask">Chọn âm tiết đúng</p>
      </div>
      <div class="opt-grid">
        ${opts.map(o => `
          <button class="opt-btn blend-opt" data-s="${o}">
            <span class="blend-syl">${o}</span>
          </button>`).join("")}
      </div>`;

    let first = true, locked = false;
    area().querySelectorAll(".opt-btn").forEach(btn => {
      btn.onclick = () => {
        if (locked) return;
        if (btn.dataset.s === item.syl) {
          locked = true;
          awardStar(first);
          state.correct++;
          Sfx.correct();
          btn.classList.add("good");
          UI.celebrate(btn);
          Voice.sayClip(blendClip(item)).then(() => advance(400, st));
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

  // CHẾ ĐỘ CHÍNH TẢ - XẾP CHỮ THÀNH TỪ.
  // Bé nghe từ (audio sẵn của bảng chữ cái) + thấy emoji, rồi bấm các thẻ chữ
  // cái theo đúng thứ tự. Từ >= 5 chữ được thêm 2 thẻ nhiễu, 3-4 chữ thêm 1 thẻ.
  const SPELL_POOL = "aăâbcdđeêghiklmnoôơpqrstuưvx";

  function renderSpell() {
    const st = state;

    // Rút từ mới đầu mỗi vòng; re-render (nút Xoá) dùng lại đúng từ đang chơi.
    if (!state.spell || state.spell.idx !== state.idx) {
      const item = bagNext(ALL_WORDS);
      const word = item.word;
      const chars = word.w.split("");
      const letters = chars.filter(c => c !== " ");
      const nExtra = letters.length >= 5 ? 2 : 1;
      const extra = [];
      for (let i = 0; i < nExtra; i++) extra.push(SPELL_POOL[rnd(SPELL_POOL.length)]);
      state.spell = {
        idx: state.idx,
        item, word,
        first: true,
        tiles: shuffle(letters.concat(extra)),
        slots: chars.map(c => ({ ch: c, filled: c === " " })),
      };
    }
    const sp = state.spell;
    const it = sp.item;
    const word = sp.word;

    area().innerHTML = `
      <div class="q-center">
        <div class="spell-head">
          <button class="listen-btn sm" id="btn-hear">🔊</button>
          <span class="spell-emoji">${word.e}</span>
        </div>
        <p class="q-ask">Bấm các chữ để xếp thành từ</p>
      </div>
      <div class="spell-slots" id="spell-slots">
        ${sp.slots.map((s, i) => `<span class="spell-slot${s.filled ? (s.ch === " " ? " gap" : " filled") : ""}" data-i="${i}">${s.filled && s.ch !== " " ? s.ch : ""}</span>`).join("")}
      </div>
      <div class="spell-tray" id="spell-tray">
        ${sp.tiles.map((t, i) => `<button class="spell-tile" data-i="${i}">${t}</button>`).join("")}
      </div>
      <div class="learn-btns">
        <button class="btn" id="btn-hint">💡 Gợi ý</button>
        <button class="btn" id="btn-clear">🧽 Xoá</button>
      </div>`;

    const slots = Array.from(area().querySelectorAll(".spell-slot"));
    const tiles = Array.from(area().querySelectorAll(".spell-tile"));
    let placed = sp.slots.filter(s => s.filled).length;
    let locked = false;

    function complete() {
      if (sp.done) return;
      sp.done = true;
      locked = true;
      awardStar(sp.first);
      state.correct++;
      Sfx.correct();
      UI.celebrate(area().querySelector(".spell-slots"));
      Voice.sayPair(it.letter, word).then(() => advance(500, st));
    }

    function place(tile) {
      if (locked || sp.done || tile.classList.contains("used")) return;
      const slot = slots.find(sl => !sp.slots[+sl.dataset.i].filled);
      if (!slot) return;
      const si = +slot.dataset.i;
      const ch = sp.tiles[+tile.dataset.i];
      if (ch !== sp.slots[si].ch) {
        sp.first = false;
        state.streak = 0;
        Sfx.wrong();
        tile.classList.add("bad");
        slot.classList.add("bad");
        setTimeout(() => { tile.classList.remove("bad"); slot.classList.remove("bad"); }, 500);
        return;
      }
      sp.slots[si].filled = true;
      slot.textContent = ch;
      slot.classList.add("filled");
      tile.classList.add("used");
      Sfx.pop();
      placed++;
      if (placed >= sp.slots.length) complete();
    }

    tiles.forEach(tile => { tile.onclick = () => place(tile); });

    const hear = () => { Sfx.pop(); Voice.sayWord(it.letter, word.k); };
    area().querySelector("#btn-hear").onclick = () => { if (!locked && !sp.done) hear(); };
    setTimeout(() => { if (state === st && !locked && !sp.done) Voice.sayWord(it.letter, word.k); }, 350);

    area().querySelector("#btn-hint").onclick = () => {
      if (locked || sp.done) return;
      Sfx.click();
      sp.first = false;
      const si = sp.slots.findIndex(s => !s.filled);
      if (si < 0) return;
      const tile = tiles.find(t => !t.classList.contains("used") && sp.tiles[+t.dataset.i] === sp.slots[si].ch);
      if (tile) place(tile);
    };

    area().querySelector("#btn-clear").onclick = () => {
      if (sp.done) return;
      Sfx.click();
      sp.slots.forEach(s => { s.filled = s.ch === " "; });
      renderSpell();
    };
  }

  // Bảng nối dùng chung cho "Nối Từ" và "Từ Ghép".
  // cfg: {
  //   ask: câu hỏi phía trên,
  //   left, right: 2 mảng id (cùng tập, thứ tự độc lập),
  //   cellLeft(id), cellRight(id): HTML của ô bên trái / bên phải,
  //   ghost(id): nội dung ô kéo thả,
  //   onMatch(id, resultEl): gọi ngay khi nối đúng (đọc âm, hiện kết quả...)
  // }
  function setupMatch(cfg) {
    const st = state;
    const done = new Set();
    let selected = null, moved = false;

    area().innerHTML = `
      <p class="q-ask center">${cfg.ask}</p>
      <div class="match-board" id="mboard">
        <div class="match-col" id="col-pics">
          ${cfg.left.map(id => `
            <div class="m-pic" data-l="${id}">${cfg.cellLeft(id)}</div>`).join("")}
        </div>
        <svg class="match-lines" id="mlines"></svg>
        <div class="match-col" id="col-letters">
          ${cfg.right.map(id => `
            <div class="m-letter" data-l="${id}">${cfg.cellRight(id)}</div>`).join("")}
        </div>
      </div>
      <div class="match-result" id="mresult"></div>`;

    const board = area().querySelector("#mboard");
    const resultEl = area().querySelector("#mresult");
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
        if (cfg.onMatch) cfg.onMatch(a, resultEl);
        clearSel();
        UI.celebrate(pic, { praise: false, big: false });
        UI.updateStars(state.stars);
        if (done.size === cfg.left.length) {
          state.idx++;
          Sfx.win();
          UI.praise("🎉");
          UI.confetti(30);

          setTimeout(() => { if (state === st) next(); }, 1600);
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
        ghost.textContent = cfg.ghost(pic.dataset.l);
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

  function renderMatch() {
    const picks = randomGroup();
    const wmap = pickWords(picks, true, l => picks.filter(x => x !== l));

    setupMatch({
      ask: "Nối hình với chữ",
      left: shuffle(picks),
      right: shuffle(picks),
      cellLeft: id => `
        <span class="m-emoji">${wmap[id].e}</span>
        <span class="m-word">${wmap[id].w}</span>`,
      cellRight: id => `<span class="big-letter sm">${id}</span>`,
      ghost: id => wmap[id].e,
      onMatch: id => Voice.sayPair(id, wmap[id]),
    });
  }

  // CHẾ ĐỘ TỪ GHÉP: nối vần thứ nhất với vần thứ hai thành từ ghép.
  function renderCompound() {
    const group = bagNextGroup(COMPOUNDS, 4);
    const left = shuffle(group), right = shuffle(group);

    setupMatch({
      ask: "Nối thành từ ghép",
      left: left.map(c => c.k),
      right: right.map(c => c.k),
      cellLeft: k => `<span class="m-word part">${COMPOUNDS[k - 1].a}</span>`,
      cellRight: k => `<span class="m-word part">${COMPOUNDS[k - 1].b}</span>`,
      ghost: k => COMPOUNDS[k - 1].a,
      onMatch: (k, resultEl) => {
        const c = COMPOUNDS[k - 1];
        if (resultEl) {
          resultEl.innerHTML = `<span class="chip-word">${c.w}</span><span class="chip-emoji">${c.e}</span>`;
        }
        Voice.sayClip(compoundClip(c));
      },
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

  return {
    start, cancel, jumpTo,
    currentIdx: () => (state ? state.idx : -1),
    // Trạng thái rút gọn để màn hình chơi lưu "sao tốt nhất" khi bé thoát
    // ở chế độ chơi mãi (không có màn hình tổng kết).
    snapshot: () => (state ? { mode: state.mode, stars: state.stars, endless: !!state.endless } : null),
  };
})();
