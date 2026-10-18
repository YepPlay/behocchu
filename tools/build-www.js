const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "www");
const FILES = ["index.html", "manifest.webmanifest", "sw.js"];
const DIRS = ["css", "js", "assets"];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, f));
}
for (const d of DIRS) {
  const src = path.join(ROOT, d);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(OUT, d), { recursive: true });
}

const htmlPath = path.join(OUT, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");
// App iOS load bang WKWebView voi scheme file:// nen CSP can cho phep file:
html = html.replace(
  /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/,
  (m, head, csp, tail) => head + csp.replace(/'self'/g, "'self' file:") + tail
);
fs.writeFileSync(htmlPath, html, "utf8");

function walk(dir) {
  let n = 0, bytes = 0;
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      const sub = walk(abs);
      n += sub.n;
      bytes += sub.bytes;
    } else {
      n++;
      bytes += st.size;
    }
  }
  return { n, bytes };
}

const { n, bytes } = walk(OUT);
console.log("www/ san sang: " + n + " file, " + (bytes / 1048576).toFixed(1) + " MB");
console.log("Thu muc: " + path.relative(ROOT, OUT));
console.log("Buoc tiep theo: mo ios-native/BeHocChu.xcodeproj bang Xcode (xem IOS-BUILD.md)");
