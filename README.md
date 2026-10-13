# Connect Alumni

DLU Alumni là dự án riêng kết nối sinh viên, cựu sinh viên của tất cả các khoa, ngành tại Trường Đại học Đà Lạt và doanh nghiệp.

Thông tin Trường Đại học Đà Lạt và nhận diện dự án được quản lý tại `src/lib/site-config.ts`. Xem [nguồn thông tin đã đối chiếu](docs/DLU_REFERENCE.md) trước khi cập nhật nội dung công khai. Sinh viên/cựu sinh viên nhập khoa hoặc ngành học khi đăng ký và có thể cập nhật trong hồ sơ; không tự gán người dùng vào Khoa CNTT.

Xem [báo cáo rà soát và lộ trình hoàn thiện](docs/PROJECT_REVIEW.md) để biết các phần đã kiểm tra, thiếu hụt vận hành và đề xuất danh bạ, kết nối, cố vấn cho cộng đồng toàn trường. Script seed chứa dữ liệu trình diễn đa ngành, không phải thông báo hay quan hệ đối tác chính thức.

Xem [kiểm tra theo 5 vai trò và danh sách nội dung cần cập nhật](docs/ROLE_AUDIT.md) để biết lỗi đã sửa, kết quả hồi quy/tích hợp/trình duyệt và các việc cần hoàn thiện trước khi triển khai.

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
