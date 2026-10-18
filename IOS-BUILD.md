# 📱 Đóng gói thành app iOS (cài thủ công, chơi offline)

## 1. Vì sao không "copy file rồi cài" được như Android?

iOS **không cho** copy file `.apk`-kiểu rồi cài. Mọi app iOS đều phải được **ký (code signing)**. Cách bạn từng làm trước đây là đúng:

> Tạo app trong Xcode (bọc web bằng WKWebView) → build vào iPhone → vào **Cài đặt → Tin cậy** chứng chỉ → chạy offline.

App như vậy là app thật, **offline 100%** (toàn bộ 175 file mp3 + font + code nằm trong app).

| | Apple ID **miễn phí** | **Apple Developer** 99$/năm |
| --- | --- | --- |
| Số app cài được | 3 app / máy | 100 thiết bị / năm |
| Hạn sử dụng | **7 ngày** (phải ký lại) | **1 năm** |
| TestFlight | ✗ | ✓ |
| Cần cáp nối máy tính | Có (mỗi lần ký lại) | Chỉ lần đầu |

> iPhone của bạn (iOS 27) **không** dùng được TrollStore (chỉ hỗ trợ iOS ≤ 17.0), nên phải ký bằng Apple ID hoặc Apple Developer.

**Không còn Mac cũng vẫn làm được** → dùng **mục 4** (build trên cloud miễn phí của GitHub, ký ngay trên Windows) hoặc **mục 5** (chỉ cần file `.ipa`, ký luôn trên iPhone). Mục 3 chỉ dành cho ai có Mac.

---

## 2. Đã có sẵn trong thư mục game

| File | Việc |
| --- | --- |
| `package.json` | Cấu hình Capacitor 8 + các lệnh npm |
| `capacitor.config.json` | Tên app "Bé Học Chữ", bundle id `vn.behocchu.chucai`, `webDir: www` |
| `tools/build-www.js` | Gom `index.html`, `css/`, `js/`, `assets/` vào thư mục `www/` |
| `.github/workflows/ios.yml` | Build `.ipa` trên cloud (dùng khi **không có Mac**) |
| `.gitignore` | Bỏ qua `node_modules/`, `www/`, `ios/` khi đẩy lên GitHub |

