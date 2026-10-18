# 📝 Ghi chú lệnh — Học Chữ Cái Tiếng Việt

> Yêu cầu: **Node.js 18 trở lên** (kiểm tra bằng `node -v`). Mở terminal tại thư mục game: `D:\MyGame`.

---

## 1. Lệnh hay dùng

| Việc cần làm | Lệnh |
| --- | --- |
| Tạo audio còn thiếu (chỉ tạo file chưa có) | `node tools/gen-audio.js` |
| Tạo lại **toàn bộ** audio | `node tools/gen-audio.js --force` |
| Kiểm tra từ gây nhiễu (nên < 1%) | `node tools/check-words.js` |
| **Làm mới cache offline** (chạy sau mỗi lần sửa file) | `node tools/gen-sw.js` |
| Kiểm tra cú pháp 1 file JS | `node --check js/games.js` |
| Gom web vào `www/` (để đóng gói app iOS) | `npm run build:www` |
| Tạo project Xcode (chỉ lần đầu, cần Mac) | `npx cap add ios` |
| Đồng bộ web mới vào app iOS | `npm run ios:sync` |
| Mở Xcode | `npm run ios:open` |

> 📱 Đóng gói thành **app iOS cài thủ công** (Xcode hoặc build trên cloud): xem file **`IOS-BUILD.md`**.

> ⚠️ `node tools/gen-audio.js` **cần mạng Internet** (lấy giọng đọc từ Google Dịch). Chơi game thì **không cần mạng**.
> File mp3 nhỏ hơn 500 bytes bị coi là lỗi và sẽ được tạo lại ở lần chạy sau.

---

## 2. Sửa thường gặp

### 2.1. Đổi từ của một chữ cái
1. Mở `js/data.js`, sửa từ ở dòng của chữ đó.
2. Xoá file audio của từ bị thay: `assets/audio/wNN_k.mp3`
   *(NN = số của chữ, k = thứ tự từ 1–5 — xem bảng ở mục 3)*
   ```powershell
   Remove-Item assets\audio\w20_1.mp3
   ```
3. `node tools/gen-audio.js`
4. `node tools/check-words.js` — xem tỉ lệ gây nhiễu có tăng không.
5. `node tools/gen-sw.js`
6. Upload lại (mục 4).

### 2.2. Đổi cách đọc của chữ cái
Sửa `LETTER_SOUND` trong `js/data.js` → xoá `assets/audio/lNN.mp3` của chữ đó → `node tools/gen-audio.js` → `node tools/gen-sw.js`.

### 2.3. Thêm chữ mới hoặc đổi thứ tự bảng chữ cái
⚠️ Số hiệu file audio tính theo **vị trí** trong `ALPHABET`, nên mọi chữ từ vị trí thay đổi trở đi sẽ lệch số. Cách an toàn:
```powershell
Remove-Item assets\audio\*.mp3
node tools/gen-audio.js
node tools/gen-sw.js
```

### 2.4. Sửa CSS / JS / HTML
```powershell
node tools/gen-sw.js
```
Rồi upload lại. *(Chỉ mở `index.html` trực tiếp trên máy tính thì không cần bước này.)*

### 2.5. Đổi icon hoặc tên app
- Icon: `assets/images/icon-32.png`, `icon-180.png`, `icon-192.png`, `icon-512.png`
- Tên app: `manifest.webmanifest` (`name`, `short_name`, `theme_color`)
- Sau đó: `node tools/gen-sw.js`

---

## 3. Audio đánh số thế nào?

| File | Ý nghĩa |
| --- | --- |
| `lNN.mp3` | Âm đọc của chữ cái ở vị trí `NN` |
| `wNN_k.mp3` | Từ thứ `k` (1–5) của chữ cái ở vị trí `NN` |
| `p01.mp3` | Câu "Bé còn đó không?" (chế độ Nghe) |

Bảng vị trí:

| NN | Chữ | NN | Chữ | NN | Chữ | NN | Chữ | NN | Chữ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | A | 07 | Đ | 13 | K | 19 | Ơ | 25 | U |
| 02 | Ă | 08 | E | 14 | L | 20 | **P** | 26 | Ư |
| 03 | Â | 09 | Ê | 15 | M | 21 | Q | 27 | V |
| 04 | B | 10 | G | 16 | N | 22 | R | 28 | X |
| 05 | C | 11 | H | 17 | O | 23 | S | 29 | **Y** |
| 06 | D | 12 | I | 18 | Ô | 24 | T |  |  |

