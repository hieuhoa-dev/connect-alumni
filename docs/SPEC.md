# ĐẶC TẢ HỆ THỐNG

### Nền tảng kết nối Sinh viên – Khoa – Cựu sinh viên – Doanh nghiệp

---

## 1. Tổng quan

### 1.1 Mục tiêu

Xây dựng nền tảng web do Khoa quản lý, dùng để:

- Kết nối sinh viên với cơ hội việc làm từ đối tác doanh nghiệp
- Tổ chức các buổi talkshow/sự kiện với cựu sinh viên
- Thu thập chia sẻ kinh nghiệm từ cựu sinh viên
- Khảo sát tình hình việc làm sau tốt nghiệp
- Vận hành quỹ khuyến học, kết nối tài trợ và xét duyệt hỗ trợ tài chính cho sinh viên

### 1.2 Phạm vi

Hệ thống là website nhà trường quản lý và cấp phát cho đối tác sử dụng — nghĩa là mọi tài khoản doanh nghiệp phải qua bước xác minh/duyệt của Khoa trước khi được phép hoạt động.

### 1.3 Công nghệ sử dụng

| Thành phần            | Công nghệ                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Framework             | Next.js 16 (App Router)                                                                    |
| Ngôn ngữ              | TypeScript                                                                                 |
| Xác thực              | better-auth                                                                                |
| CSDL                  | PostgreSQL (Neon — sẽ chuyển sang Docker tự host)                                          |
| ORM                   | Drizzle ORM                                                                                |
| Cache/Queue           | Redis (Upstash — sẽ chuyển sang Docker tự host) + BullMQ                                   |
| Form/Validation       | react-hook-form + zod                                                                      |
| Drag & Drop           | @dnd-kit/core + @dnd-kit/sortable (Form Builder)                                           |
| UI                    | @base-ui/react, shadcn, Tailwind, lucide-react                                             |
| Data table            | @tanstack/react-table                                                                      |
| Data fetching         | @tanstack/react-query                                                                      |
| Biểu đồ               | recharts                                                                                   |
| Lưu trữ file          | Neon Object Storage (S3-compatible) — trừu tượng hoá để dễ chuyển sang MinIO/S3 khi Docker |
| AI (tuỳ chọn mở rộng) | Vercel AI SDK (`ai`)                                                                       |

> [!NOTE]
> **Nguyên tắc thiết kế hạ tầng:** Toàn bộ kết nối DB/Redis/Storage đi qua một module duy nhất (`src/db/index.ts`, `src/lib/redis.ts`, `src/lib/storage.ts`). Dùng driver chuẩn (`pg`, `ioredis`) thay vì SDK riêng của Neon/Upstash để việc chuyển sang Docker sau này chỉ cần đổi biến môi trường, không sửa code nghiệp vụ.

---

## 2. Vai trò người dùng (Actors)

| Vai trò                             | Mô tả                      | Quyền hạn chính                                                                                                                              |
| ----------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sinh viên**                       | Người dùng đang theo học   | Xem/ứng tuyển việc làm, đăng ký sự kiện, đọc bài chia sẻ, làm khảo sát, nộp hồ sơ xin học bổng                                               |
| **Cựu sinh viên (Alumni)**          | Sinh viên đã tốt nghiệp    | Như sinh viên + nhận lời mời talkshow, đăng bài chia sẻ kinh nghiệm, cam kết tài trợ quỹ                                                     |
| **Đối tác/Doanh nghiệp (Employer)** | Tài khoản bên ngoài trường | Đăng ký hồ sơ công ty (chờ duyệt), đăng tin tuyển dụng (chờ duyệt), cam kết tài trợ quỹ                                                      |
| **Nhân sự Khoa (Faculty Staff)**    | Người vận hành nội dung    | Duyệt tin tuyển dụng, duyệt hồ sơ công ty, tạo sự kiện, mời cựu SV, tạo form khảo sát, tạo chiến dịch học bổng, xét duyệt hồ sơ xin học bổng |
| **Quản trị viên (Admin)**           | Quản trị hệ thống          | Toàn quyền + quản lý người dùng, phân quyền nhân sự Khoa, xem audit log                                                                      |

