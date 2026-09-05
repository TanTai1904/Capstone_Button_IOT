# 🚀 SMART ORDER BUTTON PLATFORM — IoT Quick-Reorder Ecosystem
> *"Một nút bấm vật lý — Đặt đúng thứ cần, đúng lúc, chuẩn xác tức thì."*

<p align="center">
  <img src="https://img.shields.io/badge/Backend-NestJS%20%7C%20Prisma%20%7C%20Socket.IO-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="Backend NestJS" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="Frontend React" />
  <img src="https://img.shields.io/badge/Mobile-Flutter%20%7C%20Dart-02569B?style=for-the-badge&logo=flutter&logoColor=white" alt="Mobile Flutter" />
  <img src="https://img.shields.io/badge/Hardware-ESP32%20%7C%20C%2B%2B%20%7C%20FreeRTOS-E7352C?style=for-the-badge&logo=espressif&logoColor=white" alt="Hardware ESP32" />
  <img src="https://img.shields.io/badge/Security-HMAC--SHA256%20Edge%20Gate-10B981?style=for-the-badge&logo=shield&logoColor=white" alt="HMAC Security" />
</p>

---

## 📖 Giới Thiệu Hệ Sinh Thái

**Smart Order Button Platform** là hệ sinh thái thương mại điện tử IoT hoàn chỉnh kết nối nút bấm phần cứng thông minh (*tương tự Amazon Dash Button thế hệ mới*) trực tiếp giữa người tiêu dùng / hộ gia đình / văn phòng với các đại lý phân phối hàng hóa thiết yếu:
- 💧 **Bình Nước Khoáng 20L** (Lavie, Vĩnh Hảo, Miru, Aquafina)
- 🔥 **Bình Gas 12kg** (Petrolimex, Saigon Petro, Gia Đình Gas)
- 🌾 **Gạo Đặc Sản** (ST25 Ông Cua, Lài Miên 5-10kg)
- 🥛 **Sữa Tươi & Hàng Tiêu Dùng Định Kỳ** (Vinamilk, TH True MILK 48 hộp)

Hệ thống loại bỏ hoàn toàn rào cản mở ứng dụng, tìm kiếm hay gọi điện thoại mỗi khi hết hàng — chỉ với **1 cú nhấn nút vật lý**, đơn hàng được khởi tạo, trừ tạm tồn kho, phát tín hiệu thời gian thực đến màn hình POS của đại lý và kích hoạt giao hàng trong tích tắc.

---

## 🏛️ Kiến Trúc Hệ Thống 4 Trụ Cột (4 Core Pillars)

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        1. HARDWARE LAYER (/hardware)                            │
│                                                                                 │
│   [ESP32 / ESP8266 IoT Button] ──(RTC GPIO Wake 8ms)──► [HMAC-SHA256 Signer]     │
│   • Deep Sleep < 15µA (Pin LiPo 12-18 tháng)            • Nonce + Timestamp     │
│   • Single Click: Wake / Telemetry                      • Zero Private Key Leak │
│   • Double Click: Tạo đơn / Hủy 60s                     • Wi-Fi 1-Tap Config    │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │ HTTP/POST (x-signature, x-nonce)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       2. BACKEND CLOUD CORE (/backend)                          │
│                                                                                 │
│   [Crypto Gatekeeper]  ──►  [Anti-Spam & Idempotency]  ──►  [Order State Engine]│
│   • Xác thực HMAC-SHA256    • Chống click lặp               • Giữ kho tạm thời  │
│   • Chống Replay Attack     • Cửa sổ hủy 60s                • Prisma ORM        │
│                                                             • SQLite / Postgres │
│   [Realtime WebSocket Gateway] (Socket.io) ───────────────────────────────────┐ │
└───────────────────────┬───────────────────────────────────────────────┬───────┼─┘
                        │ HTTP REST API                                 │       │ Live Push Feed
                        ▼                                               ▼       │ (Socket.io)
