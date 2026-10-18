const fs = require("fs");
const vm = require("vm");
const path = require("path");

const code = fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8");
const ctx = {};
vm.createContext(ctx);
vm.runInContext(code + "\n;this.ALPHABET=ALPHABET;this.LETTERS=LETTERS;this.wordsOf=wordsOf;this.wordHasLetter=wordHasLetter;", ctx);

const { LETTERS, wordsOf, wordHasLetter } = ctx;
const baseText = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function buildOptions(correct, n = 4) {
  const base = baseText(correct);
  const others = LETTERS.filter(l => l !== correct);
  const far = shuffle(others.filter(l => baseText(l) !== base));
  const near = shuffle(others.filter(l => baseText(l) === base));
  return shuffle([correct, ...far.concat(near).slice(0, n - 1)]);
}

function pickWord(letter, avoid) {
  let list = wordsOf(letter);
  if (avoid && avoid.length) {
    const f = list.filter(w => !avoid.some(l => wordHasLetter(w.w, l)));
    if (f.length) list = f;
  }
  return list[rnd(list.length)];
}

const TRIALS = 3000;
let ambiguous = 0, total = 0, noClean = [];
const perLetter = {};
for (const target of LETTERS) {
  let bad = 0, t = 0;
  for (let i = 0; i < TRIALS; i++) {
    const distractors = buildOptions(target).filter(l => l !== target);
    let localBad = false;
    for (const d of distractors) {
      const w = pickWord(d, [target]);
      t++; total++;
      if (wordHasLetter(w.w, target)) { ambiguous++; bad++; localBad = true; }
    }
  }
  perLetter[target] = (bad / t * 100).toFixed(1) + "%";
}
console.log("Tỉ lệ từ gây nhiễu vẫn chứa chữ đang hỏi (càng thấp càng tốt):", (ambiguous / total * 100).toFixed(2) + "%");
console.log("Theo từng chữ:", JSON.stringify(perLetter));