**Cần cài gì?**
- **Có Mac (mục 3):** Node.js 20+ ([nodejs.org](https://nodejs.org)) và **Xcode 16 trở lên**.
- **Không có Mac (mục 4):** máy Windows **không cần** Node.js hay Xcode — chỉ cần **iTunes bản từ apple.com**, **Sideloadly** và tài khoản **GitHub** (đều miễn phí).

---

## 3. Cách 1 — Có Mac + Xcode (giống bạn đã làm)

**Bước 1.** Copy thư mục game sang Mac (AirDrop / USB / Google Drive). Bỏ qua `node_modules`, `www`, `ios` nếu có.

**Bước 2.** Mở Terminal, `cd` vào thư mục game rồi chạy:

```bash
npm install
npm run build:www        # gom web vào www/
npx cap add ios          # tạo project Xcode (chỉ lần đầu)
npx cap sync ios         # copy www vào app
npx cap open ios         # mở Xcode
```

**Bước 3.** Trong Xcode:
- Cột trái chọn project **App** → tab **Signing & Capabilities**
- **Team**: chọn Apple ID của bạn (nếu chưa có: **Xcode → Settings → Accounts → + → Apple ID**)
- **Bundle Identifier**: đổi nếu bị trùng, ví dụ `vn.behocchu.chucai2`
- Cắm iPhone bằng cáp → chọn iPhone ở thanh trên cùng → bấm **▶ Run**

**Bước 4.** Trên iPhone (chỉ lần đầu):
- **Cài đặt → Quyền riêng tư & Bảo mật → Chế độ nhà phát triển → Bật** (máy khởi động lại 1 lần)
- **Cài đặt → Cài đặt chung → VPN & Quản lý thiết bị → tên Apple ID của bạn → Tin cậy**

**Bước 5.** Muốn có file `.ipa` để cài sang máy khác:
- Xcode → **Product → Archive** → **Distribute App → Custom / Development** → Export ra file `.ipa`
- Cài `.ipa` vào iPhone bằng **Apple Configurator** (Mac) hoặc **Sideloadly** (Windows)

**Sau này sửa game thì chạy lại 2 bước:**

```bash
npm run ios:sync
```

rồi mở Xcode bấm **Run** (hoặc `npm run ios:open`).

---

## 4. Cách 2 — **KHÔNG có Mac**: build trên cloud, ký trên Windows

Toàn bộ việc build chạy trên **máy macOS miễn phí của GitHub Actions**. Máy Windows của bạn chỉ dùng để **ký và cài** app vào iPhone.

### 4.1. Chuẩn bị trên Windows (1 lần)

1. Cài **iTunes bản tải từ [apple.com/itunes/download](https://www.apple.com/itunes/download/win64)**.
   ⚠️ **Không** dùng bản iTunes trên Microsoft Store — bản đó thiếu driver `Apple Mobile Device Support` nên Sideloadly sẽ **không nhận ra iPhone**. Đã lỡ cài bản Store thì gỡ ra trước.
2. Cài **Sideloadly**: [sideloadly.io](https://sideloadly.io) — hỗ trợ **iOS 7 → iOS 27+**, Windows 7–11.
3. Tạo tài khoản **GitHub** (miễn phí): [github.com/signup](https://github.com/signup)

### 4.2. Đưa thư mục game lên GitHub (1 lần)

- Cài **GitHub Desktop**: [desktop.github.com](https://desktop.github.com)
- Mở GitHub Desktop → **File → Add local repository** → chọn `D:\MyGame`
  → khi báo "đây không phải Git repository", bấm **create a repository here instead**
- Bấm **Publish repository** → **bỏ tick** ô "Keep this code private" (repo phải **public** thì Actions mới miễn phí) → **Publish**
- `.gitignore` có sẵn sẽ tự bỏ qua `node_modules/`, `www/`, `ios/`

> Repo public nghĩa là code game của bạn công khai. Nếu không muốn, để repo **private**: vẫn miễn phí 2.000 phút/tháng nhưng macOS tính **×10** → khoảng **200 phút macOS** ≈ 20 lần build, vẫn dư dùng.

### 4.3. Build trên cloud

1. Mở repo trên [github.com](https://github.com) → tab **Actions**
2. Chọn **Build iOS IPA** ở cột trái → **Run workflow** → **Run workflow**
3. Đợi ~6–10 phút (có thể xem log trực tiếp). Xong sẽ thấy artifact **BeHocChu-unsigned-ipa** → bấm tải về
4. File tải về là `.zip` → **giải nén** để được `BeHocChu.ipa` (**chưa ký** — đúng như vậy, Sideloadly sẽ ký)

### 4.4. Ký và cài vào iPhone

1. Cắm iPhone vào máy tính bằng cáp → trên iPhone bấm **Tin cậy máy tính này**
2. Mở **Sideloadly** → chọn iPhone ở ô **iDevice** → kéo `BeHocChu.ipa` vào ô **IPA** → nhập **Apple ID** ở ô **Apple account** → **Start**
3. Nhập mật khẩu Apple ID (và mã 2FA nếu có) khi được hỏi
4. Trên iPhone: **Cài đặt → Cài đặt chung → VPN & Quản lý thiết bị → tên Apple ID của bạn → Tin cậy**
5. Nếu app yêu cầu **Chế độ nhà phát triển**: **Cài đặt → Quyền riêng tư & Bảo mật → Chế độ nhà phát triển → Bật** (máy khởi động lại 1 lần)

### 4.5. Về sau

| Việc | Làm gì |
| --- | --- |
| Sửa game | GitHub Desktop → **Commit** → **Push** → workflow tự chạy lại → tải `.ipa` mới → ký lại như 4.4 |
| App hết hạn sau 7 ngày | Mở Sideloadly, cắm cáp, ký lại. Bật **auto-refresh** để tự gia hạn khi PC cùng Wi-Fi |
| Không muốn ký lại | Mua **Apple Developer** 99$/năm rồi ký bằng tài khoản đó trong Sideloadly → app sống **1 năm** |

> Không thích dùng GitHub? Có thể dùng **Codemagic** (miễn phí 500 phút macOS/tháng) hoặc nhờ máy Mac của người quen build 1 lần rồi lấy file `.ipa`. Bản **PWA** (mục 6) thì không cần ký gì cả, chỉ cần host 1 lần.

---

## 5. Cách 3 — Không cần máy tính: ký ngay trên iPhone

Nếu trên iPhone đã có sẵn app cài `.ipa` (Feather, ESign, Scarlet, GBox...), bạn **không cần iTunes hay Sideloadly**. File `.ipa` mà workflow tạo ra (chưa ký, không mã hoá) chính là đầu vào chuẩn cho các app này.

1. Tải `BeHocChu.ipa` từ GitHub Actions về máy tính (xem mục 4.3) → đưa lên **Google Drive**
2. Trên iPhone: mở Drive → tải `BeHocChu.ipa` về (lưu vào **Files**)
3. Mở app cài đặt trên iPhone → chọn `BeHocChu.ipa` → **Sign / Install**
4. Lần đầu cần **Tin cậy** chứng chỉ: **Cài đặt → Cài đặt chung → VPN & Quản lý thiết bị**. Nếu app đòi **Chế độ nhà phát triển**: **Cài đặt → Quyền riêng tư & Bảo mật → Chế độ nhà phát triển → Bật**

⚠️ **Ký bằng gì rất quan trọng — nhất là với máy của bé:**

| Cách ký | Hạn sử dụng | Rủi ro |
| --- | --- | --- |
| **Apple ID của chính bạn** (Feather + Apple ID, hoặc Sideloadly) | 7 ngày (ký lại) | An toàn, không lo gì |
| **Chứng chỉ dùng chung** (ESign / Scarlet / dịch vụ ký sẵn) | Không biết trước | Apple **thu hồi chứng chỉ** → app **biến mất đột ngột**; phải tin tưởng profile bảo mật của bên thứ ba |

**Khuyến nghị:** dùng **Apple ID của bạn** (Feather) chứ đừng dùng chứng chỉ dùng chung. Game này hoàn toàn offline nên nếu chứng chỉ bị thu hồi thì chỉ mất app, nhưng bạn sẽ phải cài lại và loay hoay tìm chứng chỉ mới — phiền hơn nhiều so với việc 7 ngày ký lại một lần.

---

## 6. Lưu ý & khắc phục sự cố

- **App này offline hoàn toàn** — không cần mạng, không cần host. Service worker không dùng trong app native (`js/pwa.js` tự bỏ qua vì địa chỉ là `capacitor://localhost`).
- **Cài xong không nghe thấy tiếng khi điện thoại đang gạt im lặng** → thêm đoạn sau vào `ios/App/App/AppDelegate.swift`, ở đầu hàm `application(_:didFinishLaunchingWithOptions:)`:

```swift
import AVFoundation
// ...
try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
try? AVAudioSession.sharedInstance().setActive(true)
```

- **Màn hình trắng khi mở app** → kiểm tra đã chạy `npm run ios:sync` chưa (bước này tự vá CSP cho scheme `capacitor://` của app). Nếu vẫn trắng, mở `www/index.html` xem dòng `Content-Security-Policy` đã có `capacitor:` chưa.

- **Xcode báo lỗi signing** → kiểm tra đã chọn **Team** chưa, và Bundle Identifier phải là duy nhất (thêm số vào cuối nếu trùng).
- **App biến mất sau 7 ngày** → đúng như dự phòng: cắm cáp, mở project, bấm **Run** lại là xong (game lưu tiến độ bằng `sessionStorage` nên không ảnh hưởng).
- **Muốn cài lâu dài không phải ký lại** → mua **Apple Developer Program** (99$/năm), sau đó chọn team đó trong Xcode; app sống 1 năm.

---

## 7. Vẫn giữ được bản web/PWA

Bản app native và bản web **dùng chung một thư mục game**, không phải sửa gì:
- Chơi trên máy tính: mở thẳng `index.html`
- Chơi trên iPhone không cần cài app: đưa lên host HTTPS → Safari → **Thêm vào Màn hình chính** (xem mục 4 của `HUONG-DAN.md`)
- Chơi trên iPhone dạng app thật: làm theo file này
