# TÀI LIỆU THIẾT KẾ GIAO DIỆN (DESIGN SYSTEM) — v2 "ĐÀ LẠT RỰC RỠ"
### ĐỒ ÁN TỐT NGHIỆP: NỀN TẢNG KẾT NỐI SINH VIÊN – KHOA CNTT – CỰU SINH VIÊN – DOANH NGHIỆP (DLU CONNECT ALUMNI)

> Bản v2 thay thế hoàn toàn v1 ("Premium Utilitarian Minimalism"). Lý do: v1 cấm màu thương hiệu đậm, gradient và đổ bóng, nên giao diện nhạt, phẳng, thiếu sức sống. v2 giữ phần kỷ luật (lưới, chữ, trợ năng, quy tắc Base UI) nhưng đổi hẳn hệ màu và chuyển động.

---

## 0. Tóm Tắt Thay Đổi So Với v1

| Hạng mục | v1 (cũ) | v2 (mới) |
| :--- | :--- | :--- |
| Màu | Đơn sắc ấm, pastel rửa màu, "màu là tài nguyên khan hiếm" | Màu thương hiệu DLU **đậm và bão hòa** (xanh thông, cam hoàng hôn), nền xanh-trắng tươi, màu nhấn có vai trò rõ |
| Nút chính | Đen `#111` | Xanh thông `#1B7A3E`; nút cam cho hành động nổi bật (đăng ký, tài trợ) |
| Hero / section | Cấm nền màu, cấm gradient | Hero xanh thông sâu + gradient có kiểm soát + ảnh thật phủ lớp màu; xen kẽ nhịp sáng/đậm |
| Bóng đổ | Gần như không có | Bóng nhẹ có sắc xanh (`shadow-brand`), card nổi khi hover |
| Chuyển động | Gần như vô hình | Có nhịp: reveal khi cuộn, stagger, count-up số liệu, banner tự cuộn, marquee đối tác |
| Banner | Tĩnh | Carousel tự chạy 5s, có chấm tiến trình, tạm dừng khi hover/focus |
| Giữ nguyên | | Font Geist + Newsreader + Geist Mono, quy tắc Base UI/shadcn, arrow function, `FieldGroup`, không emoji, không nội dung giữ chỗ |

---

## 1. Triết Lý Thiết Kế

### 1.1 Tôn chỉ: "Editorial Vivid" — Học thuật nghiêm túc, sức sống xứ hoa
Đồ án đại diện bộ mặt số của Khoa CNTT, Trường Đại học Đà Lạt. Giao diện phải vừa **đáng tin** (bố cục có trật tự, chữ rõ, số liệu minh bạch) vừa **có hồn** (màu thông xanh, cam hoàng hôn, hoa anh đào, dã quỳ, ảnh thật của trường). Ba nguyên tắc:

1. **Màu có chủ đích nhưng đủ đậm.** Mỗi màn hình có một màu chủ đạo (xanh thông), một màu hành động (cam), và tối đa hai màu nhấn ngữ nghĩa. Diện tích màu thương hiệu phải thấy được ngay từ màn hình đầu tiên (thanh điều hướng, hero, nút, tiêu đề mục), không chỉ ở viền nhỏ.
2. **Ảnh thật là nhân vật chính.** Cổng trường, đồi thông, hoa anh đào, hoạt động của Khoa. Ảnh được phủ lớp màu thương hiệu để đồng bộ, không để ảnh stock lạc tông.
3. **Chuyển động có nhịp, không có tiếng ồn.** Mọi khối lớn đều "xuất hiện" khi vào khung nhìn; thứ gì chạy liên tục (banner, marquee) phải tạm dừng được và tắt khi người dùng chọn giảm chuyển động.

### 1.2 Chẩn đoán giao diện hiện tại (căn cứ mã nguồn)
| Triệu chứng | Nguyên nhân trong code | Cách sửa (xem mục 12) |
| :--- | :--- | :--- |
| Nút và thẻ shadcn xám/đen, không có màu | `--primary: var(--foreground)` trong `globals.css`, tức primary là màu chữ | Đặt `--primary` = xanh thông |
| Nền trang xám phẳng | `--background: oklch(90 0 0)` thiếu `%`, trình duyệt cắt L về 1 nên thực tế ra trắng; sai ý định | Dùng token `--background` mới ở mục 4.5 |
| Màu xanh thông viết cứng 78 chỗ (`#1E4D2B`), cam 15 chỗ (`#E67300`) | Không có token, mỗi component tự chọn | Thay bằng `bg-primary`, `text-primary`, `bg-sun-500`... |
| Trang không có hiệu ứng xuất hiện | Không có `IntersectionObserver` / `whileInView` nào trong `src` | Thêm `<Reveal>` (mục 8.2) |
| Banner tĩnh, ticker chỉ đổi chữ | Thiếu autoplay cho carousel | Carousel hero (mục 8.3) |
| Cuộn xuống toàn một tông trắng xám | Mọi section cùng nền | Nhịp nền xen kẽ (mục 6.2) |

---

## 2. Phân Tích Tham Chiếu

### 2.1 CTU Alumni (alumni.ctu.edu.vn)
| Lấy | Cách áp dụng cho DLU |
| :--- | :--- |
| Hero ảnh cổng trường toàn khổ, chữ trắng lớn "Welcome home! Mừng bạn trở về nhà" | Hero ảnh cổng/đồi thông DLU, phủ gradient xanh thông ở bên trái để chữ đọc rõ |
| Hai nút pill cạnh nhau: cam (Giới thiệu) và xanh dương đậm (Đăng ký) | Nút cam = hành động phụ nổi bật, nút xanh thông = hành động chính. Chữ cam dùng mực đậm để đủ tương phản (mục 4.6) |
| Dải xanh đậm full-width mang dấu mốc "60 năm" ngay dưới hero | Dải mốc "30 năm 1996–2026" màu xanh thông sâu, số liệu vàng `#FFD166` |
| Khối số liệu (400+ Tiến sĩ, 14.600+ Thạc sĩ...) chữ trắng khổng lồ trên ảnh phủ màu | Giữ cấu trúc; đổi lớp phủ tím sang **xanh thông** để đúng nhận diện |
| Header trắng gọn, mục "Home" đổi màu khi active | Giữ; thêm gạch chân động |

Điểm yếu cần tránh: lớp phủ tím làm ảnh đục và lệch bảng màu trường; phần nội dung bên dưới chỉ là danh sách chữ, ít điểm nhấn.

