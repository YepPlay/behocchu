const ALPHABET = [
  { letter: "A",  words: [["Áo", "👕"], ["Anh trai", "👦"], ["Ảnh", "📷"], ["Ao sen", "🪷"], ["Ánh trăng", "🌙"]] },
  { letter: "Ă",  words: [["Ăn", "🍽️"], ["Tắm", "🛁"], ["Mắt", "👁️"], ["Răng", "🦷"], ["Nắng", "☀️"]] },
  { letter: "Â",  words: [["Âm nhạc", "🎵"], ["Thầy giáo", "👨‍🏫"], ["Ấm trà", "🫖"], ["Cân", "⚖️"], ["Chân", "🦶"]] },
  { letter: "B",  words: [["Bướm", "🦋"], ["Bò", "🐄"], ["Bóng", "⚽"], ["Bánh mì", "🥖"], ["Bút", "✏️"]] },
  { letter: "C",  words: [["Cá", "🐟"], ["Cây", "🌳"], ["Cà rốt", "🥕"], ["Cầu vồng", "🌈"], ["Cún", "🐶"]] },
  { letter: "D",  words: [["Dê", "🐐"], ["Dừa", "🥥"], ["Dao", "🔪"], ["Dép", "🩴"], ["Dưa hấu", "🍉"]] },
  { letter: "Đ",  words: [["Đom đóm", "🪲"], ["Đà điểu", "🦤"], ["Đèn", "💡"], ["Đồng hồ", "⌚"], ["Đá", "🪨"]] },
  { letter: "E",  words: [["Em bé", "👶"], ["Heo", "🐷"], ["Đen", "⚫"], ["Nem", "🥟"], ["Tre", "🎋"]] },
  { letter: "Ê",  words: [["Ếch", "🐸"], ["Ghế", "🪑"], ["Nến", "🕯️"], ["Tết", "🧨"], ["Lều", "⛺"]] },
  { letter: "G",  words: [["Gà", "🐔"], ["Gấu", "🐻"], ["Gạo", "🍚"], ["Gương", "🪞"], ["Giày", "👟"]] },
  { letter: "H",  words: [["Hổ", "🐯"], ["Hoa hồng", "🌹"], ["Hươu", "🦌"], ["Hạt", "🌰"], ["Hộp quà", "🎁"]] },
  { letter: "I",  words: [["Bí đỏ", "🎃"], ["Chim", "🐦"], ["Vịt", "🦆"], ["Kính", "👓"], ["Mì", "🍜"]] },
  { letter: "K",  words: [["Khoai tây", "🥔"], ["Kẹo", "🍬"], ["Kéo", "✂️"], ["Kiến", "🐜"], ["Khăn", "🧣"]] },
  { letter: "L",  words: [["Lạc đà", "🐫"], ["Lá", "🍃"], ["Lê", "🍐"], ["Ly", "🥤"], ["Lửa", "🔥"]] },
  { letter: "M",  words: [["Mèo", "🐱"], ["Mưa", "🌧️"], ["Mây", "☁️"], ["Mũ", "🧢"], ["Muối", "🧂"]] },
  { letter: "N",  words: [["Nước", "💧"], ["Núi", "🏔️"], ["Ngựa", "🐴"], ["Nón", "👒"], ["Nồi", "🍲"]] },
  { letter: "O",  words: [["Ong", "🐝"], ["Cò", "🦩"], ["Cỏ", "🌿"], ["Gió", "🌬️"], ["Nho", "🍇"]] },
  { letter: "Ô",  words: [["Ông", "👴"], ["Ô tô", "🚕"], ["Cô giáo", "👩‍🏫"], ["Gối", "🛏️"], ["Môi", "👄"]] },
  { letter: "Ơ",  words: [["Bơ", "🥑"], ["Cờ", "🚩"], ["Nơ", "🎀"], ["Mơ", "🍑"], ["Tơ", "🧵"]] },
  { letter: "P",  words: [["Bếp", "🍳"], ["Phao", "🛟"], ["Pin", "🔋"], ["Phượng", "🌺"], ["Pha lê", "💎"]] },
  { letter: "Q",  words: [["Quýt", "🍊"], ["Quần", "👖"], ["Que kem", "🍦"], ["Quạ", "🦅"], ["Quả trứng", "🥚"]] },
  { letter: "R",  words: [["Rùa", "🐢"], ["Rắn", "🐍"], ["Rổ", "🧺"], ["Rừng", "🌲"], ["Rau", "🥬"]] },
  { letter: "S",  words: [["Sư tử", "🦁"], ["Sách", "📚"], ["Sao", "⭐"], ["Sữa", "🥛"], ["Sóng", "🌊"]] },
  { letter: "T",  words: [["Tôm", "🦐"], ["Táo", "🍎"], ["Tàu hỏa", "🚂"], ["Tay", "✋"], ["Trống", "🥁"]] },
  { letter: "U",  words: [["Uống sữa", "🍼"], ["Cua", "🦀"], ["Mua", "🛒"], ["Chua", "🍋"], ["Cú", "🦉"]] },
  { letter: "Ư",  words: [["Ươm cây", "🌱"], ["Cửa", "🚪"], ["Mứt", "🍯"], ["Vườn hoa", "🌷"], ["Cười", "😄"]] },
  { letter: "V",  words: [["Voi", "🐘"], ["Vàng", "💛"], ["Vé", "🎫"], ["Vẽ", "🎨"], ["Váy", "👗"]] },
  { letter: "X",  words: [["Xe", "🚗"], ["Xe đạp", "🚲"], ["Xôi", "🍙"], ["Xoài", "🥭"], ["Xà phòng", "🧼"]] },
  { letter: "Y",  words: [["Yến", "🕊️"], ["Y tá", "👩‍⚕️"], ["Yêu", "💕"], ["Yêu thương", "❤️"], ["Yên ngựa", "🐎"]] },
];

