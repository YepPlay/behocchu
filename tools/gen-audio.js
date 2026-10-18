const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "audio");
const FORCE = process.argv.includes("--force");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const sandbox = {};
vm.createContext(sandbox);
const src = fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8")
  + "\n;globalThis.__out = { ALPHABET, LETTER_SOUND, PHRASES, PHRASE_INDEX, BLENDS, COMPOUNDS };";
vm.runInContext(src, sandbox);
const { ALPHABET, LETTER_SOUND, PHRASES, PHRASE_INDEX, BLENDS, COMPOUNDS } = sandbox.__out;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function ttsUrl(text) {
  return "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob" +
    `&tl=vi&ttsspeed=0.85&q=${encodeURIComponent(text)}`;
}

async function download(text, file) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(ttsUrl(text), {
        headers: { "User-Agent": UA, Referer: "https://translate.google.com/" },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) throw new Error("file quá nhỏ (" + buf.length + " bytes)");
      fs.writeFileSync(file, buf);
      return buf.length;
    } catch (e) {
      if (attempt === 4) throw e;
      await sleep(1200 * attempt);
    }
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let cleaned = 0;
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (/^w\d{2}\.mp3$/.test(f)) { fs.unlinkSync(path.join(OUT_DIR, f)); cleaned++; }
  }
  if (cleaned) console.log(`  (đã xoá ${cleaned} file từ cũ wNN.mp3)`);

  let done = 0, skipped = 0, total = 0;
  const pad = i => String(i + 1).padStart(2, "0");

  for (let i = 0; i < ALPHABET.length; i++) {
    const item = ALPHABET[i];
    const sound = LETTER_SOUND[item.letter] || {};
    const letterText = sound.vi || item.letter;

    const jobs = [
      { file: path.join(OUT_DIR, `l${pad(i)}.mp3`), text: letterText, tag: `chữ ${item.letter}` },
    ];
    item.words.forEach(w => {
      jobs.push({
        file: path.join(OUT_DIR, `w${pad(i)}_${w.k}.mp3`),
        text: w.w,
        tag: `từ "${w.w}"`,
      });
    });

    for (const job of jobs) {
      total++;
      if (!FORCE && fs.existsSync(job.file) && fs.statSync(job.file).size > 500) {
        skipped++;
        continue;
      }
      const size = await download(job.text, job.file);
      done++;
      console.log(`  ✓ ${path.basename(job.file)}  ${job.tag}  (${size} bytes)`);
      await sleep(250);
    }
  }

  for (const p of (PHRASES || [])) {
    const name = PHRASE_INDEX[p.key];
    const file = path.join(OUT_DIR, name + ".mp3");
    total++;
    if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 500) { skipped++; continue; }
    const size = await download(p.text, file);
    done++;
    console.log(`  ✓ ${path.basename(file)}  câu "${p.text}"  (${size} bytes)`);
    await sleep(250);
  }

  // Âm tiết chế độ Ghép Âm: s01.mp3, s02.mp3...
  for (const b of (BLENDS || [])) {
    const file = path.join(OUT_DIR, `s${String(b.k).padStart(2, "0")}.mp3`);
    total++;
    if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 500) { skipped++; continue; }
    const size = await download(b.syl, file);
    done++;
    console.log(`  ✓ ${path.basename(file)}  âm tiết "${b.syl}" (${b.c} + ${b.r})  (${size} bytes)`);
    await sleep(250);
  }

  // Từ ghép chế độ Từ Ghép: c01.mp3, c02.mp3...
  for (const c of (COMPOUNDS || [])) {
    const file = path.join(OUT_DIR, `c${String(c.k).padStart(2, "0")}.mp3`);
    total++;
    if (!FORCE && fs.existsSync(file) && fs.statSync(file).size > 500) { skipped++; continue; }
    const size = await download(c.w, file);
    done++;
    console.log(`  ✓ ${path.basename(file)}  từ ghép "${c.w}"  (${size} bytes)`);
    await sleep(250);
  }

  console.log("");
  console.log(`  Xong! ${done} file mới, ${skipped} file đã có sẵn / ${total} tổng.`);
  console.log(`  Thư mục: ${path.relative(ROOT, OUT_DIR)}`);
})().catch(e => {
  console.error("LỖI:", e.message);
  process.exit(1);
});
