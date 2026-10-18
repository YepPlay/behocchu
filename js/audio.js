// Dùng MỘT AudioContext duy nhất cho cả Sfx lẫn Voice.
// iOS Safari: AudioContext phải được "mở khóa" trong 1 cử chỉ người dùng
// (xem js/main.js — listener pointerdown gọi Sfx.warm()/Voice.warm()).
const AudioCtx = (() => {
  let ctx = null;
  return function () {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
})();

const Sfx = (() => {
  const ac = AudioCtx;

  function tone(freq, t0, dur, type = "sine", vol = 0.22) {
    const c = ac();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    const t = c.currentTime + t0;
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  return {
    warm() { ac(); },
    click()   { tone(660, 0, 0.07, "triangle", 0.14); },
    pop()     { tone(880, 0, 0.06, "sine", 0.12); },
    correct() { tone(523, 0, 0.12); tone(659, 0.09, 0.12); tone(784, 0.18, 0.22); },
    cheer()   { [660, 880, 1047, 1319].forEach((f, i) => tone(f, i * 0.055, 0.16, "triangle", 0.16)); },
    wrong()   { tone(196, 0, 0.18, "sawtooth", 0.13); tone(147, 0.12, 0.22, "sawtooth", 0.11); },
    win()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, "triangle", 0.2)); },
  };
})();