### 2.2 Khoa CNTT – Đại học Đà Lạt (cntt.dlu.edu.vn)
| Lấy | Cách áp dụng |
| :--- | :--- |
| Thanh điều hướng màu đậm (gradient xanh navy sang xanh sáng) với nút nổi bật "Tuyển sinh 2026" | Navbar xanh thông sâu, chữ trắng; mục nổi bật dùng nền cam |
| Banner carousel có chấm tròn bên dưới, mỗi slide là poster hoàn chỉnh | Carousel hero 5 slide, chấm tiến trình |
| Thanh "TIN MỚI" chữ chạy ngang | Ticker marquee liên tục, nhãn nền xanh thông sâu |
| Tiêu đề mục: vạch dọc màu bên trái + nền mờ chuyển sắc + "Xem tất cả →" | Chuẩn hóa thành component `SectionTitle` (mục 7.4) |
| Danh sách thông báo đánh số 01, 02, 03 có nhãn đỏ "MỚI" | Dùng cho thông báo Khoa, số mono lớn màu xám xanh |
| Nút tròn nổi dọc cạnh trái (sét, Facebook, YouTube, chat) và nút lên đầu trang | Rail liên kết nhanh (mục 7.9) |
| Logo đối tác chạy ngang trong thẻ trắng | Marquee đối tác, hiện màu khi hover |

Điểm yếu cần tránh: xanh dương không thuộc nhận diện DLU (logo xanh thông + cam), nên dùng xanh dương chỉ cho ngữ nghĩa "Công nghệ / Sự kiện Khoa"; thẻ nhiều chữ in hoa dài, khó quét.

---

## 3. Ràng Buộc Bắt Buộc (Cập Nhật)

### 3.1 Vẫn cấm
| Điều cấm | Lý do & thay thế |
| :--- | :--- |
| Font Inter, Roboto, Open Sans | Dùng Geist Sans (UI), Newsreader (tiêu đề biên tập), Geist Mono (số liệu) |
| Emoji trong code, nội dung, alt text | Dùng icon SVG (`lucide-react`) |
| Nội dung giữ chỗ ("John Doe", "Acme Corp", "Lorem Ipsum") | Dùng dữ liệu thực ngữ cảnh DLU, doanh nghiệp công nghệ Việt Nam |
| Từ sáo rỗng ("Elevate", "Seamless", "Unleash", "Game-changer") | Văn phong gãy gọn, đúng nghiệp vụ |
| Ảnh stock quá bão hòa, lệch tông, hoặc ảnh người nước ngoài không liên quan | Ảnh thật của trường; ảnh ngoài phải qua lớp phủ màu (mục 9) |
| Gradient nhiều màu lệch bảng màu (tím-hồng-cam kiểu SaaS) | Chỉ dùng các gradient được định nghĩa ở mục 4.4 |
| Chữ trắng trên nền cam logo `#E67300` (chỉ 3.08:1) | Chữ mực `#0E2217` trên cam `#F28A1B`, hoặc chữ trắng trên cam đậm `#B84F00` |
| Hoạt ảnh làm tụt layout (animate `top/left/width/height`) | Chỉ animate `transform` và `opacity` |
| Dùng `asChild`, khai báo component bằng `function` | Xem mục 10 |

### 3.2 Được phép trở lại (so với v1)
- **Nền section màu đậm** (xanh thông sâu, xanh nhạt tươi) theo nhịp mục 6.2.
- **Gradient có kiểm soát** (mục 4.4) và lớp phủ màu lên ảnh.
- **Bóng đổ nhẹ mang sắc xanh** (mục 4.7). Vẫn không dùng `shadow-md/lg/xl` mặc định của Tailwind.
- **`rounded-full` cho nút CTA ở hero**, badge, avatar, nút tròn nổi. Nút thường trong form và bảng vẫn `rounded-lg`.
- **Glass nhẹ** chỉ cho navbar khi cuộn và nút điều hướng carousel (nền mờ + viền), không dùng cho khối nội dung.
- **Chữ in hoa** cho tiêu đề mục và nhãn, vì tạo phân cấp rõ như hai trang tham chiếu. Tiêu đề bài viết dài viết hoa chữ đầu câu, không in hoa toàn bộ.

---

## 4. Hệ Màu Sắc & Token

### 4.1 Bảng màu thương hiệu
Lấy gốc từ logo DLU (`public/dlu-logo.svg`: thông xanh `#20542C` / `#4D803E` / `#7FA967`, cam `#E67300`, sao đỏ `#DC2626`) và nhịp sắc của Đà Lạt (anh đào, dã quỳ).

**Xanh Thông (Pine) — màu chủ đạo, chiếm khoảng 60% diện tích màu**

| Token | Hex | Dùng cho |
| :--- | :--- | :--- |
| `pine-50` | `#EEF7EC` | Nền khối nhấn, hover hàng, nền badge xanh |
| `pine-100` | `#DCEFD8` | Nền chip, vạch phân cách đậm |
| `pine-200` | `#BEE0B8` | Viền khi hover, viền card nhấn |
| `pine-300` | `#8CCB85` | Điểm nhấn trên nền tối, đường kẻ trang trí |
| `pine-400` | `#4FB063` | Icon trên nền tối, trạng thái online |
| `pine-500` | `#2C9650` | Biểu đồ, thanh tiến độ phần phụ |
| `pine-600` | `#1B7A3E` | **Primary**: nút chính, link, tiêu đề mục, icon chủ đạo |
| `pine-700` | `#176232` | Hover/active của primary |
| `pine-800` | `#124D28` | Navbar, footer, chữ tiêu đề trên nền sáng (thay `#1E4D2B` cũ) |
| `pine-900` | `#0F3D22` | Nền hero, dải mốc, khối số liệu |
| `pine-950` | `#0A1F14` | Nền chế độ tối, lớp phủ ảnh đậm nhất |

**Cam Hoàng Hôn (Sun) — màu hành động, khoảng 10%**

| Token | Hex | Dùng cho |
| :--- | :--- | :--- |
| `sun-50` | `#FFF1E0` | Nền badge cam, nền thông báo hạn chót |
| `sun-100` | `#FFDDB3` | Viền badge cam |
| `sun-500` | `#F28A1B` | **Nút cam** (chữ mực `#0E2217`), điểm nhấn sáng trên nền xanh sâu |
| `sun-600` | `#E67300` | Cam logo. Chỉ dùng cho icon, đường kẻ, chữ cỡ lớn ≥ 24px đậm; không dùng cho chữ nhỏ |
| `sun-700` | `#B84F00` | Chữ cam trên nền sáng, nút cam với chữ trắng |

**Màu nhấn ngữ nghĩa (mỗi màn hình dùng tối đa hai)**

| Tên | Token | Hex nền/tint | Hex chữ/đậm | Ngữ nghĩa trong hệ thống |
| :--- | :--- | :--- | :--- | :--- |
| Xanh Công Nghệ | `sky` | tint `#E4EDFF`, đậm `#1D4FD7` | chữ `#1A4DB0` | Thông báo Khoa CNTT, sự kiện, talkshow, link thông tin |
| Mai Anh Đào | `blossom` | tint `#FDEEF4`, đậm `#C2185B` | chữ `#9D1450` | Quỹ khuyến học, tài trợ, tri ân, nút "Đóng góp" |
| Dã Quỳ | `gold` | tint `#FFF3CC`, sáng `#FFD166` | chữ `#8A4B00` | Chờ duyệt, số liệu nổi bật trên nền xanh sâu, huy hiệu mốc |
| Đỏ Sao | `star` | tint `#FDE8E8`, đậm `#D42B2B` | chữ `#A31D1D` | Từ chối, hết hạn, lỗi, nhãn "MỚI/HOT" |
| Chồi Non | `lime` | `#C8F169` | trên nền `pine-900` | Gạch nhấn, số liệu, nút hover trên nền xanh sâu. **Không dùng trên nền sáng** |

