// Kiểm tra toàn bộ file audio của game (đáng tin cậy, không phụ thuộc TTS).
//   node tools/check-audio.js
// - Đối chiếu danh sách file cần có (suy ra từ js/data.js) với file thực tế.
// - Xác nhận mỗi file là MP3 (MPEG Layer III) hợp lệ, ước lượng thời lượng.
// - Xác nhận mọi file cần có đều nằm trong precache của sw.js.
// Thoát code 1 nếu có lỗi.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "assets", "audio");

// --- suy ra danh sách file cần có từ js/data.js ---
function loadData() {
  const code = fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8");
  const ctx = {};
  vm.createContext(ctx);
  // const/let trong data.js KHÔNG gắn vào context object → phải export tường minh.
  vm.runInContext(
    code + "\n;globalThis.__x = { ALPHABET, PHRASES, PHRASE_INDEX, BLENDS, COMPOUNDS };",
    ctx,
    { filename: "data.js" }
  );
  return ctx.__x;
}
const D = loadData();
const expected = new Map();
const add = (file, desc) => expected.set(file, desc);

const pad2 = n => String(n).padStart(2, "0");

(D.ALPHABET || []).forEach((a, i) => {
  const idx = pad2(i + 1);
  add(`l${idx}.mp3`, `âm đọc chữ ${a.letter}`);
  (a.words || []).forEach(w => add(`w${idx}_${w.k}.mp3`, `từ "${w.w}" (chữ ${a.letter})`));
});
(D.PHRASES || []).forEach(p => {
  const name = (D.PHRASE_INDEX || {})[p.key];
  if (name) add(name + ".mp3", `câu "${p.text}"`);
});
(D.BLENDS || []).forEach(b => add(`s${pad2(b.k)}.mp3`, `âm tiết "${b.syl}" (${b.c} + ${b.r})`));
(D.COMPOUNDS || []).forEach(c => add(`c${pad2(c.k)}.mp3`, `từ ghép "${c.w}"`));

// --- đọc sw.js để biết precache ---
const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const precached = new Set();
for (const m of sw.matchAll(/"\.\/(assets\/audio\/[^"]+)"/g)) precached.add(path.basename(m[1]));

// --- kiểm tra định dạng mp3 ---
function mp3Info(buf) {
  let i = 0;
  const lim = Math.min(buf.length - 4, 8192);
  while (i < lim && !(buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0)) i++;
  if (i >= lim) return { ok: false, why: "không thấy frame sync MP3" };
  const b1 = buf[i + 1], b2 = buf[i + 2];
  const versionBits = (b1 >> 3) & 3;   // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
  const layerBits = (b1 >> 1) & 3;     // 1=Layer III
  if (versionBits === 1) return { ok: false, why: "MPEG version không hợp lệ" };
  if (layerBits !== 1) return { ok: false, why: "không phải Layer III" };
  const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  const srIdx = (b2 >> 2) & 3;
  const sr = (RATES[versionBits] || [])[srIdx] || 0;
  const brIdx = (b2 >> 4) & 0xf;
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  const br = (versionBits === 3 ? BR1 : BR2)[brIdx] || 0;
  const dur = br > 0 ? (buf.length * 8) / (br * 1000) : 0; // ước lượng theo bitrate CBR
  return { ok: dur > 0.12, why: dur > 0.12 ? "" : "thời lượng quá ngắn/bitrate 0", sr, dur };
}

const rows = [];
let bad = 0, okCount = 0;

for (const [file, desc] of [...expected.entries()].sort()) {
  const fp = path.join(AUDIO_DIR, file);
  if (!fs.existsSync(fp)) { rows.push(["MISSING", file, "thiếu file", desc]); bad++; continue; }
  const st = fs.statSync(fp);
  if (!st.size) { rows.push(["EMPTY", file, "file rỗng", desc]); bad++; continue; }
  const info = mp3Info(fs.readFileSync(fp));
  if (!info.ok) { rows.push(["BAD", file, info.why, desc]); bad++; continue; }
  if (!precached.has(file)) { rows.push(["NOPRECACHE", file, "không có trong sw.js", desc]); bad++; continue; }
  okCount++;
}

const onDisk = new Set(fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith(".mp3")));
const extra = [...onDisk].filter(f => !expected.has(f)).sort();

for (const r of rows) console.log(r[0].padEnd(11) + r[1].padEnd(16) + r[2] + "  — " + r[3]);
if (extra.length) console.log("EXTRA      " + extra.join(", "));

console.log(
  "\nKết quả: " + okCount + "/" + expected.size + " file OK" +
  (bad ? "  ❌ " + bad + " lỗi" : "  ✅") +
  (extra.length ? "  | " + extra.length + " file thừa không dùng" : "")
);
console.log("Precache sw.js: " + precached.size + " file audio");
process.exit(bad ? 1 : 0);