---

## 3. Module chức năng

### 3.1 Xác thực & Hồ sơ người dùng

- Đăng ký/đăng nhập qua better-auth (email/password; có thể mở rộng OAuth Google với email trường)
- Hồ sơ mở rộng theo vai trò (mã số SV, khoá, ngành, công ty...)
- Khoá/mở tài khoản (Admin)

### 3.2 Tuyển dụng (Job Board)

- Doanh nghiệp đăng ký hồ sơ công ty → Khoa xác minh (`verified` / `rejected`)
- Doanh nghiệp đã xác minh đăng tin tuyển dụng → trạng thái `pending`
- Khoa duyệt (`approved` / `rejected`, có lý do từ chối)
- Tin hết hạn bị ẩn theo 2 cơ chế kết hợp (xem mục 4.2)
- Sinh viên tìm kiếm/lọc theo ngành, hình thức, địa điểm

### 3.3 Sự kiện & Talkshow

- Khoa tạo sự kiện (talkshow/workshop/job fair), chọn hình thức online/offline
- Khoa mời cựu sinh viên làm diễn giả → cựu SV `accept`/`decline` (có lịch sử mời)
- Sinh viên đăng ký tham gia (giới hạn số lượng nếu có)
- Điểm danh (`attended` / `absent`)

### 3.4 Chia sẻ kinh nghiệm

- Cựu sinh viên đăng bài — luôn qua luồng duyệt: `draft` → `pending` → `published` / `rejected`
- Gắn tag theo ngành nghề/chủ đề
- Sinh viên xem, tìm kiếm theo tag

### 3.5 Form Builder & Khảo sát _(tự xây, không dùng Google Form)_

- Khoa tạo form (loại: khảo sát việc làm, hồ sơ xin học bổng, feedback sự kiện...)
- Tự thêm câu hỏi với nhiều kiểu: văn bản ngắn/dài, chọn 1, chọn nhiều, thang đo, upload file
- Nhắm đối tượng theo nhiều khoá (`target_batches`) và/hoặc vai trò, có hạn nộp
- Người dùng trả lời; Khoa xem kết quả dạng bảng + thống kê biểu đồ

### 3.6 Quỹ Khuyến học & Hỗ trợ tài chính

- Khoa tạo chiến dịch học bổng (mục tiêu số tiền, thời hạn nộp hồ sơ)
- Doanh nghiệp/Cựu SV cam kết tài trợ — ghi nhận danh dự, **không xử lý giao dịch tiền thật** trong hệ thống; Khoa xác nhận thủ công khi đã nhận tiền ngoài hệ thống (`pledged` → `fulfilled`)
- Khi Khoa xác nhận nhận tiền, `current_amount` được cộng dồn trong một transaction tường minh (xem mục 4.6)
- Sinh viên nộp hồ sơ xin hỗ trợ qua form (minh chứng hoàn cảnh, bảng điểm dạng file upload)
- Khoa xét duyệt (`pending` / `reviewing` / `approved` / `rejected`), có thể chấm điểm theo tiêu chí
- **Bảo mật:** hồ sơ chứa dữ liệu tài chính cá nhân nhạy cảm → chỉ chủ hồ sơ và Khoa xem được, truy cập file qua signed URL có thời hạn, mọi lượt xem được ghi audit log

### 3.7 Thông báo

- Gửi thông báo in-app + email khi: tin tuyển dụng được duyệt/từ chối, được mời talkshow, sắp đến hạn khảo sát, kết quả xét học bổng
- Xử lý bất đồng bộ qua BullMQ + Redis: app gọi `queue.add()` đẩy job vào Redis; worker (`src/workers/notification.worker.ts`) chạy như tiến trình Node.js riêng, tự kết nối Redis lắng nghe — không đi qua HTTP route

### 3.8 Dashboard & Thống kê _(Khoa/Admin)_