**Màu trung tính (pha sắc xanh, không dùng xám thuần)**

| Token | Hex | Dùng cho |
| :--- | :--- | :--- |
| `canvas` | `#F4F9F1` | Nền trang |
| `surface` | `#FFFFFF` | Card, popover, ô nhập liệu |
| `ink` | `#0E2217` | Chữ chính, tiêu đề (không dùng `#000`) |
| `muted` | `#4A5F52` | Chữ phụ, chú thích |
| `border` | `rgb(15 61 34 / 0.12)` | Viền card, đường phân cách |
| `border-strong` | `rgb(15 61 34 / 0.22)` | Viền ô nhập, viền khi hover |

### 4.2 Quy tắc phân bổ màu 60-30-10
- **60%**: nền sáng `canvas` + `surface` trắng, cộng khối xanh thông sâu (navbar, hero, dải mốc, footer).
- **30%**: xanh thông `pine-600/800` cho nút, tiêu đề mục, link, icon, vạch nhấn.
- **10%**: cam cho hành động nổi bật; anh đào/dã quỳ/xanh công nghệ/đỏ cho ngữ nghĩa.
- Mỗi viewport (khoảng 900px chiều cao) phải có **ít nhất một khối nền đậm** và **ít nhất một nút cam hoặc xanh đậm** nhìn thấy được.

### 4.3 Ánh xạ ngữ nghĩa nghiệp vụ (thay bảng pastel v1)

| Trạng thái / loại | Nền | Chữ | Ví dụ |
| :--- | :--- | :--- | :--- |
| Đã duyệt / Đã xác minh / Đang diễn ra | `#E3F5E8` | `#0E6B34` | Doanh nghiệp xác minh, tin tuyển dụng đã duyệt |
| Chờ xử lý / Sắp hết hạn | `#FFF3CC` | `#8A4B00` | Tin chờ Khoa duyệt, khảo sát sắp đóng |
| Từ chối / Hết hạn / Lỗi | `#FDE8E8` | `#A31D1D` | Tin bị từ chối, hết hạn đăng ký |
| Khoa / Sự kiện / Công nghệ | `#E4EDFF` | `#1A4DB0` | Thông báo Khoa, talkshow, workshop |
| Học bổng / Tài trợ / Tri ân | `#FDEEF4` | `#9D1450` | Chiến dịch quỹ, nhà tài trợ |
| Hot / Hạn chót / Hành động gấp | `#FFF1E0` | `#B84F00` | "Còn 3 ngày", "Sắp đầy chỗ" |
| Cựu sinh viên (khóa K22, K35...) | `#DCEFD8` | `#124D28` | Nhãn khóa tốt nghiệp, vị trí công tác |

Mọi cặp trên đều đạt tương phản chữ thường ≥ 4.5:1 (đã kiểm tra, xem 4.6).

### 4.4 Gradient & lớp phủ được phép
Chỉ dùng đúng các mẫu sau, định nghĩa thành utility trong `globals.css`:

| Tên | Giá trị | Dùng cho |
| :--- | :--- | :--- |
| `bg-hero` | `linear-gradient(135deg, #0F3D22 0%, #124D28 45%, #1B7A3E 100%)`, kèm `radial-gradient(circle at 85% 10%, rgb(242 138 27 / .35), transparent 45%)` | Hero, dải mốc, CTA band |
| `bg-photo-scrim` | `linear-gradient(90deg, rgb(10 31 20 / .88) 0%, rgb(15 61 34 / .55) 55%, transparent 100%)` | Phủ lên ảnh hero để chữ trái đọc rõ |
| `bg-photo-tint` | `linear-gradient(180deg, rgb(15 61 34 / .78), rgb(10 31 20 / .92))` | Nền ảnh cho khối số liệu (như khối "400+ Tiến sĩ" của CTU nhưng màu xanh thông) |
| `bg-section-title` | `linear-gradient(90deg, #EEF7EC, transparent 70%)` | Dải nền sau tiêu đề mục |
| `text-gradient-sun` | `linear-gradient(90deg, #FFD166, #F28A1B)` | Một cụm chữ nhấn trong tiêu đề hero, tối đa một lần mỗi trang |

### 4.5 Khối token chuẩn cho `globals.css`
Thay phần `:root` / `.dark` hiện tại (đồng thời sửa lỗi `oklch(90 0 0)` và `--input` khai báo trùng):

```css
:root {
  /* Thương hiệu */
  --pine-50: #EEF7EC;  --pine-100: #DCEFD8; --pine-200: #BEE0B8;
  --pine-300: #8CCB85; --pine-400: #4FB063; --pine-500: #2C9650;
  --pine-600: #1B7A3E; --pine-700: #176232; --pine-800: #124D28;
  --pine-900: #0F3D22; --pine-950: #0A1F14;
  --sun-50: #FFF1E0; --sun-100: #FFDDB3; --sun-500: #F28A1B;
  --sun-600: #E67300; --sun-700: #B84F00;
  --sky-50: #E4EDFF; --sky-600: #1D4FD7; --sky-800: #1A4DB0;
  --blossom-50: #FDEEF4; --blossom-700: #C2185B; --blossom-800: #9D1450;
  --gold-50: #FFF3CC; --gold-300: #FFD166; --gold-800: #8A4B00;
  --star-50: #FDE8E8; --star-600: #D42B2B; --star-800: #A31D1D;
  --lime-300: #C8F169;

  /* Ngữ nghĩa shadcn */
  --background: #F4F9F1;
  --foreground: #0E2217;
  --card: #FFFFFF;
  --card-foreground: var(--foreground);
  --popover: #FFFFFF;
  --popover-foreground: var(--foreground);
  --primary: var(--pine-600);
  --primary-foreground: #FFFFFF;
  --secondary: var(--pine-50);
  --secondary-foreground: var(--pine-800);
  --muted: var(--pine-50);
  --muted-foreground: #4A5F52;
  --accent: var(--pine-100);
  --accent-foreground: var(--pine-900);
  --destructive: var(--star-600);
  --border: rgb(15 61 34 / 0.12);
  --border-strong: rgb(15 61 34 / 0.22);
  --input: rgb(15 61 34 / 0.22);
  --ring: var(--pine-500);
  --radius: 0.75rem;

  --shadow-brand: 0 1px 2px rgb(15 61 34 / .06), 0 8px 24px -12px rgb(23 98 50 / .28);
  --shadow-brand-lg: 0 2px 4px rgb(15 61 34 / .06), 0 20px 40px -16px rgb(23 98 50 / .38);
  --shadow-sun: 0 10px 24px -10px rgb(242 138 27 / .55);
}

.dark {
  --background: #0A1F14;
  --foreground: #EAF4EC;
  --card: #10291B;
  --popover: #10291B;
  --primary: #4ADE80;
  --primary-foreground: #0A1F14;
  --secondary: #163524;
  --secondary-foreground: #CFE8D5;
  --muted: #163524;
  --muted-foreground: #9FB5A8;
  --accent: #1C4530;
  --accent-foreground: #EAF4EC;
  --border: rgb(255 255 255 / 0.10);
  --border-strong: rgb(255 255 255 / 0.20);
  --input: rgb(255 255 255 / 0.20);
  --ring: #4ADE80;
}
```

