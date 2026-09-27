# TÀI LIỆU THIẾT KẾ GIAO DIỆN & HỆ THỐNG THẨM MỸ (DESIGN SYSTEM)
### ĐỒ ÁN TỐT NGHIỆP: NỀN TẢNG KẾT NỐI SINH VIÊN – KHOA CNTT – CỰU SINH VIÊN – DOANH NGHIỆP (CONNECT ALUMNI)

---

## 1. Triết Lý Thiết Kế & Định Hướng Thẩm Mỹ (Design Philosophy)

### 1.1 Tôn chỉ: "Premium Utilitarian Minimalism & Editorial Academic"
Đồ án tốt nghiệp là một công trình học thuật mang tính thực tiễn cao, đại diện cho bộ mặt số hoá của **Khoa Công nghệ Thông tin**. Vì vậy, giao diện không đi theo lối mòn của các phần mềm SaaS đại trà (nhiều màu sắc rực rỡ, gradient lòe loẹt, đổ bóng nặng nề), mà áp dụng ngôn ngữ thiết kế:
- **Tối giản thực dụng cao cấp (Premium Utilitarian Minimalism)**: Tập trung vào tính hiệu dụng, khả năng đọc lướt, bố cục cấu trúc rõ ràng, không có chi tiết thừa.
- **Phong cách Tạp chí Học thuật (Editorial Academic Layout)**: Sang trọng, tri thức, mang hơi thở của các ấn phẩm công nghệ và báo cáo khoa học đương đại kết hợp cùng các công cụ làm việc tri thức tiên tiến (như Notion, Linear, The Verge, Vercel).
- **Trọng tâm nội dung (Content-First Hierarchy)**: Tôn vinh thông tin kết nối việc làm, câu chuyện thành công của cựu sinh viên, sự kiện khoa học công nghệ và tính minh bạch của quỹ học bổng.

### 1.2 Đổi Mới & Chỉnh Chu Cho Đồ Án Tốt Nghiệp
- **Chỉnh chu (Craftsmanship)**: Mọi chi tiết vi mô (border 1px, bo góc, khoảng cách đệm, kiểu chữ số mono cho số liệu, trạng thái rỗng) đều được chuẩn hóa 100%.
- **Đổi mới (Innovation)**: Ứng dụng kiến trúc bất đối xứng **Asymmetric Bento Grids**, thư viện nguyên khối **Base UI** hiện đại nhất, cơ chế form chuẩn trợ năng WAI-ARIA, và hệ thống lọc/tìm kiếm kết hợp bảng biểu **TanStack Table v9**.

---

## 2. Các Ràng Buộc Cấm Kỵ Tuyệt Đối (Negative Constraints)

Để giữ vững tinh thần cao cấp và thanh lịch, mọi thành viên và agent phát triển giao diện **TUYỆT ĐỐI TUÂN THỦ** các điều cấm sau:

| Điều cấm | Lý do & Giải pháp thay thế |
| :--- | :--- |
| **KHÔNG dùng font phổ thông SaaS** (Inter, Roboto, Open Sans) | Khiến sản phẩm trở nên generic, thiếu cá tính. Sử dụng `Geist Sans` cho UI và Font Serif biên tập cho tiêu đề. |
| **KHÔNG dùng icon nét mảnh trôi nổi** hay thay đổi kích thước thủ công bên trong nút | Dùng `lucide-react` chuẩn hóa thông qua thuộc tính `data-icon` của shadcn/base-ui. |
| **KHÔNG dùng bóng đổ nặng** (`shadow-md`, `shadow-lg`, `shadow-xl`) | Gây cảm giác cồng kềnh, lỗi thời. Dùng viền cứng tinh tế `1px solid var(--border)` hoặc hiệu ứng bóng khuếch tán cực nhẹ (< 0.04 opacity). |
| **KHÔNG dùng nền màu sặc sỡ** cho Hero/Section (xanh dương chói, đỏ, cam rực) | Giữ nền trắng ngà/ấm tự nhiên, sử dụng typography tương phản mạnh để thu hút thị giác. |
| **KHÔNG dùng gradient màu mè, 3D glassmorphism** | Không lạm dụng hiệu ứng gương kính làm giảm khả năng đọc của người dùng. |
| **KHÔNG dùng nút/khung hình viên thuốc (`rounded-full`) cho button chính hoặc card** | Chỉ áp dụng `rounded-full` cho các thẻ tag, status badge kích thước nhỏ. Button dùng `rounded-lg` (4px – 8px). |
| **KHÔNG sử dụng Emojis trong code, tiêu đề, văn bản hoặc biểu tượng hệ thống** | Thay thế toàn bộ bằng SVG Icons chuẩn mực của hệ thống. |
| **KHÔNG dùng nội dung giữ chỗ vô nghĩa** ("John Doe", "Acme Corp", "Lorem Ipsum") | Sử dụng dữ liệu thực tế mang ngữ cảnh Khoa CNTT, sinh viên và doanh nghiệp công nghệ tại Việt Nam. |
| **KHÔNG dùng từ ngữ sáo rỗng AI/Marketing** ("Elevate", "Seamless", "Unleash", "Game-changer") | Sử dụng văn phong gãy gọn, trong sáng, chuẩn mực nghiệp vụ sư phạm và công nghệ. |

