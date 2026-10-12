# Connect Alumni

Nền tảng kết nối sinh viên, cựu sinh viên, Khoa và doanh nghiệp.

Thông tin Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt được quản lý tại `src/lib/site-config.ts`. Xem [nguồn thông tin đã đối chiếu](docs/DLU_REFERENCE.md) trước khi cập nhật nội dung công khai.

## Chạy local

Yêu cầu Node.js và PostgreSQL. Redis được dùng cho tác vụ nền và email; các thông báo trong ứng dụng vẫn được lưu khi chưa cấu hình Redis.

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Tạo file môi trường từ mẫu:

   ```bash
   cp .env.example .env
   ```

   Trên Windows PowerShell dùng `Copy-Item .env.example .env`. Cập nhật `DATABASE_URL` trỏ đến PostgreSQL và thay `BETTER_AUTH_SECRET` bằng một chuỗi ngẫu nhiên dài tối thiểu 32 ký tự.

3. Tạo schema database và dữ liệu mẫu nếu cần:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Khởi động ứng dụng:

   ```bash
   npm run dev
   ```

   Mở [http://localhost:3000](http://localhost:3000).

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Bộ kiểm thử hồi quy dùng dữ liệu trong bộ nhớ và dependency giả, không cần PostgreSQL, Redis hoặc thông tin AWS. Để kiểm tra đầy đủ đăng nhập, lưu dữ liệu và gửi email, cần cấu hình các dịch vụ thực tế theo hướng dẫn chạy local.

## Tác vụ nền

Đặt `REDIS_URL` để bật hàng đợi thông báo email và hết hạn việc làm. Redis và worker là tùy chọn khi chạy các luồng chính của ứng dụng.

```bash
npm run check:redis
npm run worker
```

Email worker hiện là điểm tích hợp mẫu và cần một nhà cung cấp email để gửi thư thật. Cấu hình các biến AWS/S3 trong `.env` để bật tải tệp lên object storage.