Trong `@theme inline`, ánh xạ thêm `--color-pine-*`, `--color-sun-*`, `--color-sky-*`, `--color-blossom-*`, `--color-gold-*`, `--color-star-*`, `--color-lime-300` để dùng `bg-pine-800`, `text-sun-700`... Cấm viết lại hex thô trong component sau khi token có sẵn.

### 4.6 Kết quả kiểm tra tương phản (WCAG 2.2, tính bằng script)

| Cặp màu | Tỉ lệ | Kết luận |
| :--- | :--- | :--- |
| Trắng trên `pine-600` (nút chính) | 5.38 | Đạt |
| Trắng trên `pine-700` / `pine-900` | 7.42 / 12.27 | Đạt |
| `ink` trên `canvas` / trên trắng | 15.61 / 16.67 | Đạt |
| `muted` trên trắng / trên `canvas` | 6.89 / 6.45 | Đạt |
| Link `pine-600` trên trắng / `canvas` | 5.38 / 5.04 | Đạt |
| `ink` trên `sun-500` (nút cam) | 6.69 | Đạt |
| Trắng trên `sun-600` `#E67300` | 3.08 | **Không đạt cho chữ thường**, cấm |
| Trắng trên `sun-700` | 5.05 | Đạt |
| Chữ `sun-700` trên `sun-50` | 4.55 | Đạt (sát ngưỡng, không giảm cỡ dưới 12px) |
| `lime-300` / `gold-300` trên `pine-900` | 9.49 / 8.51 | Đạt |
| Trắng trên `sky-600` / `blossom-700` / `star-600` | 6.66 / 5.87 / 5.02 | Đạt |
| Chữ trên các tint ngữ nghĩa ở 4.3 | 4.55 – 7.06 | Đạt |
| Chip khóa `pine-800` trên `pine-100`; tiêu đề mục `pine-800` trên `pine-50` | 8.21 / 9.04 | Đạt |
| Link "Xem tất cả" `sky-800` trên `canvas` | 7.20 | Đạt |
| Footer: `pine-200`, `gold-300`, `lime-300` trên `pine-950` | 11.93 / 11.95 / 13.32 | Đạt |
| Sidebar quản trị: `pine-100` trên `pine-900`; trắng trên `pine-700` | 10.16 / 7.42 | Đạt |
| `pine-600` trên `pine-50` (link trong khối nhấn) | 4.91 | Đạt (sát ngưỡng) |
| Chế độ tối: `#4ADE80` trên `#0A1F14` / trên card `#10291B` | 9.89 / 8.89 | Đạt |
| Chế độ tối: `muted` `#9FB5A8` trên card / trên `secondary` | 7.12 / 6.15 | Đạt |

Nút cam trên nền trắng có viền nền chỉ đạt 2.49:1 so với trắng, nên nhận diện nút phải dựa vào **nhãn chữ** (đạt 6.69:1) và vị trí, không dựa vào riêng màu nền. Không dùng nút cam không có chữ.

Quy tắc chung: văn bản dưới 18px (hoặc dưới 14px đậm) cần ≥ 4.5:1; văn bản lớn và icon chức năng cần ≥ 3:1. Màu **không** là tín hiệu duy nhất: trạng thái luôn đi kèm chữ hoặc icon.

### 4.7 Bóng đổ & viền
- Card thường: viền `1px solid var(--border)` + `shadow-brand`.
- Card hover và carousel: `shadow-brand-lg`.
- Nút cam hero: `shadow-sun`.
- Cấm `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` mặc định của Tailwind (bóng xám đục, lệch tông).

---

## 5. Typography

### 5.1 Bộ phông chữ (không đổi so với v1)
1. **Geist Sans** (`font-sans`): UI, thân bài, nút, menu.
2. **Newsreader** (`font-serif`): tiêu đề hero, trích dẫn cựu sinh viên, tiêu đề bài chia sẻ. Hỗ trợ tiếng Việt, đã nạp trong `layout.tsx`.
3. **Geist Mono** (`font-mono`): số liệu, MSSV, mã học bổng, ngày giờ. Luôn kèm `tabular-nums`.

### 5.2 Thang chữ

| Vai trò | Quy cách |
| :--- | :--- |
| Hero Title | `font-serif`, `text-4xl sm:text-5xl lg:text-6xl`, `font-semibold`, `tracking-tight`, `leading-[1.08]`, trắng trên nền hero. Một cụm chữ nhấn dùng `text-gradient-sun` hoặc `italic text-gold-300` |
| Hero Sub | `text-base sm:text-lg`, `leading-relaxed`, trắng 85% |
| Số liệu lớn (stat) | `font-mono tabular-nums`, `text-4xl sm:text-5xl lg:text-6xl`, `font-bold`, vàng `gold-300` hoặc trắng trên nền sâu |
| Tiêu đề mục (`SectionTitle`) | `font-sans`, `text-xl sm:text-2xl`, `font-extrabold`, `uppercase`, `tracking-tight`, màu `pine-800` |
| Tiêu đề card | `text-base sm:text-lg`, `font-semibold`, `leading-snug`, `line-clamp-2`, hover chuyển `text-primary` |
| Thân bài | `text-sm sm:text-base`, `leading-relaxed`, `text-foreground` |
| Chú thích / meta | `text-xs`, `text-muted-foreground`, ngày giờ dùng `font-mono` |
| Badge | `text-[11px]`, `font-semibold`, `uppercase`, `tracking-wider` |

Kích thước chữ tối thiểu cho nội dung đọc: 12px; nhãn badge 11px đậm là ngoại lệ duy nhất.

---

## 6. Bố Cục & Nhịp Trang