---

## 3. Hệ Màu Sắc & Tokens (Color Tokens & Palette)

Hệ thống màu sắc tuân thủ nguyên tắc **"Màu sắc là tài nguyên khan hiếm" (Color as a Scarce Resource)** — phần lớn diện tích thuộc về dải đơn sắc ấm áp (Warm Monochrome), màu sắc chỉ xuất hiện có chủ đích nhằm truyền tải trạng thái thông tin (Semantic Feedback).

### 3.1 Dải Đơn Sắc Ấm (Warm Monochrome Base)
- **Canvas / Background**: 
  - Light mode: Trắng tinh khiết `#FFFFFF` hoặc trắng ngà ấm `#FBFBFA` / `#F7F6F3` (`oklch(1 0 0)`).
  - Dark mode: Than chì đậm `#141413` (`oklch(0.145 0 0)`).
- **Surface / Card / Container**:
  - Light mode: `#FFFFFF` hoặc `#F9F9F8`.
  - Dark mode: `#1D1D1C` (`oklch(0.205 0 0)`).
- **Structural Borders & Separators**:
  - Siêu mảnh, sắc nét: `1px solid #EAEAEA` hoặc `rgba(0, 0, 0, 0.08)` (Dark: `rgba(255, 255, 255, 0.1)`).
- **Typography Colors**:
  - Tiêu đề & Văn bản chính: Off-black / Than chì `#111111` hoặc `#1C1917` (`oklch(0.145 0 0)`). **Không dùng `#000000` thuần túy**.
  - Văn bản phụ / Ghi chú: Xám đá thạch anh `#787774` / `#71717A` (`oklch(0.556 0 0)`).

### 3.2 Dải Màu Nhấn Pastel Rửa Màu (Deliberate Muted Pastels)
Đặc quyền dùng cho Badges, Tags, Metadata, Icon Containers và phân loại trạng thái:

| Mục đích nghiệp vụ | Tên Token / Màu nền | Màu chữ tương phản | Ứng dụng thực tế trong Connect Alumni |
| :--- | :--- | :--- | :--- |
| **Hoạt động / Thành công** | Pale Green (`#EDF3EC`) | `#346538` | Doanh nghiệp đã xác minh, tin tuyển dụng đã duyệt, sinh viên đã nhận học bổng |
| **Chờ xử lý / Cảnh báo nhẹ** | Pale Yellow (`#FBF3DB`) | `#956400` | Hồ sơ tuyển dụng chờ Khoa duyệt, khảo sát sắp hết hạn, hồ sơ ứng tuyển mới |
| **Từ chối / Khẩn cấp** | Pale Red (`#FDEBEC`) | `#9F2F2D` | Tin tuyển dụng bị từ chối, hết hạn đăng ký talkshow, lỗi hệ thống |
| **Khoa / Học thuật / Sự kiện**| Pale Blue (`#E1F3FE`) | `#1F6C9F` | Thông báo từ Khoa CNTT, talkshow học thuật, chiến dịch quỹ khuyến học |
| **Cựu sinh viên / Đối tác** | Pale Slate (`#F1F1EF`) | `#444441` | Nhãn khoá tốt nghiệp (K44, K45), vị trí công tác (Senior Tech Lead, Founder) |

