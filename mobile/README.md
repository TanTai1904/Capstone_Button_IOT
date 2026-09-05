# Smart Order Mobile - Ứng Dụng Flutter

Ứng dụng di động được xây dựng hoàn toàn bằng **Flutter**, kết nối trực tiếp với backend Smart Order Button để quản lý nút bấm IoT, đặt hàng 1-chạm, hủy đơn trong 60 giây và cấu hình mạng Wi-Fi cho ESP32.

---

## 🌟 Các Tính Năng Nổi Bật

1. **Đăng Nhập Khách Hàng Siêu Tiện Lợi**:
   - Tích hợp nút **1-chạm điền tài khoản mẫu** Nguyễn Văn An (`customer@smartorder.local` / `Password123!`).
   - Tích hợp nút đổi địa chỉ máy chủ (Localhost, Android Emulator `10.0.2.2`, hoặc IP LAN Wi-Fi).
   - Tự động ghi nhớ phiên đăng nhập qua `SharedPreferences`.

2. **Quản Lý Nút Bấm & Đặt Hàng 1 Chạm (Home Screen)**:
   - Hiển thị danh sách nút bấm với trạng thái kết nối (ONLINE/OFFLINE), mức pin, sóng Wi-Fi dBm.
   - Nút to nổi bật: **👉 ĐẶT NGAY BẰNG 1 CHẠM**.
   - **Banner đếm ngược 60 giây hủy đơn**: Hiển thị đồng hồ đếm ngược thời gian thực kèm nút **HỦY ĐƠN** trực tiếp khi vừa bấm nút hoặc tạo đơn.
   - Tính năng "📶 Đổi Wi-Fi" và "↗ Chuyển Nhượng Nút".

3. **Wizard 5 Bước Ghép Nối Nút Bấm & Cài Wi-Fi (Quét QR)**:
   - **Bước 1**: Nhập mã PIN 6 số (mẫu `882910`) hoặc chuỗi mã QR tem nút bấm (có sẵn nút bấm test mẫu 1-chạm).
   - **Bước 2**: Nhận diện thiết bị (thông tin sản phẩm, đơn giá, đại lý).
   - **Bước 3**: Quét và chọn sóng Wi-Fi 2.4GHz gia đình + nhập mật khẩu Wi-Fi.
   - **Bước 4**: Tiến trình kết nối tự động mô phỏng (BLE Handshake -> Truyền Wi-Fi tới ESP32 -> ESP32 vào mạng -> Cloud Bootstrap).
   - **Bước 5**: Gán vào tài khoản khách hàng thành công và kích hoạt ngay.

4. **Lịch Sử Đơn Hàng Realtime (Orders Screen)**:
   - Cập nhật tự động thông qua **Socket.IO** khi trạng thái đơn đổi (Chờ tiếp nhận -> Đã tiếp nhận -> Đang giao -> Hoàn thành).
   - Chi tiết từng món hàng, số lượng, giá tiền VNĐ và thời gian đặt hàng tiếng Việt.

---

## 🚀 Cách Chạy Ứng Dụng

### 1. Chuẩn bị Flutter SDK:
Nếu máy chưa cài Flutter:
- Tải bộ cài Flutter Windows tại: [flutter.dev/get-started/install/windows](https://docs.flutter.dev/get-started/install/windows)
- Giải nén vào thư mục `C:\flutter`
- Thư mục `C:\flutter\bin` đã có sẵn trong PATH của bạn!

### 2. Chạy ứng dụng nhanh:
Vào thư mục `mobile` và thực hiện một trong các cách sau:

#### Cách 1: Click đúp vào file `run_mobile.bat`
File script sẽ tự động kiểm tra dependencies và hỏi bạn muốn chạy trên Web (Chrome), Android hay Windows.

#### Cách 2: Chạy lệnh từ Terminal
```bash
cd mobile

# Cài đặt thư viện
flutter pub get

# Chạy trên trình duyệt Chrome (Rất nhẹ, chạy thử nghiệm nhanh nhất):
flutter run -d chrome

# Hoặc chạy trên máy ảo/điện thoại Android:
flutter run -d android

# Hoặc chạy dưới dạng ứng dụng Windows Desktop:
flutter run -d windows
```

---

## 📱 Cấu Hình IP Kết Nối Backend
- Khi chạy trên **Chrome Web** hoặc **Windows Desktop**: Ứng dụng tự động kết nối tới `http://localhost:5000/api`.
- Khi chạy trên **Máy ảo Android**: Ứng dụng tự động dùng `http://10.0.2.2:5000/api`.
- Khi chạy trên **Điện thoại Android/iPhone thật**: Bấm vào biểu tượng bánh răng **⚙ Máy chủ** trên màn hình đăng nhập và nhập IP mạng LAN của máy tính (ví dụ: `http://192.168.1.15:5000`).