// PHÁT ÂM: CHỈ dùng các file mp3 Google đã tạo sẵn (assets/audio/*.mp3).
// KHÔNG dùng giọng đọc của trình duyệt (speechSynthesis): mỗi trình duyệt/thiết bị
// đọc một kiểu khác nhau, máy không có giọng tiếng Việt sẽ đọc tên chữ theo tiếng
// Anh (C → "say", G → "zee", D → "zay"...) → bé nghe sai hoàn toàn.
// Cách phát:
//   1) Web Audio: tải + giải mã sẵn vào RAM → phát tức thì, không độ trễ.
//   2) Nếu Web Audio không tải/giải mã được (mạng lỗi, hoặc mở trực tiếp file://
//      khiến fetch bị chặn) → phát LẠI ĐÚNG file mp3 đó bằng thẻ <audio>.
const Voice = (() => {
  const FOLDER = "assets/audio/";
  // src -> Promise<AudioBuffer>: tải + giải mã 1 lần, phát tức thì các lần sau.
  const bufs = new Map();
  let current = null;   // AudioBufferSourceNode hoặc thẻ <audio> đang phát
  let pending = null;   // callback kết thúc lượt phát hiện tại
  let seq = 0;

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  function fileFor(kind, letter, k) {
    const idx = AUDIO_INDEX[letter];
    if (!idx) return null;
    return FOLDER + (kind === "l" ? "l" + idx : "w" + idx + "_" + k) + ".mp3";
  }

  // Tải + giải mã 1 file bằng Web Audio.
  function decodeOnce(src) {
    const c = AudioCtx();
    if (!c) return Promise.reject(new Error("no AudioContext"));
    return fetch(src)
      .then(res => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.arrayBuffer();
      })
      .then(data => new Promise((resolve, reject) => {
        const r = c.decodeAudioData(data, resolve, reject); // Safari cũ chỉ có callback
        if (r && typeof r.then === "function") r.then(resolve, reject);
      }));
  }

  function getBuf(src) {
    let p = bufs.get(src);
    if (!p) {
      p = decodeOnce(src);
      p.catch(() => { }); // nuốt unhandled rejection; caller tự xử lý
      bufs.set(src, p);
    }
    return p;
  }

  // Thử lại vài lần (mạng chập chờn) trước khi chịu thua.
  async function getBufRetry(src) {
    let err;
    for (let i = 0; i < 3; i++) {
      try { return await getBuf(src); }
      catch (e) { err = e; bufs.delete(src); await delay(100 * (i + 1)); }
    }
    throw err;
  }

  // Phát bằng Web Audio từ buffer đã giải mã.
  function playBuf(buf, my) {
    return new Promise(resolve => {
      const c = AudioCtx();
      if (!buf || !c || my !== seq) return resolve(false);
      let done = false;
      let node = null;
      const fin = ok => {
        if (done) return;
        done = true;
        if (pending === fin) pending = null;
        if (current === node) current = null;
        resolve(ok);
      };
      pending = fin;
      try {
        node = c.createBufferSource();
        node.buffer = buf;
        node.connect(c.destination);
        node.onended = () => fin(true);
        node.start(0);
        current = node;
      } catch (e) { fin(false); }
    });
  }

  // Dự phòng: phát ĐÚNG file mp3 đó bằng thẻ <audio> (không dùng giọng TTS).
  function playEl(src, my) {
    return new Promise(resolve => {
      if (my !== seq) return resolve(false);
      let el;
      try { el = new Audio(); } catch (e) { return resolve(false); }
      let done = false;
      const fin = ok => {
        if (done) return;
        done = true;
        if (pending === fin) pending = null;
        if (current === el) current = null;
        try { el.onended = el.onerror = null; } catch (e) { }
        resolve(ok);
      };
      pending = fin;
      el.preload = "auto";
      el.onended = () => fin(true);
      el.onerror = () => fin(false);
      current = el;
      try {
        el.src = src;
        const p = el.play();
        if (p && typeof p.catch === "function") p.catch(() => fin(false));
      } catch (e) { fin(false); }
    });
  }

  function playFile(src, my) {
    if (!src) return Promise.resolve(false);
    return getBufRetry(src).then(
      buf => playBuf(buf, my),
      () => { bufs.delete(src); return playEl(src, my); }
    );
  }

  function stopAll() {
    if (current) {
      const c = current;
      current = null;
      try {
        if (typeof c.stop === "function") c.stop();
        else if (typeof c.pause === "function") {
          c.pause();
          c.removeAttribute("src");
          if (typeof c.load === "function") c.load();
        }
      } catch (e) { }
    }
    if (pending) { const f = pending; pending = null; f(false); }
  }

  async function runSeq(letter, ks) {
    const my = ++seq;
    stopAll();
    await playFile(fileFor("l", letter), my);
    if (my !== seq) return;
    for (const k of ks) {
      if (my !== seq) return;
      await playFile(fileFor("w", letter, k), my);
    }
  }

  async function runWord(letter, k) {
    const my = ++seq;
    stopAll();
    await playFile(fileFor("w", letter, k), my);
  }

  async function runPhrase(key) {
    const my = ++seq;
    stopAll();
    const name = PHRASE_INDEX[key];
    if (!name) return;
    await playFile(FOLDER + name + ".mp3", my);
  }

  return {
    available: true,

    warm() { AudioCtx(); },

    // Trả về Promise resolve khi PHÁT XONG — caller (vd pic mode) dùng để
    // chỉ chuyển vòng mới sau khi bé đã nghe trọn tiếng chữ + tiếng từ.
    sayLetter(letter) { return runSeq(letter, []); },

    sayPair(letter, word) {
      const w = word || randWord(letter);
      return runSeq(letter, w ? [w.k] : []);
    },

    sayWord(letter, k) { return runWord(letter, k); },

    sayWords(letter, ks) { return runSeq(letter, ks || []); },

    sayPhrase(key) { return runPhrase(key); },

    // Giải mã nền: chữ cái trước, rồi tới các từ — chia 3 luồng, mỗi file cách nhau
    // 20ms để không giật giao diện. Bé vào màn hình học là âm thanh đã sẵn trong RAM.
    preload(letters) {
      const ls = (letters || []).slice();
      const queue = [];
      ls.forEach(l => {
        const sL = fileFor("l", l);
        if (sL) queue.push(sL);
      });
      ls.forEach(l => {
        (wordsOf(l) || []).forEach(w => {
          const s = fileFor("w", l, w.k);
          if (s) queue.push(s);
        });
      });
      let i = 0;
      const worker = () => {
        if (i >= queue.length) return;
        const src = queue[i++];
        getBuf(src).catch(() => { bufs.delete(src); }).then(() => setTimeout(worker, 20));
      };
      for (let n = 0; n < 3; n++) worker();
    },

    stop() { seq++; stopAll(); },
  };
})();