---

## 4. Kiến Trúc Typography & Thang Bậc Thị Giác

### 4.1 Bộ Phông Chữ (Font Stack)
1. **Primary Sans-Serif (`font-sans`)**: `Geist Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`. Dùng cho toàn bộ UI Controls, bảng biểu, thanh điều hướng, nhãn nút và văn bản nội dung.
2. **Editorial Serif (`font-serif`)**: `Newsreader`, `Playfair Display`, `Georgia`, `serif`. Dùng cho các tiêu đề lớn (Hero Title), tiêu đề bài xã luận, trích dẫn danh ngôn hoặc lời chia sẻ tâm huyết từ Cựu sinh viên tiêu biểu / Trưởng Khoa.
3. **Monospace (`font-mono`)**: `Geist Mono`, `SF Mono`, `monospace`. Dùng cho MSSV, mã doanh nghiệp (MST), mã định danh học bổng, ngày giờ, số liệu thống kê, phím tắt `<kbd>`.

### 4.2 Thang Đo & Quy Cách Chữ (Type Hierarchy)
- **Hero Title**: `text-4xl` đến `text-6xl`, tracking siết chặt (`tracking-tight` hoặc `-0.03em`), line-height gọn gàng (`leading-none` hoặc `leading-[1.1]`).
- **Section Heading**: `text-2xl` đến `text-3xl`, `font-semibold`, `tracking-tight`.
- **Card Title / Subtitle**: `text-base` đến `text-lg`, `font-medium`, `text-foreground`.
- **Body Content**: `text-sm` đến `text-base`, `leading-relaxed` (khoảng `1.6`), màu `text-foreground/90`.
- **Caption / Meta**: `text-xs`, `font-mono` hoặc `font-sans`, màu `text-muted-foreground`.
- **Status Tag / Badge**: `text-[11px]`, `font-medium`, `uppercase`, tracking giãn nhẹ (`tracking-wider`).

---

## 5. Quy Chuẩn Kỹ Thuật Base UI + shadcn Trong Dự Án

Dự án sử dụng gói **`@base-ui/react`** kết hợp kiểu dáng **`base-nova`** của shadcn. Agent và lập trình viên phải nắm vững sự khác biệt mấu chốt so với hệ Radix UI truyền thống:

### 5.1 Quy Tắc 1: Dùng `render` Thay Cho `asChild`
Base UI không dùng prop `asChild`. Để chuyển đổi phần tử cơ sở sang một phần tử khác (như liên kết `<Link>` của Next.js), ta dùng prop `render`.

- Khi render thành thẻ không phải nút (như `<a>` hoặc `<Link>`), **BẮT BUỘC** khai báo `nativeButton={false}`.

```tsx
// ❌ SAI (Kiểu Radix UI cũ):
<Button asChild>
  <Link href="/jobs">Xem việc làm</Link>
</Button>

// ❌ SAI (Thiếu nativeButton={false} trong Base UI):
<Button render={<Link href="/jobs" />}>
  Xem việc làm
</Button>

// ✅ ĐÚNG (Chuẩn Base UI của dự án):
<Button render={<Link href="/jobs" />} nativeButton={false}>
  Xem việc làm
</Button>

// ✅ ĐÚNG (Áp dụng cho DialogTrigger, SheetTrigger, PopoverTrigger...):
<DialogTrigger render={<Button variant="outline" />}>
  Thêm tin tuyển dụng
</DialogTrigger>
```

### 5.2 Quy Tắc 2: Luôn Dùng Arrow Function Wrap Component
Theo quy tắc phát triển của đồ án, luôn dùng hàm mũi tên (Arrow Function) để định nghĩa component nhằm đảm bảo tính đồng nhất, tránh lỗi ngữ cảnh `this` và hoisting khi Next.js App Router biên dịch phía máy chủ (Server Components).