- Tỷ lệ sinh viên có việc làm theo khoá (từ dữ liệu khảo sát)
- Số tin tuyển dụng theo ngành/trạng thái (bao gồm `expired`)
- Tỷ lệ tham gia sự kiện
- Tổng quỹ học bổng đã cam kết/đã nhận, số hồ sơ theo trạng thái

### 3.9 Quản trị & Audit

- Quản lý tài khoản, phân quyền nhân sự Khoa
- Audit log: ai duyệt/từ chối/xem gì, khi nào

---

## 4. Thiết kế cơ sở dữ liệu

### 4.1 Nhóm Auth & Người dùng

> `user`, `session`, `account`, `verification` — do better-auth quản lý, không tự định nghĩa lại.

```
profiles
├─ id                uuid        PK
├─ user_id           uuid        FK → user.id (unique)
├─ role              enum(student, alumni, employer, faculty_staff, admin)
├─ full_name         varchar
├─ student_code      varchar     (nullable)
├─ faculty           varchar     (nullable)
├─ batch_year        int         (nullable)  -- khoá nhập học
├─ graduation_year   int         (nullable)
├─ phone             varchar     (nullable)
├─ avatar_url        varchar     (nullable)
├─ bio               text        (nullable)
├─ status            enum(active, locked)
├─ created_at        timestamp
└─ updated_at        timestamp
```

### 4.2 Nhóm Tuyển dụng

> **Xử lý tin hết hạn — 2 cơ chế kết hợp:**
>
> - **Query-time filter (bắt buộc):** mọi query hiển thị tin tuyển dụng cho sinh viên đều thêm `status = 'approved' AND expires_at > now()` — đảm bảo tin hết hạn không bao giờ hiển thị dù cron chưa chạy kịp.
> - **BullMQ repeatable job (mỗi giờ):** quét `job_posts` có `expires_at < now() AND status = 'approved'` → cập nhật `status = 'expired'` — để dashboard đếm đúng số tin đã hết hạn và để Employer thấy đúng trạng thái tin của họ.

```
companies
├─ id                    uuid    PK
├─ name                  varchar
├─ description           text
├─ logo_url              varchar (nullable)
├─ website               varchar (nullable)
├─ industry              varchar
├─ verification_status   enum(pending, verified, rejected)
├─ rejected_reason       text    (nullable)
├─ created_by            uuid    FK → user.id
├─ verified_by           uuid    FK → user.id (nullable)
├─ verified_at           timestamp (nullable)
└─ created_at            timestamp

company_members                      -- quan hệ N-N (1 user có thể thuộc nhiều công ty)
├─ id                uuid    PK
├─ company_id        uuid    FK → companies.id
├─ user_id           uuid    FK → user.id
├─ role_in_company   varchar
├─ is_active_context boolean default false  -- công ty đang chọn làm ngữ cảnh làm việc
└─ created_at        timestamp
-- UNIQUE(company_id, user_id): 1 user không join trùng 1 công ty 2 lần
-- Không có UNIQUE(user_id): 1 user được phép thuộc nhiều công ty

job_posts
├─ id                 uuid    PK
├─ company_id         uuid    FK → companies.id
├─ title              varchar
├─ description        text
├─ requirements       text
├─ location           varchar
├─ job_type           enum(full_time, part_time, internship)
├─ salary_range       varchar (nullable)
├─ apply_url_or_email varchar
├─ status             enum(pending, approved, rejected, expired)
├─ rejected_reason    text    (nullable)
├─ reviewed_by        uuid    FK → user.id (nullable)
├─ reviewed_at        timestamp (nullable)
├─ expires_at         timestamp
└─ created_at         timestamp
```

### 4.3 Nhóm Sự kiện