### 6.1 Khung
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`. Hero và dải số liệu có thể tràn full-width, nội dung bên trong vẫn nằm trong container.
- Khoảng cách section công cộng: `py-12 sm:py-16 lg:py-20` (giảm so với v1 vì nền đậm đã tạo nhịp).
- Bài đọc dài: `max-w-3xl` đến `max-w-4xl`.
- Lưới: 12 cột; tin chính `lg:col-span-7` + cột phụ `lg:col-span-5`; bento bất đối xứng cho dashboard.

### 6.2 Nhịp nền xen kẽ trang chủ
Từ trên xuống, mỗi cụm đổi nền để người xem luôn thấy thay đổi khi cuộn:

| # | Khối | Nền | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | Ticker "TIN MỚI" | `pine-900`, chữ trắng, nhãn `sun-500` | Marquee liên tục, dưới 40px cao |
| 2 | Navbar (sticky) | Trắng + viền dưới; khi cuộn chuyển `pine-900/95` + blur nhẹ | Mục active có gạch cam |
| 3 | Hero carousel | Ảnh + `bg-photo-scrim`, hoặc `bg-hero` | Mục 8.3 |
| 4 | Dải mốc "30 năm" | `bg-hero` | Logo mốc, khẩu hiệu, số liệu vàng |
| 5 | Tin tức + Sự kiện | `canvas` | `SectionTitle`, card trắng nổi |
| 6 | Số liệu mạng lưới | Ảnh DLU + `bg-photo-tint` | Count-up; kiểu khối số liệu của CTU |
| 7 | Việc làm nổi bật | `pine-50` | Card trắng, nhãn Verified xanh |
| 8 | Cựu SV tiêu biểu | `canvas` | Card ảnh đứng, trích dẫn serif |
| 9 | Quỹ học bổng | `blossom-50` → trắng (nền rất nhạt) | Thanh tiến độ hồng-cam, nút "Đóng góp" |
| 10 | Đối tác | Trắng | Marquee logo |
| 11 | Bản tin / CTA cuối | `bg-hero` | Ô email + nút cam |
| 12 | Footer | `pine-950` | Chữ `pine-200`, link hover `lime-300` |

Quy tắc: không đặt hai khối nền đậm liền nhau mà không có khối sáng chen giữa, trừ cặp (3)-(4) và (11)-(12).

---

## 7. Component

### 7.1 Button
| Biến thể | Kiểu | Dùng khi |
| :--- | :--- | :--- |
| `default` | Nền `pine-600`, chữ trắng, hover `pine-700`, `active:scale-[0.97]` | Hành động chính |
| `sun` (mới) | Nền `sun-500`, chữ `ink`, hover sáng hơn 6%, `shadow-sun` | CTA nổi bật: Đăng ký, Đóng góp, Tham gia |
| `outline` | Viền `pine-600`, chữ `pine-700`, hover nền `pine-50` | Hành động phụ trên nền sáng |
| `outline-light` (mới) | Viền trắng 40%, chữ trắng, hover nền trắng 12% | Hành động phụ trên nền hero |
| `ghost` | Hover nền `pine-50` | Thanh công cụ, menu |
| `destructive` | Nền `star-50`, chữ `star-800` | Từ chối, xóa |

Kích thước: `lg` cao 44px cho CTA hero (`rounded-full px-6 text-sm font-semibold`), `default` cao 36px, `sm` cao 32px. Mục tiêu chạm tối thiểu 40px trên mobile. Biểu tượng mũi tên cuối nút (`data-icon="inline-end"`) dịch `translate-x-0.5` khi hover.

### 7.2 Badge
Dạng viên thuốc nhỏ, theo bảng 4.3. Nhãn "MỚI" dùng nền `star-600`, chữ trắng, `text-[10px]`.

### 7.3 Card
- Nền trắng, `rounded-2xl`, viền `border`, `shadow-brand`.
- Hover: `-translate-y-1`, `shadow-brand-lg`, viền `pine-200`, ảnh bên trong `scale-105` trong 500ms (ảnh nằm trong khung `overflow-hidden`).
- Card nhấn (sự kiện tiêu điểm): vạch trên cùng 3px gradient `pine-600 → sun-500`.
- Cấu trúc đầy đủ `Card > CardHeader > CardContent > CardFooter` (mục 10.6).

### 7.4 SectionTitle (chuẩn hóa từ CNTT-DLU)
Khối ngang: vạch dọc 4px `pine-600` bên trái, nền `bg-section-title`, tiêu đề in hoa `pine-800`, icon `pine-600` trước tiêu đề, liên kết "Xem tất cả →" bên phải (`text-sky-800`, hover gạch chân). Khi reveal, vạch dọc co giãn từ `scaleY(0)` sang `1` trong 400ms.

### 7.5 Navbar
- Cao 64px (`h-16`). Nền trắng; trên hero có thể trong suốt rồi chuyển `pine-900/95` + `backdrop-blur-md` sau khi cuộn quá 24px.
- Mục điều hướng: chữ `ink`, hover `pine-600`, **active có gạch chân 2px màu `sun-500`** trượt bằng `layoutId` (đã có `motion`).
- Nút "Đăng ký" dùng `sun`; "Đăng nhập" dùng `ghost`.
- Mobile: ngăn kéo từ phải (`Sheet`), mục lớn 48px cao.

### 7.6 Ticker "TIN MỚI"
Nhãn bên trái nền `sun-500` chữ `ink`, cạnh phải bo chéo. Dòng chữ chạy ngang liên tục bằng `animate-marquee` (30–40s), dừng khi hover hoặc focus. Mỗi tin có tag mono `[SỰ KIỆN]` màu `gold-300` và ngày. Khi bật giảm chuyển động: hiển thị từng tin tĩnh, đổi bằng nút.

### 7.7 Stat Tile / khối số liệu
Số `font-mono` cỡ lớn kèm hậu tố `+`, nhãn in hoa nhỏ bên dưới, vạch ngắn `lime-300` giữa số và nhãn. Dùng trên `bg-photo-tint` hoặc `bg-hero`. Count-up khi vào khung nhìn (mục 8.4).

### 7.8 Danh sách đánh số (thông báo Khoa)
Số thứ tự mono `text-2xl` màu `pine-300`, ảnh nhỏ 64px bo `rounded-lg`, nhãn "MỚI" `star-600`, ngày dạng mono. Hover: nền `pine-50`, số đổi `pine-600`.

### 7.9 Rail liên kết nhanh & nút lên đầu trang
- Cột nút tròn 44px cố định cạnh trái dưới màn hình (ẩn dưới 640px, thay bằng nút gom một dấu "+"): Facebook (`#1877F2`), YouTube (`#E11D1D`), Chat/Zalo (`pine-600`). Hover: phóng 1.08, hiện tooltip.
- Nút lên đầu trang cố định phải dưới, `pine-700`, chỉ hiện khi cuộn quá 600px; kèm vòng tiến độ cuộn mảnh.
- Nếu `lucide-react` bản hiện tại không còn icon thương hiệu (Facebook, Youtube), dùng SVG nội tuyến, không thêm thư viện.

### 7.10 Footer
`pine-950`, lưới 4 cột, tiêu đề cột in hoa `gold-300`, link `pine-200` hover `lime-300`, dải dưới cùng có đường kẻ `pine-800`. Logo DLU nằm trên chip tròn trắng để không mất chi tiết.

---

## 8. Chuyển Động & Hiệu Ứng

Thư viện: `motion` (đã cài, import từ `motion/react`) cho hiệu ứng có trạng thái; CSS thuần cho marquee và hover. Hằng số gia tốc dùng lại `src/lib/ease.ts` (`EASE_OUT`, `SPRING_PRESS`...). Tuyệt đối dùng `IntersectionObserver` (hoặc `whileInView`), không lắng nghe `scroll`.