```tsx
// ❌ TRÁNH DÙNG:
function JobCard({ job }: JobCardProps) {
  return <Card>...</Card>;
}

// ✅ BẮT BUỘC DÙNG:
const JobCard = ({ job }: JobCardProps) => {
  return (
    <Card>
      {/* Nội dung */}
    </Card>
  );
};
```

### 5.3 Quy Tắc 3: Biểu Mẫu (Forms) Dùng `FieldGroup` + `Field`
Tuyệt đối không xếp đặt form bằng các thẻ `div` bọc `space-y-*` hay gắn nhãn `Label` thủ công.

```tsx
// ❌ SAI:
<div className="space-y-4">
  <div>
    <Label htmlFor="companyName">Tên doanh nghiệp</Label>
    <Input id="companyName" />
  </div>
</div>

// ✅ ĐÚNG:
<FieldGroup className="gap-5">
  <Field>
    <FieldLabel htmlFor="companyName">Tên doanh nghiệp</FieldLabel>
    <Input id="companyName" placeholder="VD: Tập đoàn Công nghệ FPT" />
    <FieldDescription>Nhập tên pháp nhân theo giấy phép ĐKKD.</FieldDescription>
  </Field>
</FieldGroup>

// ✅ Xử lý Trạng thái Validation & Disabled:
<Field data-invalid={Boolean(errors.email)}>
  <FieldLabel htmlFor="email">Email công tác</FieldLabel>
  <Input id="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
  {errors.email && <FieldDescription>{errors.email.message}</FieldDescription>}
</Field>
```

### 5.4 Quy Tắc 4: Xử Lý Biểu Tượng (Icons) Trong Component
Dự án sử dụng thư viện **`lucide-react`**.
- Biểu tượng trong `Button` phải được gắn cờ `data-icon="inline-start"` (ở đầu) hoặc `data-icon="inline-end"` (ở cuối).
- **KHÔNG** thêm class định cỡ (`size-4`, `w-4 h-4`, `mr-2`) vào biểu tượng bên trong các thành phần shadcn/base-ui vì CSS của component đã tự động tính toán.

```tsx
// ❌ SAI:
<Button>
  <PlusIcon className="size-4 mr-2" />
  Tạo khảo sát
</Button>

// ✅ ĐÚNG:
<Button>
  <PlusIcon data-icon="inline-start" />
  Tạo khảo sát
</Button>
```

### 5.5 Quy Tắc 5: Cơ Chế Select & ToggleGroup Trong Base UI
- `Select` của Base UI bắt buộc nhận prop `items` ở cấp độ gốc và dùng placeholder thông qua phần tử giá trị `null`:

```tsx
const facultyMajors = [
  { label: "Chọn chuyên ngành", value: null },
  { label: "Kỹ thuật phần mềm", value: "se" },
  { label: "Hệ thống thông tin", value: "is" },
  { label: "Mạng máy tính & An toàn thông tin", value: "nc" },
  { label: "Khoa học máy tính & AI", value: "ai" },
];

const MajorSelect = () => {
  return (
    <Select items={facultyMajors}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} side="bottom">
        <SelectGroup>
          {facultyMajors.map((item) => (
            <SelectItem key={String(item.value)} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
```

- `ToggleGroup` của Base UI dùng prop boolean `multiple` và giá trị mặc định luôn là mảng:

```tsx
<ToggleGroup defaultValue={["internship"]} spacing={2}>
  <ToggleGroupItem value="internship">Thực tập sinh</ToggleGroupItem>
  <ToggleGroupItem value="fresher">Mới tốt nghiệp</ToggleGroupItem>
  <ToggleGroupItem value="experienced">Đã có kinh nghiệm</ToggleGroupItem>
</ToggleGroup>
```

### 5.6 Quy Tắc 6: Cấu Trúc Toàn Vẹn Của Các Thành Phần Giao Diện
1. **Card**: Phải có cấu trúc tiêu chuẩn đầy đủ, không dồn tất cả vào `CardContent`:
   `<Card>` → `<CardHeader>` (`<CardTitle>`, `<CardDescription>`) → `<CardContent>` → `<CardFooter>`.
