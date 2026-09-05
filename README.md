# 🚀 SMART ORDER BUTTON PLATFORM — IoT Quick-Reorder Ecosystem
> *"Một nút bấm vật lý — Đặt đúng thứ cần, đúng lúc, chuẩn xác tức thì."*

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-3--Tier%20IoT%20SaaS-06B6D4?style=for-the-badge&logo=iot&logoColor=white" alt="IoT Architecture" />
  <img src="https://img.shields.io/badge/Security-HMAC--SHA256%20Edge%20Gate-10B981?style=for-the-badge&logo=shield&logoColor=white" alt="HMAC Security" />
  <img src="https://img.shields.io/badge/Hardware-ESP32%20%7C%20Deep%20Sleep%20%3C15%C2%B5A-3B82F6?style=for-the-badge&logo=espressif&logoColor=white" alt="ESP32 Firmware" />
  <img src="https://img.shields.io/badge/Design%20System-UI%2FUX%20Pro%20Max%20(Tech%20Luxury)-8B5CF6?style=for-the-badge&logo=figma&logoColor=white" alt="UI UX Pro Max" />
  <img src="https://img.shields.io/badge/Realtime-Socket.io%20WebSocket-F59E0B?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO" />
</p>

---

## 📖 Giới Thiệu Tổng Quan

**Smart Order Button Platform** là hệ sinh thái thương mại điện tử IoT hoàn chỉnh kết nối nút bấm vật lý thông minh (*tương tự Amazon Dash Button thế hệ mới*) trực tiếp giữa người tiêu dùng / hộ gia đình / văn phòng với các đại lý phân phối hàng hóa thiết yếu:
- 💧 **Bình Nước Khoáng 20L** (Lavie, Vĩnh Hảo, Miru, Aquafina)
- 🔥 **Bình Gas 12kg** (Petrolimex, Saigon Petro, Gia Đình Gas)
- 🌾 **Gạo Đặc Sản** (ST25 Ông Cua, Lài Miên 5-10kg)
- 🥛 **Sữa Tươi & Hàng Tiêu Dùng Định Kỳ** (Vinamilk, TH True MILK 48 hộp)

Hệ thống loại bỏ hoàn toàn rào cản mở ứng dụng, tìm kiếm hay gọi điện thoại mỗi khi hết hàng — chỉ với **1 cú nhấn nút vật lý**, đơn hàng được khởi tạo, trừ tạm tồn kho, phát tín hiệu thời gian thực đến màn hình POS của đại lý và kích hoạt giao hàng trong tích tắc.

---

## 💎 Thiết Kế Chuẩn UI/UX Pro Max (Tech Luxury & IoT Engineering)

