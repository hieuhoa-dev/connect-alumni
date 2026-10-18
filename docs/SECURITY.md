# Hướng Dẫn Bảo Mật & Quy Trình Xoay Vòng Khóa (Security & Key Rotation)

Tài liệu này hướng dẫn cách kiểm soát bí mật (secrets) và xoay vòng các khóa dịch vụ của hệ thống **DLU Connect Alumni**.

---

## 1. Nguyên Tắc Bảo Vệ Bí Mật
1. **Không bao giờ commit file `.env` hoặc bất kỳ file chứa credentials thực tế nào vào Git.** File `.gitignore` đã được cấu hình để bỏ qua toàn bộ `.env*` ngoại trừ `.env.example`.
2. Không in (log) giá trị của các biến môi trường nhạy cảm ra terminal, console hoặc file log.
3. Khi triển khai production, biến môi trường phải được thiết lập trực tiếp qua nền tảng hosting (Vercel, Railway, Docker Secrets, Kubernetes Secrets...).

---

## 2. Quy Trình Xoay Vòng Khóa (Key Rotation)

Nếu mã nguồn hoặc biến môi trường đã từng được chia sẻ hoặc nghi ngờ bị rò rỉ, cần thực hiện xoay vòng khóa theo các bước sau:

### 2.1. Better-Auth Secret (`BETTER_AUTH_SECRET`)
- **Tác động**: Mã hóa token session và chữ ký xác thực người dùng. Khi đổi khóa này, tất cả các phiên đăng nhập hiện tại sẽ hết hiệu lực (buộc đăng nhập lại).
- **Cách sinh khóa mới**:
  ```bash
  openssl rand -base64 32
  ```
- **Cập nhật**: Gán giá trị mới vào `BETTER_AUTH_SECRET` trên server và khởi động lại ứng dụng.

### 2.2. Cơ Sở Dữ Liệu PostgreSQL (`DATABASE_URL`)
- Đăng nhập vào bảng điều khiển quản trị cơ sở dữ liệu (Supabase, Neon, AWS RDS, hoặc PostgreSQL server).
- Đổi mật khẩu của user `postgres` (hoặc tạo user mới và thu hồi user cũ):
  ```sql
  ALTER USER connect_alumni_user WITH PASSWORD 'new_strong_password_here';
  ```
- Cập nhật chuỗi kết nối `DATABASE_URL` trong biến môi trường và khởi động lại ứng dụng.

### 2.3. Redis Cache & Queue (`REDIS_URL`)
- Truy cập Upstash Redis / Redis Server.
- Tạo mật khẩu/token mới (`AUTH new_password`) hoặc xoay vòng khóa trên dashboard nhà cung cấp.
- Cập nhật `REDIS_URL` trong biến môi trường cho cả Web app và Background Worker.

### 2.4. Khóa Lưu Trữ S3 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- Đăng nhập vào AWS IAM / Cloudflare R2 / MinIO Console.
- Tạo một cặp Access Key mới cho service account.
- Cập nhật biến môi trường `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` với cặp khóa mới.
- Kiểm tra tính năng tải lên tệp/minh chứng thành công.
- Vô hiệu hóa và xóa cặp Access Key cũ.

---

## 3. Khóa Cửa Hậu Demo (Demo Backdoor Guard)
- Luôn đảm bảo `ENABLE_DEMO_LOGIN=false` trên môi trường Production.
- Cổng đăng nhập demo chỉ hoạt động khi thỏa mãn đồng thời:
  1. `process.env.ENABLE_DEMO_LOGIN === "true"`
  2. `process.env.NODE_ENV !== "production"`