```
events
├─ id                uuid    PK
├─ type              enum(talkshow, workshop, job_fair, other)
├─ title             varchar
├─ description       text
├─ format            enum(online, offline)
├─ location_or_link  varchar
├─ start_time        timestamp
├─ end_time          timestamp
├─ capacity          int     (nullable)
├─ status            enum(draft, published, cancelled, completed)
├─ cover_image_url   varchar (nullable)
├─ created_by        uuid    FK → user.id
└─ created_at        timestamp

event_speakers
├─ id                   uuid    PK
├─ event_id             uuid    FK → events.id
├─ alumni_user_id       uuid    FK → user.id
├─ invitation_status    enum(pending, accepted, declined)
├─ invited_at           timestamp
├─ responded_at         timestamp (nullable)
└─ note                 text    (nullable)

event_registrations
├─ id                uuid    PK
├─ event_id          uuid    FK → events.id
├─ user_id           uuid    FK → user.id
├─ attendance_status enum(registered, attended, absent)
└─ registered_at     timestamp
```

### 4.4 Nhóm Chia sẻ kinh nghiệm

> Mọi bài viết đều qua luồng duyệt thủ công: `draft` → `pending` → `published` / `rejected`. Không có nhánh auto-publish.

```
experience_posts
├─ id               uuid    PK
├─ author_id        uuid    FK → user.id
├─ title            varchar
├─ content          text
├─ cover_image_url  varchar (nullable)
├─ tags             jsonb
├─ status           enum(draft, pending, published, rejected)
├─ view_count       int     default 0
├─ published_at     timestamp (nullable)
└─ created_at       timestamp
```

### 4.5 Nhóm Form Builder _(dùng chung cho Khảo sát & Hồ sơ học bổng)_

```
forms
├─ id              uuid      PK
├─ type            enum(survey, scholarship_application, event_feedback, other)
├─ title           varchar
├─ description     text
├─ target_batches  integer[] (nullable)  -- NULL/[] = tất cả khoá; nhiều khoá: [2021, 2022]
├─ target_role     enum(student, alumni, all) (nullable)
├─ deadline        timestamp (nullable)
├─ status          enum(draft, open, closed)
├─ created_by      uuid      FK → user.id
└─ created_at      timestamp

form_questions
├─ id              uuid    PK
├─ form_id         uuid    FK → forms.id
├─ order_index     int
├─ question_type   enum(short_text, long_text, single_choice, multi_choice, scale, file_upload)
├─ label           varchar
├─ options         jsonb   (nullable)  -- cho single/multi_choice
├─ is_required     boolean
└─ config          jsonb   (nullable)  -- vd: min/max cho scale

form_responses
├─ id            uuid    PK
├─ form_id       uuid    FK → forms.id
├─ respondent_id uuid    FK → user.id
└─ submitted_at  timestamp

form_answers
├─ id            uuid    PK
├─ response_id   uuid    FK → form_responses.id
├─ question_id   uuid    FK → form_questions.id
├─ answer_value  jsonb               -- text/lựa chọn
└─ file_url      varchar (nullable)  -- nếu question_type = file_upload
```

### 4.6 Nhóm Quỹ Khuyến học

> **Cập nhật `current_amount`:** xử lý tường minh trong Server Action "Khoa xác nhận đã nhận tiền", không dùng DB trigger:
>
> ```sql
> BEGIN TRANSACTION
>   UPDATE donation_pledges SET status = 'fulfilled' WHERE id = :pledgeId;
>   UPDATE scholarship_campaigns SET current_amount = current_amount + :amount WHERE id = :campaignId;
> COMMIT
> ```
>
> **Ràng buộc chuyển trạng thái pledge:** `pledged → fulfilled` hoặc `pledged → cancelled` — không cho phép `fulfilled → cancelled`. Mọi điều chỉnh sai sót tạo bản ghi riêng, không sửa ngược trạng thái.