2. **Hộp thoại (Dialog, Sheet, Drawer)**: Bắt buộc luôn có `DialogTitle` (hoặc `SheetTitle`, `DrawerTitle`) vì tiêu chuẩn Screen Reader. Nếu không muốn hiển thị chữ trên màn hình, thêm `className="sr-only"`.
3. **Trạng thái rỗng (Empty State)**: Dùng component `Empty` (`<EmptyHeader>`, `<EmptyMedia>`, `<EmptyTitle>`, `<EmptyDescription>`, `<EmptyContent>`), không dựng `div` tạm bợ.
4. **Thông báo hệ thống (Toast)**: Dự án chạy trên Base UI, do đó dùng component `toast` nội bộ (`import { toast } from "@/components/ui/toast"`), không dùng `sonner`.
5. **Trạng thái đang tải (Loading Button)**: Không có prop `isLoading`. Kết hợp `<Spinner data-icon="inline-start" />` cùng thuộc tính `disabled`.

---

## 6. Thiết Kế Bố Cục & Hệ Thống Bento Grid (Layout Architecture)

### 6.1 Nhịp Thở Thị Giác (Macro-Whitespace)
- Khoảng cách giữa các khối nội dung lớn (Sections) trên trang công cộng: `py-20` đến `py-28`.
- Giới hạn chiều rộng đọc nội dung bài viết và xã luận: `max-w-4xl` hoặc `max-w-5xl` để mắt người dùng không bị mỏi khi quét dòng.
- Container tổng thể của trang Dashboard/Quản lý: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

### 6.2 Mô Hình Bento Grid Bất Đối Xứng (Asymmetrical Bento)
Áp dụng cho Dashboard sinh viên, Landing page Khoa, và Cổng thông tin Doanh nghiệp:
- Cấu trúc: Kết hợp các ô thẻ `col-span-12`, `md:col-span-8`, `md:col-span-4`, `md:col-span-6`.
- Mỗi thẻ là một card tối giản: `border border-border/80 bg-card rounded-xl p-6 sm:p-8 hover:border-foreground/20 transition-colors`.
- Nền trang web không để phẳng trơn đơn điệu: Thêm một điểm sáng tỏa nhẹ tự nhiên (Subtle warm radial light `radial-gradient(ellipse at top, rgba(0,0,0,0.02), transparent 70%)`).

---

## 7. Thiết Kế Chi Tiết Từng Module Đồ Án (Module Specifications)

Dựa trên đặc tả hệ thống (`docs/SPEC.md`), đây là hướng dẫn thiết kế chuẩn cho 7 phân hệ chính:

### 7.1 Module 1: Cổng Thông Tin Khoa & Mạng Lưới (Editorial Portal)
- **Hero Section**: 
  - Tiêu đề Editorial Serif đậm chất tri thức: *"Cầu nối Tri thức & Cơ hội — Khoa Công nghệ Thông tin"*.
  - Huy hiệu (Badge): `Pale Blue` đánh dấu năm học / cột mốc phát triển.
  - Số liệu ấn tượng (Metrics Bar) hiển thị phông `Geist Mono`: `98.5%` có việc làm, `250+` Cựu SV cố vấn, `80+` Đối tác doanh nghiệp.
- **Dòng Sự Kiện / Dòng Thời Gian**: Thiết kế thẻ phẳng, có mốc thời gian dạng monospace và thẻ pastel phân loại.

### 7.2 Module 2: Sàn Tuyển Dụng & Kết Nối Doanh Nghiệp (Job Hub)
- **Danh Sách Việc Làm (Bento Grid / List View)**:
  - Header: Logo doanh nghiệp bo góc `rounded-lg size-12`, nhãn trạng thái xác minh (`Verified Partner` với `Pale Green Badge`).
  - Thẻ kỹ năng: Sử dụng nhãn xám pastel thanh lịch (`#F1F1EF`), không dùng các màu neon.
  - Mức lương / Địa điểm: Định dạng font `Geist Mono` với khoảng lương rõ ràng.
- **Form Đăng Tin (Dành cho Doanh Nghiệp)**:
  - Phân bước rõ ràng với `FieldGroup`.
  - Có khung cảnh báo `Alert` ghi rõ *"Tin tuyển dụng sẽ được Ban chủ nhiệm Khoa kiểm duyệt trong vòng 24h trước khi hiển thị công khai"*.