### 8.1 Nguyên tắc
- Chỉ animate `transform` và `opacity`.
- Hiệu ứng vào: 500–700ms, `EASE_OUT`. Tương tác (hover, nhấn): 150–250ms.
- Nội dung nằm trên màn hình đầu tiên (hero, navbar) không bị trễ quá 300ms để không hại LCP; nên hiện ngay, chỉ animate phần trang trí.
- Mọi chuyển động liên tục có cách dừng và tắt khi `prefers-reduced-motion: reduce` (mục 8.7).

### 8.2 Reveal khi cuộn (`<Reveal>`)
Tạo `src/components/motion/reveal.tsx` (Client Component, arrow function):

| Thuộc tính | Giá trị |
| :--- | :--- |
| Mặc định | `opacity 0 → 1`, `translateY 24px → 0`, 600ms, `EASE_OUT` |
| Biến thể | `up` (mặc định), `fade`, `scale` (0.96 → 1), `left` / `right` (±32px) cho bố cục chia đôi |
| Điều kiện kích hoạt | `viewport={{ once: true, margin: "-80px" }}` |
| Stagger | `delay = min(index, 8) * 70ms` (tối đa 560ms) cho danh sách và lưới card |
| Tiêu đề mục | Vạch dọc `scaleY`, chữ trượt từ trái 16px, hoàn tất trong 500ms |
| Ảnh | Ảnh lớn có lớp "rèm" màu `pine-100` trượt đi (`scaleX 1 → 0`, origin phải) trong 700ms |

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";

type RevealProps = {
  children: React.ReactNode;
  index?: number;
  variant?: "up" | "fade" | "scale" | "left" | "right";
  className?: string;
};

const from = {
  up: { opacity: 0, y: 24 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.96 },
  left: { opacity: 0, x: -32 },
  right: { opacity: 0, x: 32 },
} as const;

export const Reveal = ({ children, index = 0, variant = "up", className }: RevealProps) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={from[variant]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: Math.min(index, 8) * 0.07 }}
    >
      {children}
    </motion.div>
  );
};
```

Trang là Server Component thì bọc từng khối bằng `<Reveal>`; không biến cả trang thành Client Component.

### 8.3 Banner chính tự cuộn (Hero Carousel)
Nền tảng: `embla-carousel-react` (đã cài, có `src/components/ui/carousel.tsx`). Autoplay cần thêm `embla-carousel-autoplay` hoặc tự viết `setInterval` gọi `emblaApi.scrollNext()` (bản tự viết tránh thêm dependency).

| Hạng mục | Quy cách |
| :--- | :--- |
| Số slide | 4–6 slide: Welcome home, Sự kiện lớn (Homecoming), Tuyển dụng, Quỹ học bổng, Khảo sát |
| Tỉ lệ | `aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]`, `rounded-2xl` (hoặc full-bleed ở trang chủ) |
| Autoplay | Mỗi 5000ms, `loop: true`, chuyển slide 700ms `EASE_OUT` |
| Tạm dừng | Khi hover, focus trong carousel, đang kéo/chạm, tab ẩn (`document.hidden`) |
| Nút Dừng/Phát | **Bắt buộc** (WCAG 2.2.2), nút nhỏ cạnh chấm tiến trình |
| Chấm tiến trình | Chấm tròn 8px; chấm đang chọn giãn thành viên 28px và **thanh màu `sun-500` chạy đầy trong 5s** |
| Ken Burns | Ảnh slide đang hiện `scale 1 → 1.06` trong 6s |
| Chữ trên slide | Tiêu đề trượt lên 24px và hiện sau 150ms, mô tả sau 300ms, nút sau 450ms (chỉ chạy khi slide trở nên active) |
| Mũi tên | Nút tròn glass 44px, hiện khi hover trên desktop, luôn hiện trên mobile |
| Vuốt | Hỗ trợ kéo/vuốt |
| Trợ năng | `role="region" aria-roledescription="carousel" aria-label="Tin nổi bật"`; mỗi slide `role="group" aria-roledescription="slide" aria-label="1 / 5"`; vùng live `aria-live="off"` khi autoplay, `polite` khi tạm dừng |
| Giảm chuyển động | Không autoplay, không Ken Burns; người dùng bấm chuyển |
| Hiệu năng | Ảnh slide đầu `priority`, các slide sau `loading="lazy"`; ảnh WebP/AVIF qua `next/image` |

### 8.4 Count-up số liệu
Số đếm từ 0 lên giá trị thật trong 1400ms, `EASE_OUT`, kích hoạt một lần khi khối vào khung nhìn; dùng `animate()` của `motion` trên `useMotionValue`, ghi ra `textContent` (không re-render). Định dạng `toLocaleString("vi-VN")`, `tabular-nums` để chữ số không nhảy độ rộng. Giảm chuyển động: hiện giá trị cuối ngay.

### 8.5 Chạy ngang liên tục (Marquee)
- Logo đối tác: `animate-marquee` 40s, lặp hai bản nội dung để liền mạch, mask mờ hai đầu (`mask-image` gradient ngang), logo xám 60% chuyển **màu thật + scale 1.05** khi hover; dừng khi hover (`animation-play-state: paused`).
- Ticker tin mới: 30s như mục 7.6.
- Marquee thứ hai ngược chiều cho hàng logo thứ hai nếu có hơn 12 đối tác.

### 8.6 Hover và phản hồi
| Đối tượng | Hiệu ứng |
| :--- | :--- |
| Card | Nâng 4px, bóng `brand-lg`, viền `pine-200` (250ms) |
| Ảnh trong card | `scale-105` (500ms) |
| Nút | `active:scale-[0.97]`; nút cam có vệt sáng quét ngang một lần khi hover (`translateX(-120% → 120%)`, 700ms) |
| Link văn bản | Gạch chân trượt từ trái (`scaleX 0 → 1`, 250ms) |
| Icon trong ô tròn | Xoay nhẹ 6° hoặc nảy 2px |
| Badge "MỚI" | Chấm nhấp nháy (`animate-pulse`) tối đa 3 lần rồi đứng yên |
| Hàng bảng | Nền `pine-50`, 120ms |
| Thanh tiến độ học bổng | Đầy từ 0 đến giá trị thật trong 1200ms khi vào khung nhìn, đầu thanh có chấm sáng |

### 8.7 Giảm chuyển động & hiệu năng
- `@media (prefers-reduced-motion: reduce)`: tắt autoplay, marquee (đổi thành cuộn ngang thủ công), Ken Burns, count-up, reveal (hiện ngay). Giữ lại đổi màu và thay đổi trạng thái tức thời.
- Không chạy quá 3 hiệu ứng liên tục cùng lúc trong một viewport.
- `will-change: transform` chỉ gắn khi đang chạy.
- Đo lại Lighthouse sau khi thêm hiệu ứng: mục tiêu CLS < 0.05, LCP < 2.5s.

---

## 9. Hình Ảnh & Biểu Tượng

- **Nguồn ảnh**: ảnh thật của DLU (cổng trường, thư viện, đồi thông, anh đào, hoạt động Khoa). Tạm thời có thể dùng ảnh stock nhưng phải chọn ảnh có tông xanh lá và ấm; **không dùng ảnh tông lạnh hoặc quá nhiều màu tím/hồng ngoài bảng màu**.
- **Lớp phủ đồng bộ**: mọi ảnh nền có chữ phải qua `bg-photo-scrim` hoặc `bg-photo-tint`. Ảnh trong card không phủ nhưng bo `rounded-xl`.
- **Tỉ lệ**: card tin 16:10, sự kiện 16:9, cựu SV tiêu biểu 4:5, banner 21:9. Luôn đặt `alt` mô tả thật (không ghi "image").
- **Logo**: `DLULogo` đặt trên chip tròn trắng khi nằm trên nền xanh sâu. Không đổi màu logo.
- **Icon**: `lucide-react`, nét 1.75–2px, thống nhất kích thước theo ngữ cảnh. Icon trong ô nền tròn (`size-10 rounded-full bg-pine-50 text-pine-600`) cho khối tính năng.
- **Họa tiết nền**: lưới chấm mờ `opacity-[0.06]` hoặc đường đồng mức nhẹ trên `bg-hero`; một vầng sáng cam mờ góc phải (đã có trong `bg-hero`).

---

## 10. Quy Chuẩn Kỹ Thuật Base UI + shadcn (giữ nguyên từ v1)

Dự án dùng **`@base-ui/react`** với kiểu `base-nova` của shadcn.

### 10.1 Dùng `render` thay `asChild`
Khi render thành thẻ không phải nút (`<a>`, `<Link>`), bắt buộc `nativeButton={false}`.

```tsx
// SAI (kiểu Radix cũ):
<Button asChild><Link href="/jobs">Xem việc làm</Link></Button>