```
scholarship_campaigns
├─ id                    uuid      PK
├─ title                 varchar
├─ description           text
├─ target_amount         numeric
├─ current_amount        numeric   default 0
├─ application_form_id   uuid      FK → forms.id
├─ application_deadline  timestamp
├─ status                enum(draft, open, closed)
├─ created_by            uuid      FK → user.id
└─ created_at            timestamp

donation_pledges
├─ id                  uuid      PK
├─ campaign_id         uuid      FK → scholarship_campaigns.id
├─ donor_id            uuid      FK → user.id (nullable — tài trợ ngoài hệ thống/ẩn danh)
├─ donor_display_name  varchar   NOT NULL  -- snapshot tên tại thời điểm tài trợ, không JOIN động
├─ is_anonymous        boolean   default false  -- có hiển thị công khai tên hay không
├─ amount              numeric
├─ status              enum(pledged, fulfilled, cancelled)
├─ note                text      (nullable)
├─ created_by          uuid      FK → user.id NOT NULL  -- ai nhập bản ghi này (chính donor hoặc nhân sự Khoa)
└─ created_at          timestamp
-- Khi donor tự cam kết: donor_id = created_by = chính họ
-- Khi Khoa nhập hộ (tài trợ ngoài hệ thống): donor_id = NULL, created_by = tài khoản nhân sự Khoa

scholarship_applications
├─ id               uuid      PK
├─ campaign_id      uuid      FK → scholarship_campaigns.id
├─ student_id       uuid      FK → user.id
├─ form_response_id uuid      FK → form_responses.id
├─ status           enum(pending, reviewing, approved, rejected)
├─ score            numeric   (nullable)
├─ reviewed_by      uuid      FK → user.id (nullable)
├─ review_note      text      (nullable)
├─ decided_at       timestamp (nullable)
└─ submitted_at     timestamp
```

### 4.7 Nhóm Thông báo & Vận hành

```
notifications
├─ id          uuid    PK
├─ user_id     uuid    FK → user.id
├─ type        varchar
├─ title       varchar
├─ body        text
├─ link_url    varchar (nullable)
├─ is_read     boolean default false
└─ created_at  timestamp

audit_logs
├─ id           uuid    PK
├─ actor_id     uuid    FK → user.id
├─ action       varchar -- vd: "approve_job_post", "view_scholarship_file"
├─ entity_type  varchar
├─ entity_id    uuid
├─ metadata     jsonb   (nullable)
└─ created_at   timestamp

uploaded_files
├─ id            uuid    PK
├─ owner_id      uuid    FK → user.id
├─ related_type  varchar -- vd: "scholarship_application", "form_answer"
├─ related_id    uuid
├─ file_key      varchar -- key trong object storage
├─ file_url      varchar (nullable) -- có thể để trống, sinh signed URL khi cần
├─ mime_type     varchar
├─ size_bytes    int
└─ created_at    timestamp
```

---

## 5. Cơ chế phân quyền

> [!IMPORTANT]
> Route group `(faculty-admin)` chỉ là tổ chức thư mục, **không phải** cơ chế bảo mật. Hệ thống dùng **2 lớp bắt buộc**:

### Lớp 1 — UX Guard (`middleware.ts`)

Chặn theo path prefix để redirect sớm, cải thiện trải nghiệm người dùng:

- Chưa đăng nhập hoặc `role` không thuộc `[faculty_staff, admin]` → redirect khỏi `/(faculty-admin)/*`
- Tương tự với các route group khác theo vai trò

**Giới hạn:** lớp này có thể bị bỏ qua nếu ai đó gọi thẳng Server Action/API Route, nên không được coi là đủ để bảo vệ dữ liệu.

### Lớp 2 — Hard Guard (`lib/permissions.ts`)

Mỗi Server Action/Route Handler nhạy cảm phải tự gọi `requireRole(...)` ngay đầu hàm, **trước khi chạm vào DB**:

```ts
// Ví dụ: chỉ Admin mới được xem audit log
export async function getAuditLogs() {
  await requireRole('admin') // ném lỗi ngay nếu không đủ quyền
  return db.select().from(auditLogs)...
}

// Ví dụ: Employer chỉ được tạo job_post cho công ty mình đang active
export async function createJobPost(data: JobPostInput) {
  const session = await requireRole('employer')
  const membership = await db.query.companyMembers.findFirst({
    where: and(
      eq(companyMembers.userId, session.user.id),
      eq(companyMembers.companyId, data.companyId),
      eq(companyMembers.isActiveContext, true),
    ),
  })
  if (!membership) throw new ForbiddenError()
  // ... tiếp tục tạo job_post
}
```