┌───────────────────────────────────────────────┐ ┌─────────────────────────────┴─┐
│         3. WEB FRONTEND (/frontend)           │ │        4. MOBILE APP (/mobile)       │
│                                               │ │                                      │
│   • Landing Page 3D Button Tech-Luxury        │ │   • Flutter Android / iOS / Chrome   │
│   • Live POS Store Operations Dashboard       │ │   • Quét mã QR Claim & Cài Wi-Fi     │
│   • Quản lý kho hàng & Quản lý đội nút bấm    │ │   • 1-Tap Reorder & Theo dõi đơn     │
│   • Portal Khách hàng & Cài Wi-Fi 1-Chạm      │ │   • Đếm ngược cửa sổ hủy 60s         │
│   • Super Admin Security Hub & Audit Logs     │ │   • Telemetry pin & sóng RSSI        │
└───────────────────────────────────────────────┘ └──────────────────────────────────────┘
```

---

## 📂 Cấu Trúc Thư Mục Chuẩn Hóa

Dự án được phân chia gọn gàng thành **4 phân hệ chính**:

```
Capstone_Button_IOT/
├── 🖥️ backend/             # [BE] NestJS Cloud API, Prisma ORM, Socket.IO, HMAC Security
├── 🌐 frontend/            # [FE] React 18, Vite, Tailwind CSS (Dual Theme Light/Dark)
├── 📱 mobile/              # [MOBILE] Flutter App (Android, iOS, Web Chrome, Windows)
├── ⚡ hardware/            # [PHẦN CỨNG] ESP32 C/C++ PlatformIO / Arduino IDE Firmware
│
├── 🐳 docker/              # Dockerfiles cho Backend & Frontend
├── 📖 docs/                # Tài liệu kỹ thuật, Power Budget, Zero-Touch Provisioning
├── 📜 docker-compose.yml   # Khởi chạy toàn bộ hệ thống (PostgreSQL, Backend, Frontend)
├── ⚙️ .gitignore           # Cấu hình bỏ qua thư viện và file nhạy cảm
└── 🚀 run_project.bat      # Script 1-click khởi chạy đồng thời Backend + Frontend
```

---

## 💻 Tech Stack Chi Tiết

| Phân Hệ | Công Nghệ & Thư Viện | Nhiệm Vụ |
| :--- | :--- | :--- |
| **🖥️ Backend** | NestJS 10, TypeScript, Prisma ORM 5, Socket.io, JWT, Class-Validator, Zod | Xử lý API, xác thực chữ ký HMAC-SHA256, máy trạng thái đơn hàng, chống Replay Attack |
| **🌐 Frontend** | React 18, Vite 6, TypeScript, Tailwind CSS 3.4, Lucide Icons, Recharts | Dashboard quản lý trạm, POS đơn hàng realtime, Cài Wi-Fi nút bấm 1-chạm, Security Hub |
| **📱 Mobile** | Flutter 3, Dart, Provider / Bloc, Socket.io Client, QR Scanner | App di động cho khách hàng & kỹ thuật viên: quét QR ghép nối, đặt hàng nhanh, xem mức pin |
| **⚡ Hardware** | C/C++ Arduino / PlatformIO, ESP32, FreeRTOS, mbedTLS, RTC GPIO | Vi điều khiển nút bấm vật lý, tiết kiệm năng lượng Deep Sleep (<15µA), ký HMAC an toàn |
| **🗄️ Database** | SQLite (`dev.db` chạy ngay) / PostgreSQL 15 (Production Docker) | Lưu trữ thông tin thiết bị, người dùng, sản phẩm, đơn hàng và lịch sử kiểm toán |

---

## ⚡ Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

### 1. 🖥️ Khởi Chạy Backend (`/backend`)
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```
> Server khởi chạy tại: **`http://localhost:5000/api`** *(Database SQLite đã được tự động seed sẵn dữ liệu mẫu)*.

### 2. 🌐 Khởi Chạy Frontend (`/frontend`)
```bash
cd frontend
npm install
npm run dev
```
> Giao diện web mở tại: **`http://localhost:5173`** *(Tự động kết nối WebSocket và REST API tới Backend)*.

### 3. 📱 Khởi Chạy Mobile App (`/mobile`)
```bash
cd mobile
flutter pub get

# Chạy trên trình duyệt Chrome (Rất nhẹ, xem ngay không cần giả lập Android):
flutter run -d chrome

# Hoặc chạy trên thiết bị / máy ảo Android:
flutter run -d android
```
*(Bạn cũng có thể click đúp vào file `run_mobile.bat` hoặc `build_apk.bat` ở thư mục gốc để tự động hóa).*

### 4. ⚡ Nạp Firmware Phần Cứng (`/hardware`)
1. Mở thư mục `hardware/` bằng **VS Code** có cài extension **PlatformIO** (hoặc Arduino IDE).
2. Kết nối mạch nút bấm **ESP32** qua cổng cáp Micro-USB / Type-C.
3. Nhấn **Build** và **Upload** firmware lên board mạch.

---

## 🎯 Thao Tác Nút Bấm Vật Lý (Hardware Gestures)

- **Bấm 1 lần (Single Press)**:
  - Thiết bị thức dậy từ chế độ ngủ sâu (Deep Sleep < 15µA).
  - Vòng đèn LED báo hiệu sẵn sàng kết nối.
- **Bấm 2 lần (Double Press)**:
  - Nếu chưa có đơn: **Tạo đơn hàng ngay tức thì!** Kích hoạt chữ ký mã hóa HMAC gửi lên Cloud và mở cửa sổ hủy 60 giây.
  - Nếu vừa đặt đơn trong 60 giây: **Hủy đơn hàng ngay lập tức!** Kho hàng tự động được hoàn lại.
- **Giữ nút 5 giây (Hold 5s)**:
  - Chuyển nút sang chế độ cấu hình lại Wi-Fi (LED nhấp nháy).
  - Nhập mã PIN nút trên Web `/quick-setup` hoặc Mobile App để đổi mạng Wi-Fi 1-chạm (bảo toàn 100% tài khoản và sản phẩm gán).

---

## 🔑 Tài Khoản Mẫu Trải Nghiệm (Demo Credentials)

> Tất cả tài khoản demo sử dụng mật khẩu chung: **`Password123!`**  
> *(Tại trang đăng nhập [http://localhost:5173/login](http://localhost:5173/login), bạn có thể bấm nút đăng nhập nhanh 1 chạm)*

| Vai Trò | Email Đăng Nhập | Màn Hình Trải Nghiệm & Tính Năng |
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

## 🐳 Khởi Chạy Toàn Bộ Hệ Thống Với Docker

```bash
docker-compose up --build -d
```
- **PostgreSQL 15**: Cổng `5432`
- **Backend API**: `http://localhost:5000/api`
- **Frontend Web**: `http://localhost:80`

---

## 📜 Bản Quyền & Giấy Phép

Dự án Đồ Án Tốt Nghiệp / Khóa Luận — Smart Order IoT Ecosystem.  
Mọi thắc mắc kỹ thuật hoặc yêu cầu tích hợp giải pháp phần cứng vui lòng liên hệ tác giả qua GitHub.