Dự án được tích hợp bộ kỹ năng thiết kế **UI/UX Pro Max** ([.agents/skills/ui-ux-pro-max/](file:///.agents/skills/ui-ux-pro-max/SKILL.md)) với hệ thống thiết kế độc bản tại [design-system/smartorderiot/MASTER.md](file:///design-system/smartorderiot/MASTER.md):

* **Chủ đề**: Kỹ thuật Công nghệ cao & Sang trọng (*Tech Luxury / Cyber-Industrial / Clean Engineering*).
* **Bảng màu chủ đạo**: Deep Slate / Cyber Navy (`#070A13`, `#0F172A`), Cyan Glow (`#06B6D4`), Electric Emerald (`#10B981`), Cobalt Blue (`#2563EB`).
* **Kiểu chữ chuyên nghiệp**: **Plus Jakarta Sans** cho giao diện điều hành và **JetBrains Mono** cho telemetry phần cứng (MAC, IP, RSSI, PIN, Nonce, HMAC Hash).
* **Hiệu ứng độc bản**:
  - Hoa văn lưới vi mạch nền `.telemetry-grid`.
  - Kính mờ bán trong suốt cao cấp `.glass-panel` (*frosted glass 16px blur*).
  - Vành kim loại phay xước 3D `.hardware-bezel`.
  - Nút bấm cơ học 3D siêu thực với phản hồi âm thanh tactile qua **Web Audio API** (không cần file mp3 ngoài).
  - Vòng đèn LED RGB 4 pha trạng thái: *Standby (<15µA) → Bắt tay Wi-Fi (Cyan) → Ký HMAC & Gửi gói tin (Amber) → Đơn thành công & Pháo hoa (Emerald)*.
* **Hỗ trợ Chế độ Tối / Sáng (Dual Theme)**: Đồng bộ hoàn hảo giữa Dark Mode và Light Mode đạt chuẩn độ tương phản WCAG 4.5:1.

---

## 🏛️ Kiến Trúc Hệ Thống 3 Lớp (3-Tier Production Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           1. HARDWARE & EDGE LAYER                              │
│                                                                                 │
│   [ESP32 / ESP8266 Firmware]  ──(RTC GPIO Wake 8ms)──►  [HMAC-SHA256 Signer]     │
│   • Deep Sleep < 15µA (Pin LiPo 12-18 tháng)            • Nonce + Timestamp     │
│   • Single Press: Đặt hàng                              • Zero Private Key Leak │
│   • Double Press: Hủy đơn 60s                           • Wi-Fi / SoftAP Prov   │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ HTTP/POST (x-signature, x-nonce)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    2. NESTJS ENTERPRISE CLOUD CORE (backend/)                   │
│                                                                                 │
│   [Crypto Gatekeeper]  ──►  [Anti-Spam & Idempotency]  ──►  [Order State Engine]│
│   • Xác thực HMAC           • Chống double click            • Giữ kho tạm thời  │
│   • Chống Replay Attack     • Cửa sổ hủy 60s                • Prisma ORM        │
│                                                             • SQLite / Postgres │
│   [Realtime WebSocket Gateway] (Socket.io) ───────────────────────────────────┐ │
└───────────────────────────────────────┬───────────────────────────────────────┼─┘
                                        │                                       │
                                        ▼ Live Push Feed                        │ WebSocket
┌───────────────────────────────────────────────────────────────────────────────┴─┐
│                       3. CLIENT APPLICATIONS & COCKPITS                         │
│                                                                                 │
│   [Web Frontend - React 18 + Vite]        [Mobile App - React Native Expo]      │
│   • Landing Page 3D Button Showcase       • Native QR Code Scanner Pairing      │
│   • ESP32 Hardware Simulator Lab          • 1-Tap Reorder & Telemetry           │
│   • Store Operations Live Dashboard       • Push Notifications                  │
│   • Device Fleet & Inventory Manager      • Floating 60s Cancel Window          │
│   • Customer "Nút Bấm Của Tôi" Portal                                           │
│   • Super Admin Security Hub & Audit Logs                                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Điểm Nhấn Tính Năng Chi Tiết

### 1. 🛠️ ESP32 Hardware Simulator Lab (`/simulator`)
- **Buồng lái phần cứng trực quan**: Mô phỏng vi điều khiển ESP32 vật lý với màn hình OLED hiển thị thông số điện áp LiPo (3.3V - 4.2V), mức pin %, Wi-Fi RSSI dBm và trạng thái Socket.
- **Tương tác đa cấp độ**:
  - `Single Click`: Kích hoạt ngắt RTC, bắt tay Wi-Fi, tự tính toán chữ ký **HMAC-SHA256** qua Web Crypto API và gửi gói tin.
  - `Double Click`: Gửi yêu cầu hủy đơn tức thì trong cửa sổ 60s.
- **Serial Monitor 115200 Baud**: Cửa sổ dòng lệnh UART thời gian thực với mã màu phân tách trạng thái (*Sleep, WiFi, HMAC, Cloud Confirm, Error*).
- **Packet Inspector**: Bóc tách chi tiết toàn bộ HTTP Headers (`x-device-id`, `x-timestamp`, `x-nonce`, `x-signature`) và Body Payload JSON.
- **Mô phỏng sự cố (Fault Injection)**: Thanh trượt mức pin và công tắc ngắt mạng Wi-Fi để kiểm thử hành vi vi điều khiển.

### 2. 🏪 Bộ Ứng Dụng Quản Lý Trạm Cửa Hàng (`/store/*`)
- **Live Order Stream**: Báo động đơn hàng thời gian thực với banner neon phát sáng và âm thanh chuông ngân kỹ thuật số.
- **Quy trình xử lý đơn 1 chạm**: `CHỜ XÁC NHẬN` ➔ `ĐÃ TIẾP NHẬN` ➔ `ĐANG CHUẨN BỊ` ➔ `ĐANG GIAO HÀNG` ➔ `HOÀN THÀNH`.
- **Biểu đồ doanh thu Recharts**: Phân tích xu hướng đặt hàng 7 ngày gần nhất với đồ thị Area Chart gradient Cyan/Indigo.
- **Quản lý Đội Thiết Bị (Fleet Manager)**: Theo dõi tình trạng pin, độ mạnh sóng Wi-Fi dBm, trạng thái hoạt động, và modal kích hoạt nút mới qua **Claim Code**.
- **Quản lý Kho Hàng (Inventory)**: Cảnh báo tồn kho thấp, theo dõi hàng đang giữ tạm cho đơn hàng và nút điều chỉnh số lượng nhanh.

### 3. 📱 Cổng Khách Hàng Cuối (`/customer/home`)
- **"Nút Bấm Của Bạn"**: Thẻ thiết bị sắc nét, hiển thị sản phẩm liên kết, mức pin, trạng thái trực tuyến và nút đặt nhanh 1 chạm trên web.
- **Cửa Sổ Hủy Đơn Miễn Phí 60 Giây**: Modal chúc mừng nổi bật kèm đồng hồ đếm ngược tự động và tiến trình Radial Progress. Khách hàng có thể hủy đơn bằng nút bấm trên web hoặc **nhấn đúp 2 lần trên nút ESP32**.
- **Lịch sử đơn hàng**: Theo dõi trạng thái vận chuyển và hóa đơn theo thời gian thực.

### 4. 🛡️ Cổng Quản Trị Hệ Thống Super Admin (`/admin/dashboard`)
- **Thống kê toàn mạng**: Tổng số trạm đại lý, số lượng nút bấm IoT đang phát sóng, tổng lượt đặt hàng và doanh thu toàn sàn.
- **Xét duyệt đại lý mới**: Tiếp nhận hồ sơ đăng ký mở trạm, kiểm tra thông tin pháp lý và phê duyệt mở bán hoặc từ chối kèm lý do.
- **Nhật ký kiểm toán (Audit Logs)**: Ghi nhận toàn bộ thao tác hệ thống, thay đổi cấu hình nút bấm và dữ liệu vi điều khiển.

---

## 💻 Tech Stack Chi Tiết

| Thành Phần | Công Nghệ & Thư Viện |
| :--- | :--- |
| **Frontend Web** | React 18, Vite 6, TypeScript, Tailwind CSS 3.4 (`darkMode: 'class'`), Lucide Icons, Recharts, Canvas Confetti, Web Audio API |
| **Backend Core** | NestJS 10, TypeScript, Prisma ORM 5, Socket.io, JWT, Passport, Class-Validator, Zod, Helmet |
| **Cơ Sở Dữ Liệu** | SQLite (`dev.db` - chạy ngay không cần cài DB ngoài) / PostgreSQL 15 (Production Docker) |
| **Mobile App** | React Native, Expo, React Navigation, Socket.io Client |
| **Firmware IoT** | C/C++ PlatformIO / Arduino IDE, ESP32, ESP8266, FreeRTOS, mbedTLS (HMAC-SHA256), RTC GPIO Interrupt |
| **Design System** | UI/UX Pro Max 2.0 (`.agents/skills/ui-ux-pro-max/`), Plus Jakarta Sans, JetBrains Mono |

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

### 1. Khởi Chạy Backend (NestJS Server)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
> Server khởi chạy tại: **`http://localhost:5000/api`** *(Database SQLite đã được tự động seed sẵn)*.

### 2. Khởi Chạy Frontend (Vite React Web)
```bash
cd frontend
npm install
npm run dev
```
> Web mở tại: **`http://localhost:5173`** *(Tự động kết nối API & WebSocket tới Backend)*.

### 3. Khởi Chạy Mobile App (React Native Expo)
```bash
cd mobile
npm install
npm start
```

### 4. Khởi Chạy Simulator CLI (Console Hardware Mock)
```bash
cd simulator
npm install
npx tsx src/cli.ts
```
> Phím tắt CLI: `[1]` Bấm 1 lần kích hoạt lên, `[2]` Bấm 2 lần đặt hàng / hủy đơn, `[3]` Giữ 5s đổi Wi-Fi, `[4]` Nhập Wi-Fi mới, `[c]` Xem menu.

### 5. Thao Tác Nút Bấm Vật Lý (Gestures Specification)
- **Bấm 1 lần (Single Press)**: Kích hoạt thiết bị lên (thức dậy từ Deep Sleep, đèn LED báo sẵn sàng).
- **Bấm 2 lần (Double Press)**:
  - Nếu chưa có đơn: **Đặt hàng ngay!** (Cửa sổ 60 giây hủy đơn bắt đầu).
  - Nếu vừa đặt đơn trong 60 giây: **Hủy đơn hàng ngay lập tức!**
- **Giữ nút 5 giây (Hold 5s)**:
  - Bật chế độ cấu hình lại mạng Wi-Fi (Đèn LED nháy màu xanh dương).
  - Nhập mã PIN nút trên Web/App $\rightarrow$ Đổi Wi-Fi trực tiếp 1 chạm, đèn LED chuyển sang màu xanh lá tức thì (bảo toàn 100% quyền sở hữu & sản phẩm, không cần truy cập 192.168.4.1).

### 6. Chạy Toàn Bộ Qua Docker Compose
```bash
docker-compose up --build -d
```

---

## 🔑 Tài Khoản Mẫu Trải Nghiệm (Demo Credentials)

> Tất cả tài khoản demo sử dụng mật khẩu chung: **`Password123!`**  
> *(Tại trang đăng nhập [http://localhost:5173/login](http://localhost:5173/login), bạn có thể bấm chọn nhanh 1 chạm vào các nút chức năng)*

| Vai Trò | Email Đăng Nhập | Nhiệm Vụ & Màn Hình Trải Nghiệm |
| :--- | :--- | :--- |
| **Chủ Cửa Hàng** | `store@smartorder.local` | Quản lý live orders, chuyển trạng thái đơn, biểu đồ doanh thu, cấu hình thiết bị |
| **Khách Hàng** | `customer@smartorder.local` | Xem "Nút Bấm Của Tôi", đặt hàng 1 chạm, theo dõi cửa sổ hủy đơn 60 giây |
| **Super Admin** | `admin@smartorder.local` | Xét duyệt mở trạm đại lý mới, xem telemetry thiết bị toàn hệ thống, audit logs |
| **Kỹ Thuật Viên** | `tech@smartorder.local` | Chẩn đoán vi điều khiển, phân tích RSSI và mức pin LiPo |

---

## 🔐 Đặc Tả Bảo Mật Phần Cứng & Giao Thức Mạng

1. **Chữ ký điện tử HMAC-SHA256**:
   - Gói tin gửi từ nút bấm được ký bằng công thức:
     $$\text{Signature} = \text{HMAC-SHA256}(\text{SecretKey}, \text{DeviceId} + \text{":"} + \text{Timestamp} + \text{":"} + \text{Nonce} + \text{":"} + \text{PayloadBody})$$
   - Secret Key được lưu độc bản trong vùng nhớ an toàn (NVS Flash mã hóa), không bao giờ truyền qua mạng.
2. **Chống Tấn Công Ghi Lại (Anti-Replay Attack)**:
   - Mỗi gói tin bắt buộc đi kèm chuỗi ngẫu nhiên `x-nonce`. Server lưu vết nonce trong bộ nhớ đệm và từ chối mọi yêu cầu trùng lặp.
3. **Kiểm Soát Trôi Thời Gian (Clock Drift Guard)**:
   - Header `x-timestamp` bắt buộc nằm trong dung sai $\pm 300\text{s}$ so với đồng hồ Cloud NTP.
4. **Cơ Chế Chống Spam Đơn Lặp (Anti-Spam Idempotency)**:
   - Nếu khách hàng bấm liên tục trong vòng 30 giây, vi xử lý và Cloud sẽ kích hoạt cờ throttle, ngăn ngừa tạo đơn trùng lặp.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
ButtonAmazon/
├── .agents/                    # Customization Root chứa Skill UI/UX Pro Max
│   └── skills/ui-ux-pro-max/   # 79 styles, 192 reasoning rules, search.py
├── backend/                    # NestJS Cloud Core & Realtime Engine
│   ├── prisma/                 # Schema & SQLite/Postgres DB migration
│   ├── src/                    # 20 Module nghiệp vụ (IoT, Orders, Auth, RBAC)
│   └── tests/                  # Bộ test tự động (HMAC, anti-spam, replay)
├── design-system/              # Design System Master File sinh từ ui-ux-pro-max
│   └── smartorderiot/MASTER.md # Tiêu chuẩn màu sắc, font chữ, hiệu ứng
├── docker/                     # Dockerfiles cho Backend & Frontend
├── docs/                       # Tài liệu phần cứng, Power Budget, BLE & Wi-Fi Provisioning
├── firmware/                   # Mã nguồn C/C++ Arduino/PlatformIO cho ESP32
│   └── SmartOrderButton/       # State machine, RTC interrupt, HMAC crypto, BLE Provisioning
├── frontend/                   # React 18 + Vite + Tailwind Tech Luxury Web UI
│   ├── src/pages/              # LandingPage, Simulator, Store, Customer, Security Hub
│   ├── src/layouts/            # Navbar, Sidebar kính mờ xuyên thấu
│   └── src/components/         # AnalyticsChart, IoT UI elements
├── mobile/                     # React Native Expo Mobile App (Zero-Touch Provisioning Wizard)
└── simulator/                  # Công cụ giả lập phần cứng ESP32 trên CLI (Zero-Touch CLI)
```

---

## 🚀 Hệ Thống Zero-Touch Device Provisioning v3.0

Nền tảng đã đạt chuẩn thương mại tiêu dùng (**Consumer Out-of-the-Box Experience**) với quy trình thiết lập trong chưa đầy 3 phút:

```text
MUA THIẾT BỊ ──> QUÉT QR TEM HỘP ──> BLE / SOFTAP TỰ ĐỘNG ──> CHỌN WI-FI NHÀ ──> BOOTSTRAP CLOUD (HMAC) ──> KHÁCH HÀNG CLAIM ──> BẤM ĐẶT HÀNG TỨC THÌ
```

### 🔒 Nguyên Tắc Bảo Mật Cốt Lõi:
1. **Mật Khẩu Wi-Fi Tuyệt Đối Cục Bộ**: Mật khẩu Wi-Fi của khách hàng **chỉ truyền trực tiếp qua Bluetooth BLE / SoftAP** giữa điện thoại và ESP32, **KHÔNG BAO GIỜ gửi lên máy chủ Cloud**.
2. **Khóa Bí Mật HMAC Không Lộ**: QR payload chỉ chứa token ghép nối tạm thời (`SOBPAIR://setup?device=SOB-XXXXXX&token=...&v=1`). Không bao giờ chứa khóa HMAC bí mật.
3. **Phiên Ghép Nối Giới Hạn Thời Gian**: Mỗi phiên pairing tự động hết hạn sau 10 phút và chỉ được sử dụng đúng 1 lần (`Single-use Token Hash`).
4. **Cloud Bootstrap Outbound**: ESP32 chỉ tạo kết nối đi (Outbound) tới Cloud có kèm chữ ký `HMAC-SHA256(Secret, DeviceId:Timestamp:Nonce:Payload)`. Khách hàng không cần mở port router hay NAT.
5. **Cổng Giám Sát An Ninh (Security Hub)**: Truy cập tại `/admin/security/devices` để theo dõi các nỗ lực tấn công Replay, sai chữ ký và mã pairing bất hợp lệ.

---

## 🧪 Chạy Kiểm Tra Tự Động Toàn Diện

```bash
# 1. Kiểm tra toàn diện Zero-Touch Provisioning & Onboarding (13 Tests)
npx tsx tests/zero-touch-provisioning.test.ts

# 2. Kiểm tra Cấu hình Thiết bị & Ánh xạ SKU Động (12 Tests)
npx tsx tests/device-config-product-mapping.test.ts

# 3. Kiểm tra Bảo mật HMAC-SHA256 & Vòng đời Đơn hàng (8 Tests)
npx tsx tests/api.test.ts
```

---

## 📜 Bản Quyền & Giấy Phép

Dự án được xây dựng và bảo hộ theo tiêu chuẩn thương mại điện tử IoT.  
Mọi thắc mắc kỹ thuật hoặc yêu cầu tích hợp giải pháp phần cứng vui lòng liên hệ đội ngũ phát triển.