> [!CAUTION]
> Không bao giờ tin route group hay `layout.tsx` là đủ để bảo vệ dữ liệu nhạy cảm. Lớp 2 là **không được bỏ qua**.

### Phân quyền Employer theo ngữ cảnh công ty

Vì `company_members` là N-N (1 user thuộc nhiều công ty), mọi thao tác tạo/sửa tài nguyên liên quan đến công ty phải kiểm tra thêm:

1. User có phải thành viên của `company_id` đang thao tác không?
2. `is_active_context = true` cho đúng công ty đó trong session không?

UI cần có **company switcher** ở `(employer)/layout.tsx` — nếu user thuộc > 1 công ty, hiển thị dropdown để chọn công ty đang làm việc, set `is_active_context = true` cho công ty được chọn (và `false` cho các công ty còn lại của user đó).

---

## 6. Cấu trúc thư mục dự án

```
project-root/
├─ src/
│  ├─ app/
│  │  ├─ (public)/                     # Trang công khai, không cần đăng nhập
│  │  │  ├─ page.tsx
│  │  │  ├─ jobs/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [id]/page.tsx
│  │  │  ├─ events/
│  │  │  ├─ experiences/
│  │  │  └─ layout.tsx
│  │  │
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  └─ layout.tsx
│  │  │
│  │  ├─ (student)/                    # Sinh viên/Cựu SV
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ jobs/apply/
│  │  │  ├─ events/my-registrations/
│  │  │  ├─ experiences/new/
│  │  │  ├─ surveys/
│  │  │  ├─ scholarships/
│  │  │  │  ├─ page.tsx               # danh sách chiến dịch
│  │  │  │  └─ [campaignId]/apply/
│  │  │  └─ layout.tsx
│  │  │
│  │  ├─ (employer)/                   # Doanh nghiệp
│  │  │  ├─ onboarding/                # đăng ký hồ sơ công ty
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ jobs/
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ new/page.tsx
│  │  │  ├─ scholarships/pledge/
│  │  │  └─ layout.tsx                 # chứa company switcher nếu user thuộc >1 công ty
│  │  │
│  │  ├─ (faculty-admin)/              # Khoa + Admin (UX guard, không phải hard guard)
│  │  │  ├─ dashboard/page.tsx
│  │  │  ├─ companies/review/
│  │  │  ├─ jobs/review/
│  │  │  ├─ events/
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ new/page.tsx
│  │  │  │  └─ [id]/speakers/
│  │  │  ├─ experiences/review/
│  │  │  ├─ forms/
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ new/page.tsx
│  │  │  │  └─ [id]/responses/
│  │  │  ├─ scholarships/
│  │  │  │  ├─ campaigns/
│  │  │  │  └─ applications/review/
│  │  │  ├─ users/                     # chỉ Admin — hard guard: requireRole('admin')
│  │  │  ├─ audit-logs/                # chỉ Admin — hard guard: requireRole('admin')
│  │  │  └─ layout.tsx
│  │  │
│  │  ├─ api/
│  │  │  ├─ auth/[...all]/route.ts     # better-auth handler
│  │  │  ├─ companies/route.ts
│  │  │  ├─ jobs/route.ts
│  │  │  ├─ jobs/[id]/route.ts
│  │  │  ├─ events/route.ts
│  │  │  ├─ events/[id]/speakers/route.ts
│  │  │  ├─ forms/route.ts
│  │  │  ├─ forms/[id]/responses/route.ts
│  │  │  ├─ scholarships/campaigns/route.ts
│  │  │  ├─ scholarships/applications/route.ts
│  │  │  ├─ uploads/presign/route.ts   # sinh presigned URL upload file
│  │  │  └─ notifications/route.ts
│  │  │  # LƯU Ý: không có api/workers/notify — worker dùng BullMQ thường trực,
│  │  │  # không cần HTTP endpoint (xem src/workers/)
│  │  │
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  │
│  ├─ components/
│  │  ├─ ui/                           # component shadcn dùng chung
│  │  ├─ forms/                        # form-builder: QuestionEditor, QuestionRenderer...
│  │  ├─ jobs/
│  │  ├─ events/
│  │  ├─ scholarships/
│  │  └─ shared/                       # Navbar, Sidebar, DataTable wrapper, CompanySwitcher...
│  │
│  ├─ db/
│  │  ├─ index.ts                      # ĐIỂM DUY NHẤT kết nối DB (drizzle + pg)
│  │  └─ schema/
│  │     ├─ auth.ts                    # bảng do better-auth generate
│  │     ├─ profiles.ts
│  │     ├─ companies.ts
│  │     ├─ jobs.ts
│  │     ├─ events.ts
│  │     ├─ experiences.ts
│  │     ├─ forms.ts
│  │     ├─ scholarships.ts
│  │     ├─ notifications.ts
│  │     └─ index.ts                   # export gộp toàn bộ schema
│  │
│  ├─ lib/
│  │  ├─ auth.ts                       # cấu hình better-auth
│  │  ├─ auth-client.ts                # better-auth client (dùng ở client component)
│  │  ├─ redis.ts                      # ĐIỂM DUY NHẤT kết nối Redis (ioredis)
│  │  ├─ storage.ts                    # lớp trừu tượng upload/lấy signed URL file
│  │  ├─ notifications.ts              # hàm enqueue job gửi thông báo (queue.add)
│  │  ├─ permissions.ts                # requireRole(), kiểm tra membership công ty
│  │  └─ utils.ts
│  │
│  ├─ validators/                      # zod schema cho từng module
│  │  ├─ job-schema.ts
│  │  ├─ event-schema.ts
│  │  ├─ form-schema.ts
│  │  └─ scholarship-schema.ts
│  │
│  ├─ workers/                         # tiến trình worker riêng (chạy độc lập)
│  │  └─ notification.worker.ts        # BullMQ worker: kết nối Redis, lắng nghe queue, gửi email/in-app
│  │                                   # Chạy: node src/workers/notification.worker.ts (hoặc container riêng)
│  │
│  ├─ hooks/                           # custom React hooks (useCurrentUser, useForms...)
│  └─ types/                           # type dùng chung
│
├─ docker/
│  ├─ docker-compose.yml               # postgres + redis + minio + worker container
│  └─ Dockerfile
│
├─ drizzle.config.ts
├─ .env.example
├─ package.json
└─ tsconfig.json
```

