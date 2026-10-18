const Sfx = (() => {
  let ctx = null;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

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
  const cache = new Map();
  let current = null;
  let pending = null;
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

  function elem(src) {
    let a = cache.get(src);
    if (!a) {
      a = new Audio(src);
      a.preload = "auto";
      cache.set(src, a);
    }
    return a;
  }

  function fileFor(kind, letter, k) {
    const idx = AUDIO_INDEX[letter];
    if (!idx) return null;
    return FOLDER + (kind === "l" ? "l" + idx : "w" + idx + "_" + k) + ".mp3";
  }
  function playFile(src) {
    return new Promise(resolve => {
      if (!src) return resolve(false);
      const a = elem(src);
      current = a;
      let done = false;
      const fin = ok => {
        if (done) return;
        done = true;
        if (pending === fin) pending = null;
        resolve(ok);
      };
      pending = fin;
      a.onended = () => fin(true);
      a.onerror = () => fin(false);
      try { a.currentTime = 0; } catch (e) { }
      const p = a.play();
      if (p && p.catch) p.catch(() => fin(false));
    });
  }
  function stopAll() {
    if (current) { try { current.pause(); } catch (e) {} }
    if (pending) { const f = pending; pending = null; f(false); }
    current = null;
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

    sayLetter(letter) { runSeq(letter, []); },

    sayPair(letter, word) {
      const w = word || randWord(letter);
      runSeq(letter, w ? [w.k] : []);
    },

    sayWord(letter, k) { runWord(letter, k); },

    sayWords(letter, ks) { runSeq(letter, ks || []); },

    sayPhrase(key) { runPhrase(key); },

    preload(letters) {
      (letters || []).forEach(l => {
        const srcL = fileFor("l", l);
        if (srcL && !cache.has(srcL)) elem(srcL);
        wordsOf(l).forEach(w => {
          const src = fileFor("w", l, w.k);
          if (src && !cache.has(src)) elem(src);
        });
      });
    },

    stop() { seq++; stopAll(); },
  };
})();
