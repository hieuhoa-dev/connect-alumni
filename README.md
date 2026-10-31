# Mạng Lưới Cựu Sinh Viên & Hợp Tác Doanh Nghiệp Khoa Công Nghệ Thông Tin
## Trường Đại Học Đà Lạt (DLU Alumni & Partner Network)

> **Đồ án tốt nghiệp chuyên ngành Công nghệ Thông tin — Trường Đại học Đà Lạt**  
> Dấu mốc kỷ niệm 50 năm truyền thống Trường Đại học Đà Lạt (1976 — 2026).

---

## 1. Giới Thiệu Dự Án

Hệ thống **Mạng Lưới Cựu Sinh Viên & Hợp Tác Doanh Nghiệp Khoa CNTT (DLU Alumni & Partner Network)** là nền tảng số hóa toàn diện kết nối giữa Nhà trường, Giảng viên, Sinh viên, Cựu sinh viên và Doanh nghiệp đối tác. Hệ thống được xây dựng với mục tiêu:

- **Gắn kết truyền thống:** Lưu trữ danh bạ cựu sinh viên qua các khóa, tôn vinh các thế hệ cựu sinh viên tiêu biểu và quản lý tư liệu truyền thông thông qua Thư viện ảnh sự kiện (`/gallery`).
- **Hỗ trợ đào tạo & việc làm:** Cung cấp cổng thông tin tuyển dụng, việc làm, thực tập và kết nối chuyên môn trực tiếp với các doanh nghiệp đối tác đã xác thực.
- **Tương thân tương ái:** Quản lý và minh bạch tiến độ đóng góp cho Quỹ Khuyến học & Học bổng Đồng hành DLU.
- **Bảo mật & Định danh học đường:** Tích hợp xác thực Google OAuth đơn nhất với tên miền chính thức của Trường (`@dlu.edu.vn`), hỗ trợ quy trình hoàn tất hồ sơ và bảo vệ dữ liệu cá nhân theo tiêu chuẩn Nghị định 13/2023/NĐ-CP.

---

## 2. Kiến Trúc Công Nghệ

| Thành phần | Công nghệ sử dụng |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Actions, Server Components) |
| **Thư viện UI** | React 19, Base UI (`@base-ui/react`), Tailwind CSS v4 |
| **Animation** | Motion / Framer Motion (`motion/react`) |
| **Xác thực (Auth)** | Better-Auth (Drizzle Adapter, Session Cookie, Google OAuth `@dlu.edu.vn`) |
| **Database & ORM** | PostgreSQL 16+, Drizzle ORM (`drizzle-kit`) |
| **Lưu trữ tệp & Xử lý ảnh** | MinIO / AWS S3 + Sharp (tự động tạo WebP variants: thumb, md, lg, xóa EXIF/GPS) |
| **Hàng đợi nền (Worker)** | BullMQ 6 + Redis (xử lý dọn dẹp pending files, thông báo hệ thống) |
| **Kiểm thử tự động** | Vitest 3, `@testing-library/react` |
| **Linter & Formatter** | Biome (`@biomejs/biome`) |

---

## 3. Thiết Lập Môi Trường & Cài Đặt

### 3.1. Yêu cầu hệ thống
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (dành cho PostgreSQL, MinIO, Redis cục bộ)

### 3.2. Biến môi trường (`.env`)

Sao chép `.env.example` thành `.env` và cấu hình các giá trị phù hợp:

```bash
# CSDL PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/alumni"

# Better-Auth Security
BETTER_AUTH_SECRET="min-32-chars-long-secret-key-change-this-in-production"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Google OAuth (@dlu.edu.vn)
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Kho lưu trữ S3 / MinIO
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET_NAME="alumni"
S3_FORCE_PATH_STYLE="true"
S3_PUBLIC_BASE_URL="http://localhost:9000/alumni"

# Redis (BullMQ Worker)
REDIS_URL="redis://localhost:6379"

# Bật đăng nhập nhanh Demo (Chỉ dùng cho môi trường thử nghiệm / chấm đồ án)
ENABLE_DEMO_LOGIN="true"
DEMO_LOGIN_SECRET="demo-signature-secret-at-least-32-characters"
```

---

