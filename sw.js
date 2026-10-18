const CACHE = "vl-chu-cai-6c2cd5a043";
const ASSETS = [
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./assets/audio/c01.mp3",
  "./assets/audio/c02.mp3",
  "./assets/audio/c03.mp3",
  "./assets/audio/c04.mp3",
  "./assets/audio/c05.mp3",
  "./assets/audio/c06.mp3",
  "./assets/audio/c07.mp3",
  "./assets/audio/c08.mp3",
  "./assets/audio/c09.mp3",
  "./assets/audio/c10.mp3",
  "./assets/audio/c11.mp3",
  "./assets/audio/c12.mp3",
  "./assets/audio/c13.mp3",
  "./assets/audio/c14.mp3",
  "./assets/audio/c15.mp3",
  "./assets/audio/c16.mp3",
  "./assets/audio/c17.mp3",
  "./assets/audio/c18.mp3",
  "./assets/audio/c19.mp3",
  "./assets/audio/c20.mp3",
  "./assets/audio/c21.mp3",
  "./assets/audio/c22.mp3",
  "./assets/audio/c23.mp3",
  "./assets/audio/c24.mp3",
  "./assets/audio/c25.mp3",
  "./assets/audio/c26.mp3",
  "./assets/audio/c27.mp3",
  "./assets/audio/c28.mp3",
  "./assets/audio/c29.mp3",
  "./assets/audio/c30.mp3",
  "./assets/audio/c31.mp3",
  "./assets/audio/c32.mp3",
  "./assets/audio/c33.mp3",
  "./assets/audio/c34.mp3",
  "./assets/audio/c35.mp3",
  "./assets/audio/c36.mp3",
  "./assets/audio/l01.mp3",
  "./assets/audio/l02.mp3",
  "./assets/audio/l03.mp3",
  "./assets/audio/l04.mp3",
  "./assets/audio/l05.mp3",
  "./assets/audio/l06.mp3",
  "./assets/audio/l07.mp3",
  "./assets/audio/l08.mp3",
  "./assets/audio/l09.mp3",
  "./assets/audio/l10.mp3",
  "./assets/audio/l11.mp3",
  "./assets/audio/l12.mp3",
  "./assets/audio/l13.mp3",
  "./assets/audio/l14.mp3",
  "./assets/audio/l15.mp3",
  "./assets/audio/l16.mp3",
  "./assets/audio/l17.mp3",
  "./assets/audio/l18.mp3",
  "./assets/audio/l19.mp3",
  "./assets/audio/l20.mp3",
  "./assets/audio/l21.mp3",
  "./assets/audio/l22.mp3",
  "./assets/audio/l23.mp3",
  "./assets/audio/l24.mp3",
  "./assets/audio/l25.mp3",
  "./assets/audio/l26.mp3",
  "./assets/audio/l27.mp3",
  "./assets/audio/l28.mp3",
  "./assets/audio/l29.mp3",
  "./assets/audio/p01.mp3",
  "./assets/audio/s01.mp3",
  "./assets/audio/s02.mp3",
  "./assets/audio/s03.mp3",
  "./assets/audio/s04.mp3",
  "./assets/audio/s05.mp3",
  "./assets/audio/s06.mp3",
  "./assets/audio/s07.mp3",
  "./assets/audio/s08.mp3",
  "./assets/audio/s09.mp3",
  "./assets/audio/s10.mp3",
  "./assets/audio/s11.mp3",
  "./assets/audio/s12.mp3",
  "./assets/audio/s13.mp3",
  "./assets/audio/s14.mp3",
  "./assets/audio/s15.mp3",
  "./assets/audio/s16.mp3",
  "./assets/audio/s17.mp3",
  "./assets/audio/s18.mp3",
  "./assets/audio/s19.mp3",
  "./assets/audio/s20.mp3",
  "./assets/audio/s21.mp3",
  "./assets/audio/s22.mp3",
  "./assets/audio/s23.mp3",
  "./assets/audio/s24.mp3",
  "./assets/audio/s25.mp3",
  "./assets/audio/s26.mp3",
  "./assets/audio/s27.mp3",
  "./assets/audio/s28.mp3",
  "./assets/audio/s29.mp3",
  "./assets/audio/s30.mp3",
  "./assets/audio/s31.mp3",
  "./assets/audio/s32.mp3",
  "./assets/audio/s33.mp3",
  "./assets/audio/s34.mp3",
  "./assets/audio/s35.mp3",
  "./assets/audio/s36.mp3",
  "./assets/audio/s37.mp3",
  "./assets/audio/s38.mp3",
  "./assets/audio/w01_1.mp3",
  "./assets/audio/w01_2.mp3",
  "./assets/audio/w01_3.mp3",
  "./assets/audio/w01_4.mp3",
  "./assets/audio/w01_5.mp3",
  "./assets/audio/w02_1.mp3",
  "./assets/audio/w02_2.mp3",
  "./assets/audio/w02_3.mp3",
  "./assets/audio/w02_4.mp3",
  "./assets/audio/w02_5.mp3",
  "./assets/audio/w03_1.mp3",
  "./assets/audio/w03_2.mp3",
  "./assets/audio/w03_3.mp3",
  "./assets/audio/w03_4.mp3",
  "./assets/audio/w03_5.mp3",
  "./assets/audio/w04_1.mp3",
  "./assets/audio/w04_2.mp3",
  "./assets/audio/w04_3.mp3",
  "./assets/audio/w04_4.mp3",
  "./assets/audio/w04_5.mp3",
  "./assets/audio/w05_1.mp3",
  "./assets/audio/w05_2.mp3",
  "./assets/audio/w05_3.mp3",
  "./assets/audio/w05_4.mp3",
  "./assets/audio/w05_5.mp3",
  "./assets/audio/w06_1.mp3",
  "./assets/audio/w06_2.mp3",
  "./assets/audio/w06_3.mp3",
  "./assets/audio/w06_4.mp3",
  "./assets/audio/w06_5.mp3",
  "./assets/audio/w07_1.mp3",
  "./assets/audio/w07_2.mp3",
  "./assets/audio/w07_3.mp3",
  "./assets/audio/w07_4.mp3",
  "./assets/audio/w07_5.mp3",
  "./assets/audio/w08_1.mp3",
  "./assets/audio/w08_2.mp3",
  "./assets/audio/w08_3.mp3",
  "./assets/audio/w08_4.mp3",
  "./assets/audio/w08_5.mp3",
  "./assets/audio/w09_1.mp3",
  "./assets/audio/w09_2.mp3",
  "./assets/audio/w09_3.mp3",
  "./assets/audio/w09_4.mp3",
  "./assets/audio/w09_5.mp3",
  "./assets/audio/w10_1.mp3",
  "./assets/audio/w10_2.mp3",
  "./assets/audio/w10_3.mp3",
  "./assets/audio/w10_4.mp3",
  "./assets/audio/w10_5.mp3",
  "./assets/audio/w11_1.mp3",
  "./assets/audio/w11_2.mp3",
  "./assets/audio/w11_3.mp3",
  "./assets/audio/w11_4.mp3",
  "./assets/audio/w11_5.mp3",
  "./assets/audio/w12_1.mp3",
  "./assets/audio/w12_2.mp3",
  "./assets/audio/w12_3.mp3",
  "./assets/audio/w12_4.mp3",
  "./assets/audio/w12_5.mp3",
  "./assets/audio/w13_1.mp3",
  "./assets/audio/w13_2.mp3",
  "./assets/audio/w13_3.mp3",
  "./assets/audio/w13_4.mp3",
  "./assets/audio/w13_5.mp3",
  "./assets/audio/w14_1.mp3",
  "./assets/audio/w14_2.mp3",
  "./assets/audio/w14_3.mp3",
  "./assets/audio/w14_4.mp3",
  "./assets/audio/w14_5.mp3",
  "./assets/audio/w15_1.mp3",
  "./assets/audio/w15_2.mp3",
  "./assets/audio/w15_3.mp3",
  "./assets/audio/w15_4.mp3",
  "./assets/audio/w15_5.mp3",
  "./assets/audio/w16_1.mp3",
  "./assets/audio/w16_2.mp3",
  "./assets/audio/w16_3.mp3",
  "./assets/audio/w16_4.mp3",
  "./assets/audio/w16_5.mp3",
  "./assets/audio/w17_1.mp3",
  "./assets/audio/w17_2.mp3",
  "./assets/audio/w17_3.mp3",
  "./assets/audio/w17_4.mp3",
  "./assets/audio/w17_5.mp3",
  "./assets/audio/w18_1.mp3",
  "./assets/audio/w18_2.mp3",
  "./assets/audio/w18_3.mp3",
  "./assets/audio/w18_4.mp3",
  "./assets/audio/w18_5.mp3",
  "./assets/audio/w19_1.mp3",
  "./assets/audio/w19_2.mp3",
  "./assets/audio/w19_3.mp3",
  "./assets/audio/w19_4.mp3",
  "./assets/audio/w19_5.mp3",
  "./assets/audio/w20_1.mp3",
  "./assets/audio/w20_2.mp3",
  "./assets/audio/w20_3.mp3",
  "./assets/audio/w20_4.mp3",
  "./assets/audio/w20_5.mp3",
  "./assets/audio/w21_1.mp3",
  "./assets/audio/w21_2.mp3",
  "./assets/audio/w21_3.mp3",
  "./assets/audio/w21_4.mp3",
  "./assets/audio/w21_5.mp3",
  "./assets/audio/w22_1.mp3",
  "./assets/audio/w22_2.mp3",
  "./assets/audio/w22_3.mp3",
  "./assets/audio/w22_4.mp3",
  "./assets/audio/w22_5.mp3",
  "./assets/audio/w23_1.mp3",
  "./assets/audio/w23_2.mp3",
  "./assets/audio/w23_3.mp3",
  "./assets/audio/w23_4.mp3",
  "./assets/audio/w23_5.mp3",
  "./assets/audio/w24_1.mp3",
  "./assets/audio/w24_2.mp3",
  "./assets/audio/w24_3.mp3",
  "./assets/audio/w24_4.mp3",
  "./assets/audio/w24_5.mp3",
  "./assets/audio/w25_1.mp3",
  "./assets/audio/w25_2.mp3",
  "./assets/audio/w25_3.mp3",
  "./assets/audio/w25_4.mp3",
  "./assets/audio/w25_5.mp3",
  "./assets/audio/w26_1.mp3",
  "./assets/audio/w26_2.mp3",
  "./assets/audio/w26_3.mp3",
  "./assets/audio/w26_4.mp3",
  "./assets/audio/w26_5.mp3",
  "./assets/audio/w27_1.mp3",
  "./assets/audio/w27_2.mp3",
  "./assets/audio/w27_3.mp3",
  "./assets/audio/w27_4.mp3",
  "./assets/audio/w27_5.mp3",
  "./assets/audio/w28_1.mp3",
  "./assets/audio/w28_2.mp3",
  "./assets/audio/w28_3.mp3",
  "./assets/audio/w28_4.mp3",
  "./assets/audio/w28_5.mp3",
  "./assets/audio/w29_1.mp3",
  "./assets/audio/w29_2.mp3",
  "./assets/audio/w29_3.mp3",
  "./assets/audio/w29_4.mp3",
  "./assets/audio/w29_5.mp3",
  "./assets/fonts/hp001/HP001_4_hang_1_o_ly.ttf",
  "./assets/fonts/hp001/HP001_4_hang_2_o_ly.ttf",
  "./assets/fonts/hp001/HP001_4_hang_bold.ttf",
  "./assets/fonts/hp001/HP001_4_hang_normal.ttf",
  "./assets/fonts/hp001/HP001_5_hang_bold.ttf",
  "./assets/fonts/hp001/HP001_5_hang_normal.ttf",
  "./assets/fonts/playwrite-vn.woff2",
  "./assets/images/donate.jpg",
  "./assets/images/icon-180.png",
  "./assets/images/icon-192.png",
  "./assets/images/icon-32.png",
  "./assets/images/icon-512.png",
  "./js/audio.js",
  "./js/data.js",
  "./js/games.js",
  "./js/main.js",
  "./js/pwa.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll(ASSETS);
    } catch (e) {
      await Promise.all(ASSETS.map(function (url) {
        return cache.add(url).catch(function () { });
      }));
    }
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;
  event.respondWith(respond(req));
});