ALPHABET.forEach(a => {
  a.words = a.words.map((p, i) => ({ w: p[0], e: p[1], k: i + 1 }));
});

const LETTER_MAP = Object.fromEntries(ALPHABET.map(a => [a.letter, a]));

const AUDIO_INDEX = Object.fromEntries(ALPHABET.map((a, i) => [a.letter, String(i + 1).padStart(2, "0")]));

function wordsOf(letter) {
  const a = LETTER_MAP[letter];
  return a ? a.words : [];
}
function randWord(letter) {
  const ws = wordsOf(letter);
  return ws[Math.floor(Math.random() * ws.length)];
}

function otherWord(letter, current) {
  const ws = wordsOf(letter).filter(w => w.k !== (current && current.k));
  return ws.length ? ws[Math.floor(Math.random() * ws.length)] : randWord(letter);
}

function baseText(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
function wordHasLetter(word, letter) {
  const b = baseText(letter);
  return !!b && baseText(word).includes(b);
}
function wordHasAny(word, letters) {
  const t = baseText(word);
  return (letters || []).some(l => {
    const b = baseText(l);
    return b && t.includes(b);
  });
}

const LETTER_SOUND = {
  A:  { vi: "a",     en: "ah" },
  Ă:  { vi: "á",     en: "ah" },
  Â:  { vi: "ớ",     en: "uh" },
  B:  { vi: "bê",    en: "bay" },
  C:  { vi: "xê",    en: "say" },
  D:  { vi: "dê",    en: "zay" },
  Đ:  { vi: "đê",    en: "day" },
  E:  { vi: "e",     en: "eh" },
  Ê:  { vi: "ê",     en: "ay" },
  G:  { vi: "giê",   en: "zee" },
  H:  { vi: "hát",   en: "haht" },
  I:  { vi: "i",     en: "ee" },
  K:  { vi: "ca",    en: "kah" },
  L:  { vi: "lờ",    en: "luh" },
  M:  { vi: "mờ",    en: "muh" },
  N:  { vi: "nờ",    en: "nuh" },
  O:  { vi: "o",     en: "aw" },
  Ô:  { vi: "ô",     en: "oh" },
  Ơ:  { vi: "ơ",     en: "uh" },
  P:  { vi: "pê",    en: "pay" },
  Q:  { vi: "quy",   en: "kwuh" },
  R:  { vi: "rờ",    en: "ruh" },
  S:  { vi: "ét",    en: "et" },
  T:  { vi: "tê",    en: "tay" },
  U:  { vi: "u",     en: "oo" },
  Ư:  { vi: "ư",     en: "uh" },
  V:  { vi: "vê",    en: "vay" },
  X:  { vi: "ích",   en: "ick" },
  Y:  { vi: "i dài", en: "ee dai" },
};

const LETTERS = ALPHABET.map(a => a.letter);

// Mọi từ của bảng chữ cái (dùng cho chế độ Chính Tả - Xếp Chữ).
const ALL_WORDS = ALPHABET.flatMap(a => a.words.map(w => ({ letter: a.letter, word: w })));

// Dữ liệu chế độ GHÉP ÂM: phụ âm + vần -> âm tiết.
// Quy tắc: chỉ giữ tổ hợp phát âm được; dùng BẰNG TAY (không sinh tự động)
// để tránh âm tiết sai (vd "qi"). Âm tiết cũng là phương án nhiễu hợp lệ.
const BLENDS = [
  // vần a
  { c: "b", r: "a", syl: "ba" }, { c: "c", r: "a", syl: "ca" },
  { c: "m", r: "a", syl: "ma" }, { c: "l", r: "a", syl: "la" },
  { c: "h", r: "a", syl: "ha" }, { c: "x", r: "a", syl: "xa" },
  { c: "d", r: "a", syl: "da" }, { c: "t", r: "a", syl: "ta" },
  // vần ơ
  { c: "b", r: "ơ", syl: "bơ" }, { c: "m", r: "ơ", syl: "mơ" },
  { c: "n", r: "ơ", syl: "nơ" }, { c: "l", r: "ơ", syl: "lơ" },
  { c: "đ", r: "ơ", syl: "đơ" },
  // vần ô
  { c: "c", r: "ô", syl: "cô" }, { c: "h", r: "ô", syl: "hô" },
  { c: "đ", r: "ô", syl: "đô" },
  // vần ai
  { c: "m", r: "ai", syl: "mai" }, { c: "l", r: "ai", syl: "lai" },
  { c: "h", r: "ai", syl: "hai" }, { c: "g", r: "ai", syl: "gai" },
  // vần ao
  { c: "c", r: "ao", syl: "cao" }, { c: "d", r: "ao", syl: "dao" },
  { c: "s", r: "ao", syl: "sao" },
  // vần ay
  { c: "b", r: "ay", syl: "bay" }, { c: "m", r: "ay", syl: "may" },
  { c: "t", r: "ay", syl: "tay" },
  // vần ây
  { c: "c", r: "ây", syl: "cây" }, { c: "đ", r: "ây", syl: "đây" },
  { c: "g", r: "ây", syl: "gây" },
  // vần oi
  { c: "m", r: "oi", syl: "moi" }, { c: "r", r: "oi", syl: "roi" },
  { c: "v", r: "oi", syl: "voi" },
  // vần eo
  { c: "h", r: "eo", syl: "heo" }, { c: "l", r: "eo", syl: "leo" },
  { c: "t", r: "eo", syl: "teo" },
  // vần an
  { c: "b", r: "an", syl: "ban" }, { c: "l", r: "an", syl: "lan" },
  { c: "t", r: "an", syl: "tan" },
];
BLENDS.forEach((b, i) => { b.k = i + 1; });

// Dữ liệu chế độ TỪ GHÉP: vần 1 + vần 2 -> từ ghép (lớp 1).
// Emoji không được trùng trong danh sách này.
const COMPOUNDS = [
  { a: "hoa",     b: "hồng",   w: "hoa hồng",     e: "🌹" },
  { a: "trò",     b: "chơi",   w: "trò chơi",     e: "🎮" },
  { a: "bạn",     b: "thân",   w: "bạn thân",     e: "🤝" },
  { a: "màu",     b: "sắc",    w: "màu sắc",      e: "🎨" },
  { a: "bánh",    b: "mì",     w: "bánh mì",      e: "🥖" },
  { a: "máy",     b: "bay",    w: "máy bay",      e: "✈️" },
  { a: "sân",     b: "trường", w: "sân trường",   e: "⚽" },
  { a: "quả",     b: "cầu",    w: "quả cầu",      e: "🏀" },
  { a: "bông",    b: "hoa",    w: "bông hoa",     e: "💐" },
  { a: "quả",     b: "táo",    w: "quả táo",      e: "🍎" },
  { a: "nụ",      b: "cười",   w: "nụ cười",      e: "😁" },
  { a: "nhà",     b: "bếp",    w: "nhà bếp",      e: "🍳" },
  { a: "cửa",     b: "sổ",     w: "cửa sổ",       e: "🪟" },
  { a: "bàn",     b: "học",    w: "bàn học",      e: "📚" },
  { a: "bút",     b: "chì",    w: "bút chì",      e: "✏️" },
  { a: "đồng",    b: "hồ",     w: "đồng hồ",      e: "⏰" },
  { a: "áo",      b: "mưa",    w: "áo mưa",       e: "🧥" },
  { a: "chén",    b: "cơm",    w: "chén cơm",     e: "🍚" },
  { a: "gấu",     b: "bông",   w: "gấu bông",     e: "🧸" },
  { a: "con",     b: "đò",     w: "con đò",       e: "⛵" },
  { a: "lều",     b: "trại",   w: "lều trại",     e: "⛺" },
  { a: "cơn",     b: "mưa",    w: "cơn mưa",      e: "🌧️" },
  { a: "vầng",    b: "trăng",  w: "vầng trăng",   e: "🌕" },
  { a: "ngôi",    b: "sao",    w: "ngôi sao",     e: "🌟" },
  { a: "con",     b: "thỏ",    w: "con thỏ",      e: "🐰" },
  { a: "bông",    b: "lúa",    w: "bông lúa",     e: "🌾" },
  { a: "thuyền",  b: "buồm",   w: "thuyền buồm",  e: "🚢" },
  { a: "đôi",     b: "cánh",   w: "đôi cánh",     e: "🦋" },
  { a: "ngón",    b: "tay",    w: "ngón tay",     e: "☝️" },
  { a: "mái",     b: "tóc",    w: "mái tóc",      e: "💇" },
  { a: "hạt",     b: "giống",  w: "hạt giống",    e: "🌱" },
  { a: "quả",     b: "trứng",  w: "quả trứng",    e: "🥚" },
  { a: "bến",     b: "xe",     w: "bến xe",       e: "🚌" },
  { a: "trang",   b: "sách",   w: "trang sách",   e: "📖" },
  { a: "đôi",     b: "mắt",    w: "đôi mắt",      e: "👀" },
  { a: "quả",     b: "chuối",  w: "quả chuối",    e: "🍌" },
];
COMPOUNDS.forEach((c, i) => { c.k = i + 1; });

// Tên file clip: "s01" = âm tiết số 1, "c01" = từ ghép số 1.
const clipName = (prefix, k) => prefix + String(k).padStart(2, "0");
const blendClip = b => clipName("s", b.k);
const compoundClip = c => clipName("c", c.k);

const PHRASES = [
  { key: "still", text: "Bé còn đó không?" },
];
const PHRASE_INDEX = Object.fromEntries(PHRASES.map((p, i) => [p.key, "p" + String(i + 1).padStart(2, "0")]));

const MODES = {
  learn:  { name: "Học Chữ Cái",        icon: "📖" },
  pic:    { name: "Chọn Hình Theo Chữ", icon: "🖼️" },
  listen: { name: "Nghe & Chọn Chữ",    icon: "🔊" },
  match:  { name: "Nối Từ",              icon: "🔗" },
  write:  { name: "Luyện Viết Chữ",     icon: "✍️" },
  beauty: { name: "Luyện Viết Chữ Đẹp",  icon: "🖋️" },
  spell:  { name: "Chính Tả – Xếp Chữ",  icon: "🧩" },
  blend:  { name: "Ghép Âm",             icon: "🔤" },
  compound: { name: "Từ Ghép",           icon: "🧱" },
};

const THEMES = {
  boy: {
    label: "Bé Trai", avatar: "🧒", hello: "Xin chào Bé Trai! 🚀",
    decor: [
      { e: "🚀", side: "left",  x: 0.20, y: 6,  size: 86 },
      { e: "⭐", side: "right", x: 0.15, y: 10, size: 62 },
      { e: "🛸", side: "left",  x: 0.62, y: 27, size: 78 },
      { e: "🤖", side: "right", x: 0.50, y: 38, size: 92 },
      { e: "✈️", side: "left",  x: 0.10, y: 52, size: 84 },
      { e: "⚽", side: "right", x: 0.62, y: 63, size: 66 },
      { e: "🌟", side: "left",  x: 0.52, y: 76, size: 70 },
      { e: "🛰️", side: "right", x: 0.22, y: 88, size: 80 },
    ],
    confetti: ["🚀", "⭐", "🤖", "⚽", "🛸", "🌟"],
  },
  girl: {
    label: "Bé Gái", avatar: "👧", hello: "Xin chào Bé Gái! 🌸",
    decor: [
      { e: "🦋", side: "left",  x: 0.20, y: 6,  size: 84 },
      { e: "🌈", side: "right", x: 0.18, y: 11, size: 74 },
      { e: "🌸", side: "left",  x: 0.60, y: 26, size: 70 },
      { e: "🎀", side: "right", x: 0.48, y: 37, size: 82 },
      { e: "🦄", side: "left",  x: 0.12, y: 51, size: 90 },
      { e: "🌺", side: "right", x: 0.60, y: 62, size: 68 },
      { e: "⭐", side: "left",  x: 0.50, y: 75, size: 62 },
      { e: "✨", side: "right", x: 0.24, y: 87, size: 76 },
    ],
    confetti: ["🌸", "🎀", "🦋", "🌈", "⭐", "🌺"],
  },
};
