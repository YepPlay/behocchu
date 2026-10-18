// Parse header MPEG của các file mp3 để kiểm tra version/layer/sample-rate/duration.
// node tools/parse-mp3.js [file...]
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "assets", "audio");

const BITRATES_V1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const BITRATES_V2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

function parse(buf) {
  // tìm frame sync đầu tiên
  let i = 0;
  while (i < buf.length - 4) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) break;
    i++;
  }
  if (i >= buf.length - 4) return { err: "no sync" };
  const b1 = buf[i + 1], b2 = buf[i + 2], b3 = buf[i + 3];
  // Header: byte0=AAAAAAAA, byte1=AAABBCCD (AAA=sync, BB=version, CC=layer, D=protection)
  const versionBits = (b1 >> 3) & 3;      // 3=V1, 2=V2, 0=V2.5, 1=reserved
  const layerBits = (b1 >> 1) & 3;        // 1=III, 2=II, 3=I
  const brIdx = (b2 >> 4) & 0xf;
  const srIdx = (b2 >> 2) & 3;
  const ver = versionBits === 3 ? 1 : versionBits === 2 ? 2 : versionBits === 0 ? 2.5 : "?";
  const layer = layerBits === 1 ? "III" : layerBits === 2 ? "II" : layerBits === 3 ? "I" : "?";
  const rates = RATES[versionBits];
  const sr = rates && srIdx < 3 ? rates[srIdx] : 0;
  const table = (ver === 1) ? BITRATES_V1L3 : BITRATES_V2L3;
  const br = table[brIdx]; // kbps
  // đếm frame để ước duration (Layer III: 1152 samples/frame; V2/V2.5: 576)
  let frames = 0, pos = i;
  const samplesPerFrame = (ver === 1) ? 1152 : 576;
  while (pos + 4 <= buf.length) {
    if (!(buf[pos] === 0xff && (buf[pos + 1] & 0xe0) === 0xe0)) break;
    frames++;
    const pad = (buf[pos + 2] >> 1) & 1;
    let flen;
    if (layer === "III") {
      flen = Math.floor((ver === 1 ? 144 : 72) * br * 1000 / sr) + pad;
    } else if (layer === "I") {
      flen = Math.floor((ver === 1 ? 12 : 6) * br * 1000 / sr + pad) * 4;
    } else {
      flen = Math.floor((ver === 1 ? 144 : 72) * br * 1000 / sr) + pad;
    }
    if (flen <= 0) break;
    pos += flen;
  }
  const dur = sr ? (frames * samplesPerFrame) / sr : 0;
  return { ver, layer, sr, br, frames, dur: dur.toFixed(2) + "s", id3: buf.slice(0, 3).toString() === "ID3" };
}

const files = process.argv.slice(2);
if (!files.length) {
  // mặc định: 29 file chữ cái + 6 file từ ngẫu nhiên
  for (let n = 1; n <= 29; n++) files.push("l" + String(n).padStart(2, "0") + ".mp3");
  files.push("w05_1.mp3", "w10_1.mp3", "w01_1.mp3", "w29_5.mp3", "w12_3.mp3", "p01.mp3");
}
for (const f of files) {
  const fp = path.join(DIR, f);
  if (!fs.existsSync(fp)) { console.log(f, "MISSING"); continue; }
  const r = parse(fs.readFileSync(fp));
  console.log(
    f.padEnd(10),
    r.err ? r.err : `MPEG-${r.ver} L${r.layer} ${r.sr}Hz ${r.br}kbps frames=${r.frames} dur=${r.dur}` +
      (r.id3 ? " [ID3]" : "") +
      ((r.layer !== "III") ? "  ⚠️ KHÔNG PHẢI LAYER III" : "") +
      ((r.ver === "?") ? "  ⚠️ VERSION RESERVED" : "")
  );
}