// SAI (thiếu nativeButton={false}):
<Button render={<Link href="/jobs" />}>Xem việc làm</Button>

// ĐÚNG:
<Button render={<Link href="/jobs" />} nativeButton={false}>Xem việc làm</Button>

// ĐÚNG (DialogTrigger, SheetTrigger, PopoverTrigger...):
<DialogTrigger render={<Button variant="outline" />}>Thêm tin tuyển dụng</DialogTrigger>
```

### 10.2 Luôn dùng arrow function cho component
```tsx
// SAI:
function JobCard({ job }: JobCardProps) { return <Card>...</Card>; }

// ĐÚNG:
const JobCard = ({ job }: JobCardProps) => {
  return <Card>{/* Nội dung */}</Card>;
};
```

### 10.3 Biểu mẫu dùng `FieldGroup` + `Field`
```tsx
<FieldGroup className="gap-5">
  <Field data-invalid={Boolean(errors.companyName)}>
    <FieldLabel htmlFor="companyName">Tên doanh nghiệp</FieldLabel>
    <Input id="companyName" aria-invalid={Boolean(errors.companyName)} placeholder="VD: Công ty Cổ phần FPT Software" />
    <FieldDescription>Nhập tên pháp nhân theo giấy phép ĐKKD.</FieldDescription>
  </Field>
</FieldGroup>
```
Ô nhập: nền trắng, viền `border-strong`, focus viền `pine-600` + vòng `ring` 3px `pine-500/30`, lỗi viền `star-600`.

### 10.4 Icon trong component
Dùng `data-icon="inline-start"` / `"inline-end"`; không thêm `size-4`, `mr-2` vào icon trong component shadcn.
```tsx
// SAI:  <Button><PlusIcon className="size-4 mr-2" />Tạo khảo sát</Button>
// ĐÚNG: <Button><PlusIcon data-icon="inline-start" />Tạo khảo sát</Button>
```

### 10.5 Select và ToggleGroup
- `Select` nhận `items` ở gốc; placeholder là phần tử có `value: null`.
- `ToggleGroup` dùng `multiple` (boolean) và `defaultValue` luôn là mảng.

```tsx
const facultyMajors = [
  { label: "Chọn chuyên ngành", value: null },
  { label: "Kỹ thuật phần mềm", value: "se" },
  { label: "Hệ thống thông tin", value: "is" },
  { label: "Mạng máy tính & An toàn thông tin", value: "nc" },
  { label: "Khoa học máy tính & AI", value: "ai" },
];

