# 🚀 Hướng Dẫn Deploy Hệ Thống Smart Order Button IoT

Hệ thống hỗ trợ deploy qua **Docker & Docker Compose** (khuyến nghị cho môi trường Production / Cloud VPS) hoặc **Chạy trực tiếp (Local Development)**.

---

## 🌟 Cách 1: Deploy Bằng Docker & Docker Compose (Khuyến nghị)

### Yêu cầu:
- Đã cài đặt **Docker Desktop** (trên Windows) hoặc **Docker Engine & Docker Compose** (trên Linux/Ubuntu/Debian).

### Các bước thực hiện:

#### Trên Windows:
1. Mở **Docker Desktop** (đảm bảo Docker đang chạy).
2. Nhấp đúp chuột chạy file [`deploy.bat`](file:///d:/Capstone_Button_IOT/deploy.bat) hoặc mở Terminal gõ:
   ```cmd
   deploy.bat
   ```
   *Hoặc chạy lệnh chuẩn:*
   ```cmd
   docker compose up --build -d
   ```

#### Trên Linux VPS / Ubuntu Server:
```bash
chmod +x deploy.sh
./deploy.sh
# Hoặc:
docker compose up --build -d
```

### Địa chỉ truy cập sau khi Deploy:
- 🌐 **Frontend Web App**: `http://localhost` (Cổng 80) hoặc IP máy chủ VPS
- 📡 **Backend API**: `http://localhost:5000/api`
- 🐘 **PostgreSQL Database**: `localhost:5432` (`smart_order_db`)

### 🔑 Tài khoản mặc định hệ thống tự khởi tạo:
| Vai trò | Email đăng nhập | Mật khẩu |
|---|---|---|
| **Super Admin** | `admin@smartorder.local` | `Password123!` |
| **Chủ cửa hàng (Store Owner)** | `store@smartorder.local` | `Password123!` |
| **Khách hàng (Customer)** | `customer@smartorder.local` | `Password123!` |
| **Kỹ thuật viên (Technician)** | `tech@smartorder.local` | `Password123!` |

---

## 🛠️ Cách 2: Chạy trực tiếp (Development Mode)

Nếu muốn chạy trực tiếp không qua Docker:

1. **Chạy script tự động:**
   - Chạy [`run_project.bat`](file:///d:/Capstone_Button_IOT/run_project.bat) để khởi động song song Backend (cổng 5000) và Frontend (cổng 5173).

2. **Chạy thủ công từng phần:**
   - **Backend:**
     ```cmd
     cd backend
     npm install
     npm run dev
     ```
   - **Frontend:**
     ```cmd
     cd frontend
     npm install
     npm run dev
     ```

---

## ⚙️ Các lệnh quản trị hệ thống Docker hữu ích:
- **Xem logs backend thời gian thực:**
  ```cmd
  docker compose logs -f backend
  ```
- **Xem logs tất cả dịch vụ:**
  ```cmd
  docker compose logs -f
  ```
- **Khởi động lại toàn bộ:**
  ```cmd
  docker compose restart
  ```
- **Tắt hệ thống:**
  ```cmd
  docker compose down
  ```
