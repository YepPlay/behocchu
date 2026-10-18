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

function stripVN(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

const Voice = (() => {
  const FOLDER = "assets/audio/";
  const hasTTS = "speechSynthesis" in window;
  // src -> Promise<AudioBuffer>: tải + giải mã 1 lần, phát tức thì các lần sau.
  // (Thay cho <audio>: iOS bỏ qua preload="auto" nên mỗi lần ấn phải đợi
  // tải + giải mã → trễ. Web Audio phát từ bộ nhớ, không còn độ trễ.)
  const bufs = new Map();
  let current = null;   // AudioBufferSourceNode đang phát (nếu có)
  let pending = null;   // callback resolve của lần phát hiện tại
  let seq = 0;
  let ttsVoice = null;
  let ttsTries = 0;

  const isVi = x => {
    const lang = (x.lang || "").toLowerCase();
    const name = (x.name || "").toLowerCase();
    return lang.startsWith("vi") || name.includes("vietnam") || name.includes("việt");
  };
  function pickTTS() {
    if (!hasTTS) return null;
    const vs = speechSynthesis.getVoices() || [];
    if (!vs.length) return null;
    ttsVoice = vs.find(isVi) || null;
    return ttsVoice;
  }
  if (hasTTS) {
    pickTTS();
    speechSynthesis.onvoiceschanged = pickTTS;
    const t = setInterval(() => {
      if (ttsVoice || ttsTries++ > 12) { clearInterval(t); return; }
      pickTTS();
    }, 250);
  }
  function ttsSpeak(text, { rate = 0.82, lang, queue } = {}) {
    if (!hasTTS) return;
    try {
      if (!ttsVoice) pickTTS();
      if (!queue) speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (ttsVoice) u.voice = ttsVoice;
      u.lang = ttsVoice ? ttsVoice.lang : (lang || "vi-VN");
      u.rate = rate;
      u.pitch = 1.05;
      speechSynthesis.speak(u);
    } catch (e) { }
  }

  function fileFor(kind, letter, k) {
    const idx = AUDIO_INDEX[letter];
    if (!idx) return null;
    return FOLDER + (kind === "l" ? "l" + idx : "w" + idx + "_" + k) + ".mp3";
  }

  // Tải + giải mã 1 file (giữ trong bộ nhớ, thử lại được nếu lỗi mạng).
  function getBuf(src) {
    let p = bufs.get(src);
    if (!p) {
      p = (async () => {
        const c = AudioCtx();
        if (!c) throw new Error("no AudioContext");
        const res = await fetch(src);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.arrayBuffer();
        return await new Promise((resolve, reject) => {
          const r = c.decodeAudioData(data, resolve, reject); // bản cũ Safari chỉ có callback
          if (r && typeof r.then === "function") r.then(resolve, reject);
        });
      })();
      p.catch(() => { }); // nuốt unhandled rejection; caller tự xử lý
      bufs.set(src, p);
    }
    return p;
  }

  function playFile(src) {
    return new Promise(resolve => {
      if (!src) return resolve(false);
      getBuf(src).then(buf => {
        const c = AudioCtx();
        if (!buf || !c) { bufs.delete(src); resolve(false); return; }
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
      }, () => { bufs.delete(src); resolve(false); });
    });
  }
  function stopAll() {
    if (current) { const n = current; current = null; try { n.stop(); } catch (e) { } }
    if (pending) { const f = pending; pending = null; f(false); }
    if (hasTTS) speechSynthesis.cancel();
  }

  function fbLetter(letter) {
    const s = LETTER_SOUND[letter];
    ttsSpeak(ttsVoice ? letter : (s ? s.en : letter), ttsVoice ? {} : { rate: 0.7, lang: "en-US" });
  }
  function fbWord(letter, k) {
    const w = (wordsOf(letter)[k - 1] || {}).w || "";
    if (!w) return;
    ttsSpeak(ttsVoice ? w : stripVN(w), ttsVoice ? { queue: true } : { rate: 0.7, lang: "en-US", queue: true });
  }

  async function runSeq(letter, ks) {
    const my = ++seq;
    stopAll();

    const okL = await playFile(fileFor("l", letter));
    if (my !== seq) return;
    if (!okL) fbLetter(letter);
    else if (!ks.length) return;

    for (const k of ks) {
      if (my !== seq) return;
      const okW = await playFile(fileFor("w", letter, k));
      if (my !== seq) return;
      if (!okW) fbWord(letter, k);
    }
  }

  async function runWord(letter, k) {
    const my = ++seq;
    stopAll();
    const ok = await playFile(fileFor("w", letter, k));
    if (my !== seq) return;
    if (!ok) fbWord(letter, k);
  }

  async function runPhrase(key) {
    const my = ++seq;
    stopAll();
    const name = PHRASE_INDEX[key];
    const item = PHRASES.find(p => p.key === key) || {};
    const ok = name ? await playFile(FOLDER + name + ".mp3") : false;
    if (my !== seq) return;
    if (!ok && item.text) ttsSpeak(item.text, ttsVoice ? {} : { lang: "vi-VN", rate: 0.85 });
  }

  return {
    get available() { return !!ttsVoice; },

    warm() { AudioCtx(); },

    sayLetter(letter) { runSeq(letter, []); },

    sayPair(letter, word) {
      const w = word || randWord(letter);
      runSeq(letter, w ? [w.k] : []);
    },

    sayWord(letter, k) { runWord(letter, k); },

    sayWords(letter, ks) { runSeq(letter, ks || []); },

    sayPhrase(key) { runPhrase(key); },

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