*Ví dụ:* chữ **P** là vị trí **20** → từ thứ 1 là `w20_1.mp3`, từ thứ 4 là `w20_4.mp3`.

---

## 4. Xuất bản lên web / cài lên iPhone

```powershell
node tools/gen-sw.js
```

1. Upload **cả thư mục game** (gồm `index.html`, `manifest.webmanifest`, `sw.js`, `css/`, `js/`, `assets/`) lên host tĩnh có **HTTPS**:
   - Dễ nhất: [app.netlify.com/drop](https://app.netlify.com/drop) hoặc Cloudflare Pages — kéo thả cả thư mục.
   - Hoặc GitHub Pages.
2. Trên iPhone mở bằng **Safari** (không phải Chrome) → nút **Chia sẻ** → **Thêm vào Màn hình chính**.
3. Mở từ màn hình chính: chạy toàn màn hình như app và **chơi được offline**.

**Cập nhật bản mới:** chạy `node tools/gen-sw.js` → upload lại → mở app lúc có mạng (có thể phải mở 2 lần) là tự nhận bản mới.

> Không thể copy thư mục vào iPhone rồi mở `file://` — service worker chỉ chạy trên HTTPS.

---

## 5. Quy tắc khi thêm từ vào `js/data.js`

- Từ phải **chứa** chữ cái đang học (không nhất thiết bắt đầu bằng chữ đó), ví dụ chữ **I** → "Vịt", "Kính".
- Mỗi chữ cái giữ **5 từ**, mỗi từ kèm 1 emoji.
- Tránh dùng **emoji trùng** với từ khác (nhất là trong cùng một chữ cái).
- Tránh từ tiếng nước ngoài (Pizza, Panda, Piano, Yoyo…).
- Sửa xong luôn chạy: `node tools/check-words.js` rồi `node tools/gen-sw.js`.

---

## 6. Kiểm tra nhanh trước khi phát hành

```powershell
node --check js/data.js; node --check js/audio.js; node --check js/games.js; node --check js/main.js; node --check js/pwa.js
node tools/check-words.js
node tools/gen-sw.js
```

- [ ] Mở `index.html`, thử đủ 6 chế độ: Học Chữ Cái · Chọn Hình Theo Chữ · Nghe & Chọn Chữ · Nối Từ · Luyện Viết Chữ · Luyện Viết Chữ Đẹp
- [ ] Cả màn hình dọc và màn hình ngang đều không bị cuộn
- [ ] `node tools/check-words.js` báo tỉ lệ thấp (0–1%)
- [ ] Đã chạy `node tools/gen-sw.js` sau lần sửa cuối cùng
- [ ] Nếu build app iOS: đã chạy `npm run ios:sync` (lệnh này tự gọi `build:www`)

---

## 7. Đóng gói thành app iOS (cài thủ công, chơi offline)

Xem hướng dẫn chi tiết trong **`IOS-BUILD.md`**. Tóm tắt:

| Việc | Lệnh / Cách làm |
| --- | --- |
| Có Mac + Xcode | `npm install` → `npm run build:www` → `npx cap add ios` → `npm run ios:sync` → `npm run ios:open` → chọn Team rồi bấm **Run** |
| Không có Mac | Đẩy lên repo GitHub public → tab **Actions** → **Build iOS IPA** → tải `.ipa` → ký bằng **Sideloadly** trên Windows (cần iTunes bản từ **apple.com**, không phải bản Microsoft Store) |
| Sau mỗi lần sửa game | `npm run ios:sync` rồi build lại |

- App native **offline 100%**, không cần host, không cần mạng (khác bản PWA).
- Apple ID **miễn phí** → app hết hạn sau **7 ngày**, phải ký lại (tối đa 3 app/máy).
- **Apple Developer** 99$/năm → app sống **1 năm**.
- iOS 27 **không** dùng được TrollStore (chỉ hỗ trợ iOS ≤ 17.0).