### 7.3 Module 3: Talkshow, Workshop & Giao Lưu Cựu SV (Event & Mentorship)
- **Thẻ Sự Kiện (Event Card)**:
  - Phân biệt rõ sự kiện Offline (địa điểm giảng đường/hội trường) và Online (Google Meet/MS Teams).
  - Khối diễn giả (Speaker Badge): Ảnh đại diện bo góc, họ tên, chức vụ thực tế kèm khoá tốt nghiệp (VD: *Cựu SV K41 - Engineering Lead tại VNG*).
  - Nút đăng ký: Đổi trạng thái rõ ràng (Chưa mở / Đăng ký ngay / Đã đủ số lượng).

### 7.4 Module 4: Góc Chia Sẻ & Diễn Đàn Tri Thức (Alumni Stories & Insights)
- **Trình bày dạng tạp chí chuyên đề**:
  - Tiêu đề bài viết dùng `font-serif` tinh tế.
  - Tác giả được trích dẫn trang trọng với chức danh và chuyên ngành tốt nghiệp.
  - Phân loại chủ đề bằng Badge pastel: *Kinh nghiệm phỏng vấn*, *Lộ trình thăng tiến*, *Học bổng sau đại học*, *Khởi nghiệp công nghệ*.

### 7.5 Module 5: Khảo Sát Việc Làm Sau Tốt Nghiệp & Form Builder
- **Giao diện Khảo Sát (Sinh Viên / Cựu SV)**:
  - Thiết kế tập trung cao độ (Distraction-free mode), thanh tiến trình `Progress` thanh mảnh ở đỉnh trang.
  - Các câu hỏi trắc nghiệm bố trí dạng thẻ chọn lớn tương tác cao (`ToggleGroup` hoặc thẻ Radio thẻ nổi).
- **Bộ Dựng Form Của Khoa (Drag & Drop Form Builder)**:
  - Tích hợp `@dnd-kit/core` mượt mà, khung thả có viền nét đứt mảnh (`border-dashed border-border`).
  - Danh mục các trường dữ liệu ở thanh bên (`Field Palette`) tối giản và trực quan.

### 7.6 Module 6: Quỹ Khuyến Học & Học Bổng Doanh Nghiệp (Scholarship & Fund)
- **Bảng Vinh Danh Nhà Tài Trợ**:
  - Danh sách minh bạch với TanStack Table hoặc Grid thẻ tối giản.
  - Tiến độ giải ngân chiến dịch học bổng sử dụng thanh `Progress` tối giản kèm số tiền cụ thể dạng `Geist Mono`.
- **Nộp Hồ Sơ Xin Học Bổng**:
  - Tải lên minh chứng thành tích học tập / hoàn cảnh gia đình qua component `Attachment` chuyên dụng.

### 7.7 Module 7: Bảng Điều Khiển Quản Trị Khoa & Doanh Nghiệp (Management Console)
- **Bảng Dữ Liệu Lớn (`@tanstack/react-table`)**:
  - Tuân thủ quy tắc từ tài liệu `node_modules/@tanstack/react-table/skills/getting-started/SKILL.md`.
  - Header bảng sắc nét, chữ in hoa cỡ nhỏ `text-xs font-medium text-muted-foreground uppercase`.
  - Các thao tác nhanh (Duyệt tin, Từ chối, Xem chi tiết) gom gọn trong `DropdownMenu` hoặc `Drawer` trượt từ cạnh phải.
  - Thanh lọc kết hợp: Ô tìm kiếm `InputGroup` + Bộ chọn nhanh `Select` hoặc `ToggleGroup`.

---

## 8. Chuyển Động Vi Mô & Tương Tác Tinh Tế (Micro-Interactions)

Chuyển động trong phong cách Editorial Utilitarian là **"vô hình nhưng tạo cảm giác mượt mà và đẳng cấp"**:

1. **Hiệu Ứng Xuất Hiện Khi Cuộn (Scroll Reveal)**:
   - Các khối Card xuất hiện mềm mại khi vào khung nhìn: `translate-y-3` (`12px`) kết hợp `opacity-0` sang `translate-y-0 opacity-100`.
   - Thời lượng: `500ms - 600ms` với gia tốc mượt mà `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Reveal theo tầng (Cascade Stagger): Danh sách bài viết hoặc việc làm xuất hiện nối đuôi nhau với độ trễ `index * 50ms`.
2. **Tương Tác Nút Bấm & Thẻ (Hover & Active States)**:
   - Thẻ (Card): Khi hover chỉ đổi màu viền nhẹ nhàng (`border-foreground/20`) hoặc nâng nhẹ với bóng đổ siêu phân tán (`box-shadow: 0 2px 12px rgba(0,0,0,0.03)`).
   - Nút bấm (Button): Trạng thái click `:active` co nhẹ vi mô `transform: scale(0.98)` mang lại phản hồi xúc giác chân thực.
3. **Hiệu Ứng Chờ (Shimmer & Loading)**:
   - Sử dụng tiện ích `.shimmer` cho văn bản đang sinh hoặc tải dữ liệu.
   - Sử dụng thẻ `<Skeleton />` có kích thước tương xứng (`size-10`, `h-4 w-3/4`), không vẽ các div pulse màu mè.

---

## 9. Bảng Quy Chuẩn Đối Chiếu Viết Code (Good vs Bad Reference)

Để kiểm tra nhanh trước khi commit mã nguồn, đối chiếu bảng sau:

| Tình huống code | ❌ Cách viết SAI | ✅ Cách viết ĐÚNG CHUẨN |
| :--- | :--- | :--- |
| **Khai báo Component** | `function AlumniCard(props) { ... }` | `const AlumniCard = (props) => { ... };` |
| **Nút bấm chứa liên kết** | `<Button asChild><Link href="/apply">Ứng tuyển</Link></Button>` | `<Button render={<Link href="/apply" />} nativeButton={false}>Ứng tuyển</Button>` |
| **Bố cục danh sách dọc** | `<div className="space-y-4">` | `<div className="flex flex-col gap-4">` |
| **Kích thước vuông (Avatar/Icon)**| `<Avatar className="w-10 h-10">` | `<Avatar className="size-10">` |
| **Icon trong nút** | `<Button><Search className="size-4 mr-2" />Tìm</Button>` | `<Button><Search data-icon="inline-start" />Tìm</Button>` |
| **Chọn danh mục Form** | `<Select><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger></Select>` | `<Select items={items}><SelectTrigger><SelectValue /></SelectTrigger>...</Select>` |
| **Dòng trạng thái rỗng** | `<div className="text-center py-10">Chưa có dữ liệu</div>` | `<Empty><EmptyHeader><EmptyTitle>Chưa có dữ liệu</EmptyTitle></EmptyHeader></Empty>` |
| **Bảng thông báo** | `<div className="bg-yellow-50 p-4 border rounded">Lưu ý</div>` | `<Alert><AlertTitle>Lưu ý</AlertTitle>...</Alert>` |
| **Màu sắc trạng thái** | `<span className="text-emerald-500 font-bold">Đã duyệt</span>` | `<Badge variant="secondary" className="bg-[#EDF3EC] text-[#346538]">Đã duyệt</Badge>` |
| **Hiệu ứng cắt gọn chữ** | `className="overflow-hidden text-ellipsis whitespace-nowrap"` | `className="truncate"` |

---

## 10. Lời Kết & Cam Kết Chất Lượng Đồ Án Tốt Nghiệp

Bản đặc tả thiết kế này là kim chỉ nam duy nhất cho toàn bộ giao diện của hệ thống **Connect Alumni**. Việc tuân thủ nghiêm ngặt từ triết lý thẩm mỹ Minimalist Editorial, bảng màu Pastel có chủ đích, tới từng chi tiết kỹ thuật của Base UI và shadcn sẽ biến đồ án tốt nghiệp trở thành một sản phẩm thực thụ: **Hiện đại - Sang trọng - Chuẩn mực công nghệ - Sẵn sàng chuyển giao thực tế cho Nhà trường và Doanh nghiệp**.