const MajorSelect = () => (
  <Select items={facultyMajors}>
    <SelectTrigger><SelectValue /></SelectTrigger>
    <SelectContent alignItemWithTrigger={false} side="bottom">
      <SelectGroup>
        {facultyMajors.map((item) => (
          <SelectItem key={String(item.value)} value={item.value}>{item.label}</SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);
```

### 10.6 Cấu trúc toàn vẹn
1. **Card**: `Card > CardHeader (CardTitle, CardDescription) > CardContent > CardFooter`.
2. **Dialog / Sheet / Drawer**: luôn có `DialogTitle` / `SheetTitle` / `DrawerTitle`; nếu ẩn thì `className="sr-only"`.
3. **Empty state**: dùng `Empty` (`EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`).
4. **Toast**: `import { toast } from "@/components/ui/toast"`, không dùng `sonner`.
5. **Loading button**: không có `isLoading`; dùng `<Spinner data-icon="inline-start" />` + `disabled`.

---

## 11. Đối Chiếu Viết Code (Đúng / Sai)

| Tình huống | SAI | ĐÚNG |
| :--- | :--- | :--- |
| Khai báo component | `function AlumniCard(props) {}` | `const AlumniCard = (props) => {};` |
| Nút chứa liên kết | `<Button asChild><Link .../></Button>` | `<Button render={<Link href="/apply" />} nativeButton={false}>` |
| Màu thương hiệu | `className="bg-[#1E4D2B] text-white"` | `className="bg-primary text-primary-foreground"` hoặc `bg-pine-800` |
| Màu cam | `className="bg-[#E67300] text-white"` | `<Button variant="sun">` (chữ `ink` trên `sun-500`) |
| Bóng đổ | `shadow-lg` | `shadow-brand` / `shadow-brand-lg` |
| Hiện khi cuộn | `window.addEventListener("scroll", ...)` | `<Reveal>` (`whileInView`, `once`) |
| Chuyển động liên tục | Animate `width`, `left` | Chỉ `transform`, `opacity`; có nhánh `useReducedMotion` |
| Danh sách dọc | `space-y-4` | `flex flex-col gap-4` |
| Kích thước vuông | `w-10 h-10` | `size-10` |
| Trạng thái | `<span className="text-emerald-500 font-bold">Đã duyệt</span>` | `<Badge className="bg-[#E3F5E8] text-[#0E6B34]">Đã duyệt</Badge>` (hoặc thêm biến thể mới `success` vào `badge.tsx`) |
| Trạng thái rỗng | `<div>Chưa có dữ liệu</div>` | `<Empty><EmptyHeader><EmptyTitle>...` |
| Cắt chữ | `overflow-hidden text-ellipsis whitespace-nowrap` | `truncate` |
| Chữ trên nền cam logo | `bg-sun-600 text-white` | `bg-sun-500 text-foreground` hoặc `bg-sun-700 text-white` |

---

## 12. Thiết Kế Từng Phân Hệ

### 12.1 Cổng Thông Tin Khoa & Mạng Lưới (trang chủ)
Bố cục theo bảng nhịp nền ở mục 6.2. Hero chính: tiêu đề serif "Mừng bạn trở về nhà" cùng cụm nhấn "Nơi hội tụ, tri ân và tiếp bước tương lai"; hai nút `sun` (Đăng ký tham gia) và `outline-light` (Cập nhật thông tin Cựu SV). Dải mốc "30 năm 1996–2026" ngay dưới hero. Khối số liệu mạng lưới (5.000+ Cựu SV, 50+ doanh nghiệp, 500M+ quỹ học bổng...) có count-up. Ticker "TIN MỚI" trên cùng.

### 12.2 Sàn Tuyển Dụng
Lưới card 3 cột. Header card: logo doanh nghiệp `rounded-xl size-12`, nhãn `Verified` xanh. Kỹ năng là chip `pine-50`/`pine-800`. Lương và địa điểm dùng `font-mono`. Nhãn hạn chót màu cam (`sun-50`/`sun-700`). Nút "Ứng tuyển" `default`; form đăng tin có `Alert` nền `gold-50` nhắc quy trình duyệt 24 giờ.

### 12.3 Sự Kiện & Talkshow
Card có khối ngày (số ngày lớn mono, tháng nhỏ) bo vuông `pine-900` chữ trắng ở góc trái ảnh. Online/Offline phân biệt bằng badge `sky` và `pine`. Khối diễn giả: avatar tròn, tên, chức danh, nhãn khóa (ví dụ "Cựu SV K41"). Nút đăng ký đổi trạng thái: Chưa mở (xám), Đăng ký ngay (`sun`), Đã đủ chỗ (xám, có chữ).

### 12.4 Góc Chia Sẻ
Bài nổi bật: ảnh lớn, tiêu đề `font-serif`, trích dẫn với dấu nháy lớn `pine-200`. Chủ đề dùng chip theo bảng 4.3. Tác giả: avatar + chức danh + khóa.

### 12.5 Khảo Sát & Form Builder
Chế độ tập trung: nền `canvas`, thanh `Progress` 4px đỉnh trang màu gradient `pine-600 → lime-300`. Lựa chọn dạng thẻ lớn; thẻ chọn viền `pine-600` + nền `pine-50` + dấu tick. Form Builder: khung thả viền nét đứt `border-pine-300`, hover nền `pine-50`.

### 12.6 Quỹ Khuyến Học
Khối nhấn `blossom`. Thanh tiến độ gradient `blossom-700 → sun-500`, số tiền `font-mono` lớn, mốc phần trăm. Bảng vinh danh nhà tài trợ có hạng (vàng/bạc/đồng bằng chip). Nút "Đóng góp" `sun`. Hồ sơ xin học bổng giữ giao diện nghiêm túc: chỉ dùng `pine` và `ink`.

### 12.7 Bảng Điều Khiển Quản Trị
Giữ giao diện mật độ cao nhưng có màu: sidebar `pine-900` chữ `pine-100`, mục active nền `pine-700` + vạch trái `sun-500`; topbar trắng. Thẻ KPI có icon trong ô tròn màu theo ngữ nghĩa và số mono lớn; biểu đồ `recharts` dùng chuỗi màu `pine-600`, `sun-500`, `sky-600`, `blossom-700`, `gold-300` (không quá 5 màu mỗi biểu đồ). Tiêu đề cột bảng `text-xs uppercase text-muted-foreground`, hàng hover `pine-50`. Thao tác gom trong `DropdownMenu` hoặc `Drawer` phải.

---

## 13. Lộ Trình Áp Dụng (theo thứ tự ưu tiên)

1. **`globals.css`**: thay token mục 4.5; sửa `oklch(90 0 0)`; bỏ `--input` trùng; thêm `shadow-brand*`, gradient utilities, `@theme inline` cho màu thương hiệu. Chỉ riêng bước này sẽ đổi màu toàn bộ nút và nền shadcn từ đen/xám sang xanh thông.
2. **Thay hex cứng bằng token** (`#1E4D2B` 78 chỗ, `#E67300` 15 chỗ) bằng `bg-primary`, `text-pine-800`, `bg-sun-500`...
3. **Thêm biến thể `sun` và `outline-light`** vào `button.tsx`.
4. **Tạo `Reveal`** và bọc các khối trang chủ; thêm `SectionTitle`.
5. **Hero Carousel tự chạy** (thay `HomecomingBanner` / banner tĩnh trong `academic-news-portal.tsx`), chuyển ticker sang marquee.
6. **Khối số liệu count-up trên ảnh phủ xanh**, marquee đối tác.
7. **Navbar + Footer** theo mục 7.5, 7.10; thêm rail liên kết nhanh.
8. **Áp dụng cho trang trong** (jobs, events, experiences, scholarships), rồi dashboard.
9. **Đo lại**: tương phản, Lighthouse, kiểm tra giảm chuyển động, kiểm tra bàn phím và đọc màn hình.

Hai tệp cần cập nhật theo để tránh mâu thuẫn:
- **`AGENTS.md`** đang yêu cầu "Đọc skills minimalist-ui để biết cách thiết kế". Skill đó cấm đúng những thứ v2 cho phép (màu nền đậm, gradient, bóng đổ). Đổi dòng này thành "Đọc `DESIGN.md` (v2) để biết cách thiết kế".
- **`.agents/skills/minimalist-ui/SKILL.md`**: xóa hoặc đánh dấu không còn áp dụng cho dự án này.

---

## 14. Danh Sách Kiểm Tra Trước Khi Commit

- [ ] Không còn hex thương hiệu viết cứng; dùng token.
- [ ] Mỗi trang có khối nền đậm và ít nhất một nút chính nhìn thấy ngay màn hình đầu.
- [ ] Chữ thường đạt ≥ 4.5:1; không có chữ trắng trên `sun-600`.
- [ ] Khối lớn đều có `Reveal`; số liệu có count-up; không animate thuộc tính gây layout.
- [ ] Banner và marquee: có nút dừng, dừng khi hover/focus, tắt khi `prefers-reduced-motion`.
- [ ] Component dùng arrow function; nút liên kết dùng `render` + `nativeButton={false}`.
- [ ] Không emoji, không nội dung giữ chỗ, không từ sáo rỗng.
- [ ] Ảnh có `alt` thật, có kích thước/tỉ lệ cố định (CLS thấp), ảnh đầu trang `priority`.
- [ ] Kiểm tra ở 375px, 768px, 1280px, 1920px; chế độ sáng và tối.
- [ ] Điều hướng bàn phím và vòng focus nhìn thấy rõ (`ring` 3px).

---

## 15. Cam Kết Chất Lượng

Giao diện v2 hướng tới một sản phẩm **có nhận diện DLU rõ ràng, nhiều sức sống nhưng vẫn nghiêm túc và dễ đọc**: màu đậm có chủ đích, ảnh thật, nhịp trang rõ ràng, chuyển động có kiểm soát và đầy đủ trợ năng, sẵn sàng chuyển giao cho Nhà trường và doanh nghiệp.