## 4. Hướng Dẫn Vận Hành

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Khởi tạo và chạy Migration CSDL
Hệ thống sử dụng Drizzle ORM với cơ chế migration an toàn:
```bash
# Tạo migration mới (nếu có thay đổi schema)
npm run db:generate

# Áp dụng migration vào CSDL PostgreSQL
npm run db:migrate
```

### Bước 3: Nạp dữ liệu mẫu ban đầu (Seeding)
Nạp dữ liệu danh mục khoa, tài khoản mẫu và các banner mặc định:
```bash
npm run db:seed
```

### Bước 4: Khởi động máy chủ phát triển
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

### Bước 5: Khởi động Worker nền (Background Job)
Chạy worker xử lý tự động dọn dẹp các tệp tải lên mồ côi (`pending > 24h`):
```bash
npm run worker
```

---

## 5. Hướng Dẫn Cấu Hình Google OAuth (@dlu.edu.vn)

Để kích hoạt đăng nhập tài khoản Google của Trường:
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Tạo **OAuth 2.0 Client ID** dạng *Web application*.
3. Thêm **Authorized redirect URI**:
   - Môi trường dev: `http://localhost:3000/api/auth/callback/google`
   - Môi trường production: `https://your-domain.edu.vn/api/auth/callback/google`
4. Cấu hình `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env`.
5. Hệ thống đã cài đặt cơ chế kiểm soát tên miền nghiêm ngặt (`hd: "dlu.edu.vn"`) và validation từ chối mọi email không thuộc định dạng `@dlu.edu.vn`.

---

## 6. Danh Sách Tài Khoản Thử Nghiệm (Demo Accounts)

Khi `ENABLE_DEMO_LOGIN=true`, bạn có thể bấm trực tiếp vào các nút đăng nhập nhanh tại trang `/login`:

| Vai trò | Email đăng nhập | Mật khẩu mẫu | Quyền hạn chính |
|---|---|---|---|
| **Ban Quản trị / Giảng viên** | `staff@khoacntt.edu.vn` | `Password123!` | Toàn quyền duyệt doanh nghiệp, xuất bản album, duyệt yêu cầu gỡ ảnh, quản trị banner |
| **Sinh viên hiện tại** | `student1@dlu.edu.vn` | `Password123!` | Đăng ký sự kiện, nộp form khảo sát, xem thư viện ảnh |
| **Cựu sinh viên đã xác thực**| `alumni1@dlu.edu.vn` | `Password123!` | Đăng bài chia sẻ kinh nghiệm, đăng ký sự kiện, đóng góp học bổng |
| **Doanh nghiệp đối tác** | `hr@vng.com.vn` | `Password123!` | Quản lý trang công ty, đăng tin tuyển dụng việc làm & thực tập |

---

## 7. Quy Trình Kiểm Thử Tự Động & Đảm Bảo Chất Lượng

Dự án trang bị hệ thống kiểm thử tự động với Vitest và Biome:

```bash
# Chạy toàn bộ unit test & integration test
npm test

# Chạy test ở chế độ theo dõi thay đổi (Watch mode)
npm run test:watch

# Kiểm tra quy chuẩn mã nguồn & formatting
npm run lint

# Tự động sửa lỗi format với Biome
npm run format

# Kiểm tra chặt chẽ kiểu dữ liệu TypeScript
npx tsc --noEmit
```

### Các nhóm test cốt lõi:
- **`tests/unit/safe-url.test.ts`:** Kiểm tra bảo mật chống Open Redirect và XSS vector (`javascript:`, `data:`, `//`).
- **`tests/unit/dlu-email.test.ts`:** Kiểm tra kiểm soát tên miền `@dlu.edu.vn`, chặn subdomain và spoofed domains.
- **`tests/unit/upload-policy.test.ts`:** Kiểm tra chính sách upload, kiểm tra quyền sở hữu và chặn định dạng SVG nguy hiểm.
- **`tests/integration/event-registration-concurrency.test.ts`:** Kiểm tra an toàn đồng thời khi đăng ký sự kiện (Row lock `FOR UPDATE`).
- **`tests/integration/file-access-control.test.ts`:** Kiểm tra phân quyền truy cập tệp riêng tư và chống path traversal.

---

## 8. Giấy Phép & Bản Quyền

Bản quyền © 2026 Khoa Công nghệ Thông tin — Trường Đại học Đà Lạt.  
Được thực hiện trong khuôn khổ Đồ án tốt nghiệp Đại học.