async function respond(req) {
  const cache = await caches.open(CACHE);
  const range = req.headers.get("range");
  const hit = await cache.match(req.url, { ignoreVary: true, ignoreSearch: true });
  if (hit && !range) return hit;
  if (hit && range) {
    const part = await slice(hit, range);
    if (part) return part;
  }
  try {
    const res = await fetch(req);
    if (res && res.ok && !range && req.mode !== "navigate") cache.put(req.url, res.clone());
    return res;
  } catch (e) {
    if (req.mode === "navigate") {
      const page = await cache.match("./index.html", { ignoreVary: true });
      if (page) return page;
    }
    if (hit) return hit;
    return new Response("Offline", { status: 504, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function slice(res, header) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header).trim());
  if (!m || (m[1] === "" && m[2] === "")) return null;
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;
  let start, end;
  if (m[1] === "") {
    start = size - Number(m[2]);
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === "" ? size - 1 : Number(m[2]);
  }
  if (!isFinite(start) || !isFinite(end)) return null;
  if (start < 0) start = 0;
  if (end > size - 1) end = size - 1;
  if (start > end) return null;
  const headers = new Headers(res.headers);
  headers.set("Content-Range", "bytes " + start + "-" + end + "/" + size);
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Accept-Ranges", "bytes");
  return new Response(buf.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers: headers });
}