> [!NOTE]
> **Ghi chú vận hành:**
>
> - `src/workers/notification.worker.ts` chạy như một tiến trình Node.js riêng — khi còn dùng Neon/Upstash serverless, deploy worker trên dịch vụ hỗ trợ long-running process (Railway, Render...); khi chuyển sang Docker, worker chạy trong container riêng cùng `docker-compose.yml`.
> - `src/lib/storage.ts` export các hàm `uploadFile()`, `getSignedUrl()`, `deleteFile()` — hiện tại trỏ tới Neon Object Storage, sau này đổi sang MinIO chỉ cần sửa cấu hình client trong file này.

---

## 7. Lộ trình triển khai đề xuất

1. Auth + phân quyền (better-auth, bảng `profiles`, `lib/permissions.ts`, `middleware.ts`)
2. Module Tuyển dụng (đăng ký công ty → duyệt → đăng tin → duyệt tin, company switcher)
3. Hạ tầng thông báo (Redis + BullMQ + worker)
4. Module Form Builder (nền tảng dùng chung cho khảo sát & học bổng)
5. Module Sự kiện/Talkshow
6. Module Chia sẻ kinh nghiệm
7. Module Quỹ Khuyến học (tận dụng Form Builder ở bước 4)
8. Dashboard thống kê + Audit log
9. Đóng gói Docker (Postgres + Redis + MinIO + worker container) để triển khai độc lập
