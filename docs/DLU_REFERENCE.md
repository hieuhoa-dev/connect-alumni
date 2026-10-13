# Nguồn thông tin Đại học Đà Lạt

Đối chiếu ngày **13/10/2026**. DLU Alumni là dự án riêng dành cho sinh viên và cựu sinh viên **toàn Trường Đại học Đà Lạt**, ở tất cả các khoa, ngành. Nhận diện và nội dung công khai nằm trong `src/lib/site-config.ts`.

## Thông tin hiển thị trên trang Giới thiệu

| Nội dung | Nguồn chính thức |
| --- | --- |
| Trường đại học công lập, đào tạo đa ngành, đa lĩnh vực; hoạt động đào tạo, nghiên cứu, chuyển giao công nghệ, phục vụ cộng đồng | [Lời ngỏ của Hiệu trưởng](https://dlu.edu.vn/loi-ngo-cua-hieu-truong/), [cẩm nang tuyển sinh 2025](https://sp.dlu.edu.vn/Resources/Docs/SubDomain/sp/Thong%20tin%20SV%20can%20biet/2025/Cam%20nang%20Thong%20tin%20tuyen%20sinh%20DLU%202025%20%281%29.pdf) |
| Viện Đại học Đà Lạt thành lập năm 1957, bắt đầu tuyển sinh năm 1958; Trường Đại học Đà Lạt được thành lập ngày 27/10/1976 theo Quyết định 426/TTg | [Lịch sử Trường](https://50nam.dlu.edu.vn/lich-su/), [gặp mặt 65 năm](https://dlu.edu.vn/gap-mat-65-nam-truong-dai-hoc-da-lat-hinh-thanh-va-phat-trien/) |

Trang `/about#ve-truong` hiển thị bản tóm tắt trong dự án, không yêu cầu tải website bên ngoài khi render. Hai mục lục “Về Đại học Đà Lạt” và “Về DLU Alumni” cuộn trong cùng trang. Nội dung ghi tên nguồn và ngày đối chiếu bằng văn bản; không có nút chuyển sang website Trường/Khoa.

## Thông tin liên hệ trong footer

Footer trang cộng đồng hiển thị thông tin liên hệ của **Trường Đại học Đà Lạt**, đối chiếu ngày 13/10/2026:

- Địa chỉ: Số 01 Phù Đổng Thiên Vương, phường Lâm Viên - Đà Lạt, tỉnh Lâm Đồng.
- Điện thoại: 0263 3822 246; liên kết gọi `tel:+842633822246`.
- Email: info@dlu.edu.vn; liên kết mở ứng dụng email.

Nguồn: [footer cổng chính thức Khoa Sinh học, mục Đại học Đà Lạt](https://ksh.dlu.edu.vn/en/) và [hồ sơ giới thiệu Trường](https://tckh.dlu.edu.vn/uploads/2021/03/DLU_Profile.pdf). Tên khoa của nguồn không dùng làm tên hay thông tin liên hệ của dự án; đây là khối thông tin chung về Trường trong footer nguồn. Địa chỉ mới đã đối chiếu thêm với [cổng tuyển sinh](https://tuyensinh.dlu.edu.vn/vi/dau-an-dlu). Việc tải trực tiếp một số URL bị timeout; nội dung được đối chiếu qua kết quả lập chỉ mục từ các tên miền chính thức.

Hỗ trợ DLU Alumni vẫn dùng biểu mẫu `/contact`. Footer không gắn logo, địa chỉ hoặc tên Trường với một liên kết mở website bên ngoài.

## Nhận diện và hình ảnh

- Logo hiển thị: **Trường Đại học Đà Lạt**, bản lưu `public/images/dlu-logo.png` (2106 × 2106 px), từ [trang công bố logo](https://dlu.edu.vn/logo-truong-dai-hoc-da-lat/) và [tệp PNG](https://dlu.edu.vn/wp-content/uploads/2025/07/00.-Newest_DLU-Logo.png). Logo được dùng thống nhất ở trang công khai, đăng nhập/đăng ký và sidebar. Bấm logo tải lại trang chủ của dự án.
- Ảnh khuôn viên: `public/images/dlu-campus.jpg` (900 × 597 px), từ [cổng cựu sinh viên DLU](https://csv.dlu.edu.vn/) và [tệp ảnh gốc](https://csv.dlu.edu.vn/api/media/file/2023-05-21(2)-900x597.jpg). Ảnh giới thiệu khuôn viên, không gán cho một sự kiện cụ thể.
- Bản logo IT DLU `public/images/it-dlu-logo.png` được giữ làm tài sản cũ; không dùng làm nhận diện toàn trường.

## Phạm vi nội dung

- `mission`, `vision`, `values` là mục tiêu của dự án DLU Alumni; không phải tuyên bố chính thức của Trường.
- Giới thiệu tập trung vào lịch sử, môi trường đào tạo đa ngành và mục tiêu kết nối cộng đồng. Không dùng ba chuyên ngành CNTT để đại diện cho toàn trường.
- Tài khoản sinh viên/cựu sinh viên có trường khoa/ngành do người dùng nhập và cập nhật. Không tự gán “Công nghệ Thông tin” khi chưa có thông tin.
- Khoa/ngành và năm học hiện có của tài khoản được giữ nguyên. Thay đổi phạm vi không tự sửa dữ liệu hồ sơ đã lưu hoặc chạy seed trên database.
- Vai trò kỹ thuật `faculty_staff` và đường dẫn `/faculty-admin` được giữ để tương thích dữ liệu; nhãn giao diện là nhân sự quản trị của dự án, không giới hạn vào một khoa.
- Liên hệ hỗ trợ dự án qua biểu mẫu của DLU Alumni. Footer có khối liên hệ chung của Trường theo yêu cầu; khối “Hỗ trợ & góp ý” dẫn tới biểu mẫu dự án.
- Tham khảo nội dung và logo của Trường không xác nhận Trường vận hành hoặc bảo trợ dự án.

## Tham khảo nội dung cốt lõi

[Website Khoa CNTT](https://cntt.dlu.edu.vn/) là nguồn tham khảo cách tổ chức bản tin, thông báo, sự kiện, chia sẻ cựu sinh viên. Đề xuất sử dụng các nhóm nội dung này cho **toàn trường**, bổ sung chủ đề và khoa/ngành phù hợp. Không sao chép thông báo có thời hạn, bảng nhân sự, số liệu hoặc chương trình đào tạo riêng của Khoa để dùng làm nội dung toàn trường.

Một số yêu cầu tải trực tiếp trả timeout/502. Các thông tin lịch sử và tổng quan đã được đối chiếu với nội dung được lập chỉ mục từ URL chính thức. Không xem ngày lập chỉ mục là ngày công bố bài viết.
