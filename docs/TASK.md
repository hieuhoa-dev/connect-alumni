# TASK_V2.md — Đợt việc bổ sung cho AI agent (DLU Connect Alumni)

Tài liệu này **bổ sung** cho `TASK.md` (không thay thế). Các mục dưới đây được lập từ đợt rà soát mã nguồn ngày 29/10/2026. Mỗi task ghi rõ file liên quan, vấn đề thực tế đã quan sát trong mã, yêu cầu và tiêu chí nghiệm thu.

---

## 0. Quy ước chung (đọc trước khi làm bất kỳ task nào)

- Đọc `AGENTS.md`, `DESIGN.md` (v2), và tài liệu Next.js trong `node_modules/next/dist/docs/` (Next 16.3.6 có thay đổi phá vỡ so với bản cũ; đặc biệt phần cache, `images`, `proxy.ts`). Đọc các skill trong `.claude/skills/` khi chạm vào phần liên quan: `better-auth-best-practices`, `ai-sdk`, `migrate-ai-sdk-v6-to-v7`, `shadcn`.
- Component viết bằng **arrow function** (`export const X = () => {}`). Base UI: `Button` dùng `render={<Link href=... />}` kèm `nativeButton={false}`, **không** dùng `asChild`.
- Trình quản lý gói của repo là **npm** (có `package-lock.json`). `TASK.md` ghi `pnpm`; hãy dùng `npm run ...` và sửa các ghi chú cũ.
- Kiến trúc: action mỏng → service (giao dịch) → DAL (chỉ-đọc, trả DTO). Dùng `Result` (`src/lib/result.ts`), `requireRole`, zod, `logAuditEvent`, `src/lib/state-machine.ts`. Văn bản giao diện bằng tiếng Việt. Mọi trang có trạng thái rỗng và trạng thái lỗi.
- Không thêm `any` / `@ts-ignore` mới. Không đọc, in hay commit giá trị trong `.env`.
- Migration: sinh bằng `drizzle-kit generate`, đọc lại SQL, chạy bằng `drizzle-kit migrate`. Không sửa tay migration đã có. Không tự xóa dữ liệu cũ: nếu không ánh xạ được thì **dừng và báo cáo**.
- Đây là đồ án tốt nghiệp: giao diện và chi tiết phải chỉn chu, đúng `DESIGN.md`, tôn trọng `prefers-reduced-motion`.
- **Ảnh chỉ đến từ tải lên.** Không dùng nguồn ảnh ngoài (Unsplash, ảnh stock, ...) ở bất kỳ đâu và không có API ảnh bên thứ ba. Nội dung chưa có ảnh thì hiển thị ảnh mặc định cục bộ trong `public/`.
- **Không gửi email trong đợt này.** Các phần gửi email của `TASK.md` (Task 2.8, phần email của Task 3.4, 4.2, 6.7) bị bỏ; thông báo chỉ nằm trong ứng dụng (bảng `notifications` + popover). Hệ quả: không có xác minh email và không có luồng "quên mật khẩu" qua email.

---

## 1. Giai đoạn A — Lỗi cần sửa trước

### Task A1 — Bỏ dữ liệu mẫu tự thay thế ở trang công khai
- Files: `src/app/(public)/jobs/page.tsx`, `scholarships/page.tsx`, `experiences/page.tsx`, `events/page.tsx`, `src/components/landing/academic-news-portal.tsx`, `src/components/landing/scholarship-tracker.tsx`, `src/app/(public)/page.tsx`, `src/lib/dlu-sample-data.ts`.
- Vấn đề: các trang còn dạng `jobs.length > 0 ? jobs : sampleDLUJobs` (tương tự cho học bổng, bài chia sẻ, sự kiện); `academic-news-portal.tsx` import `sampleDLUEvents/Jobs/Experiences` và nhúng ảnh Unsplash; `scholarship-tracker.tsx` dùng `365000000` / `500000000` khi không có chiến dịch; `(public)/page.tsx` dùng `.catch(() => [])` nên lỗi CSDL bị nuốt và trang hiện rỗng như thể không có dữ liệu. Người xem không phân biệt được dữ liệu giả với dữ liệu thật.
- Yêu cầu:
  1. Xóa mọi nhánh dự phòng sang `sampleDLU*`. Bảng rỗng → trả mảng rỗng và hiện **empty state**; lỗi CSDL → để lỗi nổi lên `error.tsx` (ghi `console.error` có ngữ cảnh).
  2. `scholarship-tracker.tsx`: không có chiến dịch thì ẩn khối, không dùng số cứng.
  3. Chuyển nội dung `dlu-sample-data.ts` vào `scripts/seed-data.ts` (idempotent, chạy lại được), không lưu URL ảnh ngoài vào CSDL (ảnh bìa còn thiếu hiển thị `placeholder-cover.svg`; ảnh cần giữ đặt ở `public/seed/`), rồi xóa khỏi `src/lib`. Xóa `sampleDemoNotifications` / `sampleDemoCompanies` trong `demo-accounts.ts` nếu không còn tham chiếu.
- Nghiệm thu: `grep -rn "sampleDLU" src` rỗng; CSDL rỗng → các trang hiện empty state; tắt CSDL → trang báo lỗi rõ ràng, không hiện số liệu giả; `npm run db:seed` chạy hai lần không nhân đôi dữ liệu.

### Task A2 — Migration lệch schema
- Files: `drizzle/`, `drizzle.config.ts`, `package.json`, `scripts/apply-migration.ts`, `src/db/schema.ts`.
- Vấn đề: `drizzle/` chỉ có `20260927061400_absurd_wild_child`, trong đó **không có** `work_experiences`, `profile_revisions`, `alumni_connections` (đã có trong `schema.ts`). Trên CSDL mới, `/profile` và `/alumni` sẽ lỗi.
- Yêu cầu: sinh migration bù; kiểm chứng bằng cách tạo CSDL Postgres trống → chạy toàn bộ migration → `drizzle-kit generate` không còn sinh diff. Thêm script `db:generate`, `db:migrate` vào `package.json`. Thêm unique index một phần `profiles(student_code) WHERE student_code IS NOT NULL`, kèm script kiểm tra trùng và **báo cáo** (không tự sửa) trước khi áp dụng.
- Nghiệm thu: CSDL trống + `db:migrate` + `db:seed` chạy xong; mở `/profile`, `/alumni` không lỗi; hai hồ sơ cùng MSSV bị từ chối.

### Task A3 — `registerForEvent` an toàn khi đăng ký đồng thời
- File: `src/actions/event-actions.ts`.
- Vấn đề: hàm tải toàn bộ `registrations` của sự kiện rồi so `length >= capacity` trong bộ nhớ, ngoài giao dịch nên nhiều người đăng ký cùng lúc sẽ vượt `capacity`; không kiểm tra `endTime`, vai trò, tài khoản `active`; ném `Error` thô; không ghi audit.
- Yêu cầu: chuyển vào `src/server/services/event-service.ts`, một giao dịch có khóa dòng sự kiện (`SELECT ... FOR UPDATE`) hoặc chèn có điều kiện đếm bằng SQL `COUNT`; kiểm tra `status = published`, chưa quá `endTime`, vai trò `student|alumni` (cựu SV phải đã xác thực), hồ sơ `active`; trả `Result` với mã lỗi (`CONFLICT`, `FORBIDDEN`, ...); ghi audit. Danh sách chờ và hủy đăng ký: xem `TASK.md` Task 6.1.
- Nghiệm thu: test 20 đăng ký đồng thời cho sự kiện `capacity = 10` → đúng 10 bản ghi `registered`.

### Task A4 — Tệp riêng tư đang bị phục vụ công khai
- File: `src/app/api/v1/files/[...path]/route.ts`, `src/lib/storage.ts`.
- Vấn đề: route này trả **mọi khóa** trong bucket cho bất kỳ ai, không kiểm tra đăng nhập, với `Cache-Control: public, max-age=604800, immutable`. Khóa có dạng `uploads/<purpose>/<uuid>.<ext>`, nên minh chứng học bổng (`uploads/proof_document/...`) cũng nằm trong phạm vi này.
- Yêu cầu: route chỉ phục vụ các tiền tố công khai (xem Task B1); tệp riêng tư không đi qua route này mà qua action sinh liên kết ký có hạn ≤ 5 phút, kiểm quyền (chủ hồ sơ và `faculty_staff|admin`) và ghi audit `view_scholarship_file`. Tệp riêng tư dùng `Cache-Control: private, no-store`.
- Nghiệm thu: truy cập trực tiếp `/api/v1/files/uploads/proof_document/<uuid>.pdf` khi chưa đăng nhập trả 404/403; người khác không xem được minh chứng; mỗi lần Khoa xem sinh một dòng audit.

### Task A5 — Cookie đăng nhập demo
- Files: `src/proxy.ts`, `src/lib/demo-accounts.ts`, `src/app/api/auth/demo-login/route.ts`.
- Vấn đề: `proxy.ts` kiểm tra cookie `demo_user_email` nhưng `demo-login` đặt cookie `dlu_demo_user` (`DEMO_COOKIE_NAME`), nên bật chế độ demo ở môi trường dev sẽ bị chuyển về `/login`. Giá trị cookie là email thuần, chưa ký.
- Yêu cầu: dùng chung hằng `DEMO_COOKIE_NAME`; ký giá trị cookie (HMAC bằng `BETTER_AUTH_SECRET`) hoặc dùng id phiên ngẫu nhiên; `httpOnly`, `sameSite=lax`, `secure` ở production. Giữ nguyên ràng buộc `isDemoEnabled()` (cờ bật và không phải production).
- Nghiệm thu: bật `ENABLE_DEMO_LOGIN=true` ở dev thì đăng nhập demo vào được `/student/dashboard`; đặt tay cookie email thuần không còn cấp quyền; production luôn 404.

### Task A6 — Giới hạn tốc độ và thu hồi phiên
- Files: `src/lib/auth.ts`, `src/actions/auth-actions.ts`, `src/lib/redis.ts`.
- Vấn đề: không có giới hạn tốc độ ở bất kỳ đâu trong `src` (dù `.env.example` ghi Redis dùng cho "Rate Limiter"); khóa tài khoản không thu hồi phiên đang đăng nhập.
- Yêu cầu: bật `rateLimit` của Better-Auth cho đăng nhập/đăng ký (đọc docs/skill để dùng đúng tùy chọn và nơi lưu); thêm bộ giới hạn dùng Redis cho `registerWithProfile`, presign tải tệp, gửi kết nối, các endpoint AI (Giai đoạn G), biểu mẫu công khai (yêu cầu gỡ ảnh). Khi Redis lỗi: endpoint tốn chi phí (AI) **từ chối**, endpoint thường ghi log và cho qua. `adminToggleUserLock` khi khóa thì xóa toàn bộ phiên của người đó trong cùng giao dịch (`DELETE FROM session WHERE user_id = ?`), kiểm tra người dùng tồn tại, không cho tự khóa/hạ quyền chính mình, luôn còn ≥ 1 admin `active`.
- Nghiệm thu: gửi vượt ngưỡng đăng nhập sai nhận 429; tài khoản bị khóa mất phiên ngay.

### Task A7 — Không nuốt lỗi, thông báo trong ứng dụng, bỏ gửi email giả
- Files: `src/app/faculty-admin/alumni-verification/page.tsx`, `src/lib/notifications.ts`, `src/lib/redis.ts`, `src/workers/notification.worker.ts`.
- Vấn đề: (1) trang xác thực cựu SV bắt lỗi rồi gán danh sách rỗng, nên khi CSDL lỗi vẫn hiện "Không có hồ sơ nào chờ duyệt"; (2) `sendNotification` có `catch` im lặng trả `null`; (3) worker chỉ `console.log("Simulating email ...")`, tức là giả vờ gửi email.
- Yêu cầu: (1) bỏ `try/catch` nuốt lỗi, bỏ `any[]`, để `error.tsx` xử lý; (2) ghi `console.error` kèm ngữ cảnh, bản ghi `notifications` trong CSDL là nguồn sự thật, hàng đợi lỗi không làm mất bản ghi; (3) **bỏ hẳn việc gửi email**: xóa nhánh `sendEmail` giả lập trong worker và tham số `sendEmail` của `NotificationPayload`; không tạo `EmailSender`, mẫu email hay biến `EMAIL_*`. Thông báo chỉ hiển thị trong ứng dụng. Cột `profiles.email_notifications` giữ nguyên trong schema nhưng không dùng nữa; ẩn công tắc "nhận email" khỏi giao diện hồ sơ nếu có.
- Nghiệm thu: tắt CSDL → trang xác thực báo lỗi; `grep -rn "Simulating email" src` rỗng; tạo thông báo thì bản ghi nằm trong CSDL và hiện trong popover; Redis lỗi thì thông báo vẫn được lưu.

### Task A8 — Chất lượng mã và dọn dẹp
- Vấn đề: khoảng 130 vị trí dùng `any` / `@ts-ignore` (đáng chú ý: `form_answers.answerValue`, các action, `permissions.ts`); `scheduleJobExpiryCheck` ép kiểu `as any`; file rỗng `src/lib/auth-schema.ts`; `presign/route.ts` và `direct/route.ts` lặp cấu hình `MAX_SIZES`/`ALLOWED_MIME_TYPES` (xử lý ở Task B1).
- Yêu cầu: giảm `any` theo thứ tự actions → permissions → validators → component, khai báo kiểu rõ ràng; xóa file rỗng; bỏ `as any` ở lịch hết hạn tin (dùng API đúng của BullMQ 6, giữ `jobId` cố định để không tạo lịch trùng); `tsc --noEmit` sạch.
- Nghiệm thu: số vị trí `any`/`@ts-ignore` giảm rõ rệt và không thêm mới; `tsc --noEmit` và `biome check` đều xanh.

---

## 2. Giai đoạn B — Ảnh: chỉ tải lên, không nhập URL, tối ưu ảnh

Quy tắc chốt cho toàn giai đoạn: người dùng **chỉ cung cấp ảnh bằng cách tải lên** (không nhập URL ảnh ở bất kỳ form nào) và hệ thống **không lấy ảnh từ nguồn ngoài nào** (không Unsplash, không API ảnh). Nội dung chưa có ảnh tải lên hiển thị ảnh mặc định cục bộ (Task B5).

### Task B1 — Hạ tầng tệp thống nhất
- Files: `src/lib/storage.ts`, `src/app/api/v1/uploads/presign/route.ts`, `uploads/direct/route.ts`, `src/db/schema.ts` (`uploaded_files`), `package.json`.
- Vấn đề quan sát được: hai route tải tệp lặp cấu hình; **không ghi bảng `uploaded_files`** mà chỉ trả `fileUrl` dạng `/api/v1/files/<key>` để client lưu chuỗi URL vào form; `company_logo` cho phép `image/svg+xml` (SVG có thể chứa script); chưa có `sharp` trong dependencies.
- Yêu cầu:
  1. `src/lib/upload-policy.ts`: cấu hình tập trung theo `purpose` gồm mức hiển thị (`public|private`), dung lượng tối đa, MIME cho phép, vai trò được phép, hạn mức theo ngày. Công khai: `avatar` 2 MB, `company_logo` 2 MB, `event_cover` 5 MB, `experience_cover` 5 MB, `hero_banner` 8 MB, `album_photo` 8 MB. Riêng tư: `proof_document` 10 MB, `cv` 10 MB. Bỏ SVG khỏi danh sách cho phép (hoặc làm sạch bằng thư viện chuyên dụng và phục vụ với `Content-Security-Policy: sandbox`).
  2. Luồng hai bước: `POST /api/v1/uploads/presign` tạo dòng `uploaded_files` trạng thái `pending`; `POST /api/v1/uploads/confirm` kiểm tra đối tượng tồn tại trên S3 (HEAD), đọc siêu dữ liệu thật bằng `sharp` (không tin MIME do client gửi), rồi đặt `ready`. Gộp hoặc xóa `direct`; nếu giữ thì dùng chung policy và cũng ghi `uploaded_files`.
  3. Migration `uploaded_files`: thêm `purpose`, `status` (`pending|ready|removed`), `visibility`, `width`, `height`, `variants jsonb`. Thêm `sharp` vào `dependencies`.
  4. Với ảnh công khai: xóa EXIF (đặc biệt GPS), tạo biến thể WebP (`thumb` 400 px, `md` 960 px, `lg` 1600 px), lưu khóa các biến thể trong `variants`. Tệp gốc lưu riêng tư, không phục vụ.
  5. `src/lib/file-url.ts`: `getPublicFileUrl(file, variant)`. Thêm biến môi trường `S3_PUBLIC_BASE_URL` (tên miền công khai/CDN của bucket). Nếu thiếu thì dùng route nội bộ `/api/v1/files/...` chỉ cho tiền tố công khai (Task A4).
  6. Job định kỳ xóa `uploaded_files` ở `pending` quá 24 giờ (dùng worker BullMQ hiện có).
- Nghiệm thu: tải ảnh hợp lệ thành công và có dòng `uploaded_files` `ready` kèm biến thể; MIME/dung lượng sai bị từ chối ở máy chủ; tệp giả đuôi `.jpg` nhưng không phải ảnh bị từ chối ở bước confirm; ảnh có GPS trong EXIF được xử lý không còn GPS.

### Task B2 — Component `FileUploader` và bỏ "Dán URL"
- Files: mới `src/components/shared/file-uploader.tsx`; thay `src/components/ui/file-upload.tsx` tại 6 nơi dùng: `src/app/profile/profile-editor.tsx` (avatar), `src/app/faculty-admin/events/new/page.tsx` (ảnh bìa), `src/app/employer/onboarding/page.tsx` (logo), `src/app/student/experiences/new/page.tsx` (ảnh bìa), `src/app/student/scholarships/[campaignId]/apply/apply-form.tsx` và `src/app/student/surveys/[id]/form-renderer.tsx` (tệp riêng tư).
- Vấn đề: component hiện có chế độ **"Dán URL"** nên người dùng nhập được địa chỉ ảnh bất kỳ.
- Yêu cầu: `FileUploader` nhận `purpose`, trả `{ fileId, url }`, hiển thị tiến trình, xem trước, lỗi tiếng Việt, gợi ý kích thước/tỉ lệ; dùng được trong react-hook-form. **Không có chế độ nhập URL.** Xóa `components/ui/file-upload.tsx` sau khi thay hết.
- Nghiệm thu: không còn ô nhập URL ảnh ở bất kỳ form nào; `grep -rn "Dán URL" src` rỗng.

### Task B3 — Lưu tham chiếu tệp thay vì URL
- Files: `src/db/schema.ts` (`profiles.avatar_url`, `companies.logo_url`, `events.cover_image_url`, `experience_posts.cover_image_url`, `form_answers.file_url`), `src/validators/{profile,company,event,experience,form}-schema.ts`, các service/action tương ứng.
- Yêu cầu: thêm cột `avatar_file_id`, `logo_file_id`, `cover_file_id` (FK `uploaded_files`) và `form_answers.file_id`. Validator nhận `*FileId: z.string().uuid()`; service kiểm tra tệp thuộc người gọi, đúng `purpose`, trạng thái `ready` (chống gắn tệp của người khác). Viết script chuyển dữ liệu cũ: URL dạng `/api/v1/files/<key>` được ánh xạ về `uploaded_files`; **URL ngoài không tự xóa mà xuất báo cáo** (bảng, id, URL) để Khoa tải lại nếu muốn. Bản ghi chưa có tệp tải lên hiển thị `placeholder-cover.svg` (Task B5) thay vì URL cũ. Chỉ khi báo cáo đã xử lý xong mới tạo migration riêng xóa các cột URL cũ.
- Giữ nguyên các trường URL **không phải ảnh** (LinkedIn, GitHub, website, `applyUrlOrEmail`, `locationOrLink`).
- Nghiệm thu: gọi action với một `fileId` của người khác hoặc sai `purpose` bị từ chối; không thể lưu URL ảnh do client gửi lên bằng bất kỳ action nào.

### Task B4 — Tối ưu ảnh và cấu hình `next.config.ts`
- Files: `next.config.ts`, `public/`, mọi nơi dùng `next/image`.
- Vấn đề: `images.unoptimized: true` nên ảnh không được nén hay đổi kích thước; `public/dlu_1.jpg` ~2,4 MB và `public/dlu-logo.png` ~1 MB; còn ảnh template (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`); thư mục `public/cholarship/` sai chính tả; URL Unsplash rải rác ở `academic-news-portal.tsx` (11), `network-stats.tsx` (1), `hero-carousel.tsx` (1), `demo-accounts.ts` (6), `dlu-sample-data.ts` (36) và các component không dùng (`news-feed-section`, `media-gallery`, `bento-showcase`); hai slide hero dùng đường dẫn `banner/...` **thiếu dấu `/` đầu** nên `next/image` có thể báo lỗi.
- Yêu cầu:
  1. Bỏ `images.unoptimized`. Cập nhật `next.config.ts` (giữ nguyên `reactCompiler` và `redirects` hiện có), khai báo `images.remotePatterns` **cụ thể** (không dùng `**` cho hostname), chỉ gồm host kho lưu trữ suy ra từ `S3_PUBLIC_BASE_URL`; thêm `formats: ["image/avif", "image/webp"]`; nếu còn phục vụ qua `/api/v1/files/**` thì cấu hình `localPatterns` theo docs Next 16. Không khai báo thêm host nào khác: ảnh từ host chưa khai báo sẽ gây lỗi `next/image`, nên không cho người dùng nhập URL ảnh. Ví dụ (kiểm tra kiểu và tùy chọn theo docs Next 16):
     ```ts
     const storageHost = process.env.S3_PUBLIC_BASE_URL
       ? new URL(process.env.S3_PUBLIC_BASE_URL)
       : null;

     // trong nextConfig:
     images: {
       formats: ["image/avif", "image/webp"],
       remotePatterns: [
         ...(storageHost
           ? [
               {
                 protocol: storageHost.protocol === "http:" ? "http" : "https",
                 hostname: storageHost.hostname,
                 port: storageHost.port,
                 pathname: "/**",
               } as const,
             ]
           : []),
       ],
     },
     ```
  2. Mọi `<Image>` có `alt` và `sizes` phù hợp; chỉ ảnh LCP (slide đầu) dùng `priority`.
  3. Nén/đổi sang WebP các ảnh nặng trong `public/`, dùng `dlu-logo.svg` thay cho PNG nếu giống nhau; **kiểm tra tham chiếu** trước khi xóa ảnh template hoặc đổi tên `cholarship` → `scholarship`.
  4. Tạo `public/placeholder-cover.svg`, `public/placeholder-avatar.svg` làm ảnh dự phòng.
  5. **Xóa toàn bộ URL ảnh ngoài viết cứng** (Unsplash, `pravatar`, ...) trong component và dữ liệu mẫu; component không được nhúng URL ảnh ngoài trực tiếp. Ảnh nền của khối giao diện (ví dụ `network-stats.tsx`) dùng ảnh cục bộ trong `public/`. Dữ liệu seed không dùng URL ngoài: ảnh cần giữ đặt ở `public/seed/` và được script seed tải lên kho lưu trữ; avatar demo dùng chữ cái đầu.
- Nghiệm thu: `grep -rniE "unsplash|pravatar" src` rỗng; `grep -n "unoptimized" next.config.ts` rỗng; trong tab Network ảnh trả về WebP/AVIF; ảnh từ kho lưu trữ hiển thị không báo lỗi host chưa cấu hình; slide hero không còn lỗi đường dẫn.

### Task B5 — Ảnh mặc định khi chưa tải ảnh lên
- Files: mới `src/components/shared/content-image.tsx`, `public/placeholder-cover.svg`, `public/placeholder-avatar.svg`; các nơi hiển thị ảnh bìa: `(public)/events/*`, `(public)/experiences/*`, `src/components/landing/academic-news-portal.tsx`.
- Yêu cầu: `ContentImage` nhận `{ file?, alt, sizes, priority? }`; có ảnh tải lên thì dùng biến thể phù hợp (Task B1), không có thì dùng `public/placeholder-cover.svg`; ảnh lỗi tải (`onError`) cũng rơi về placeholder. Thiết kế placeholder đúng `DESIGN.md` (palette thương hiệu, không dùng ảnh người). Không gọi dịch vụ ngoài nào để lấy ảnh. Avatar và logo công ty dùng chữ cái đầu hoặc `placeholder-avatar.svg`.
- Nghiệm thu: bài/sự kiện không có ảnh tải lên hiển thị placeholder; có ảnh tải lên thì hiển thị ảnh đó; `grep -rniE "unsplash" src package.json .env.example` rỗng.

---

## 3. Giai đoạn C — Banner trang chủ (`hero_slides`)

### Task C1 — Schema `hero_slides`
Bảng `hero_slides` (một migration):

| Cột | Kiểu | Ghi chú |
| :--- | :--- | :--- |
| `id` | uuid PK | |
| `status` | enum `hero_slide_status` (`draft`, `published`) | mặc định `draft` |
| `sort_order` | integer not null default 0 | index (`status`, `sort_order`) |
| `badge` | text null | ≤ 80 ký tự; mọi trường chữ đều tùy chọn |
| `title` | text null | ≤ 120 |
| `highlight_text` | text null | ≤ 120 |
| `description` | text null | ≤ 300 |
| `primary_label`, `primary_href` | text null | nút chính (tùy chọn), cùng có hoặc cùng không; label ≤ 40 |
| `secondary_label`, `secondary_href` | text null | nút phụ (tùy chọn), như trên |
| `link_href` | text null | bấm cả slide (tùy chọn) |
| `image_file_id` | uuid not null FK `uploaded_files` | `purpose = hero_banner`, `ready` |
| `image_mobile_file_id` | uuid null FK `uploaded_files` | ảnh riêng cho điện thoại |
| `image_alt` | text not null | 5–200 ký tự |
| `overlay_enabled` | boolean not null default true | công tắc lớp phủ do người dùng bật/tắt |
| `starts_at`, `ends_at` | timestamptz null | `ends_at > starts_at` |
| `seed_key` | text unique null | để seed idempotent |
| `created_by`, `updated_by` | text FK `user` | |
| `created_at`, `updated_at` | timestamptz | |

- Hiển thị công khai khi: `status = 'published' AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at > now())`, sắp theo `sort_order`. Tối đa 8 slide đã đăng cùng lúc.
- Thêm vào `state-machine.ts`: `draft ↔ published`.
- **Chọn liên kết bằng `LinkPicker`** (`src/components/shared/link-picker.tsx`, dùng cho `primary_href`, `secondary_href`, `link_href`): một `Select` (Base UI) gồm hai nhóm. (a) **Trang trong ứng dụng**, lấy từ danh sách cấu hình `src/lib/link-options.ts` (`{ label, href, group }`): Trang chủ `/`, Việc làm `/jobs`, Sự kiện `/events`, Học bổng `/scholarships`, Chia sẻ kinh nghiệm `/experiences`, Mạng lưới cựu SV `/alumni`, Đăng ký `/register`, Đăng nhập `/login`, Dành cho doanh nghiệp `/employer/onboarding` (thêm `/gallery` khi Giai đoạn E xong). (b) **"Nhập URL khác"**: hiện ô nhập, chấp nhận URL `https://...` hoặc đường dẫn nội bộ bắt đầu bằng `/`. Giá trị lưu vẫn là một chuỗi `href`.
- **Kiểm tra ở máy chủ là bắt buộc**, không dựa vào giao diện: dùng chung hàm `isSafeHref()` cho mọi validator link. Chấp nhận đường dẫn nội bộ bắt đầu bằng `/` (không phải `//`) hoặc URL `https://`; từ chối `javascript:`, `data:`, `http:` và mọi giao thức khác. Thêm test: mọi `href` trong `link-options.ts` đều qua `isSafeHref()` và trỏ tới route có thật.

### Task C2 — Hiển thị slide và lớp phủ (đơn giản)
- File: `src/components/landing/hero-carousel.tsx` (tách `HeroSlideView` dùng chung cho trang công khai và bản xem trước trong trang quản lý).
- **Lớp phủ là cài đặt của người dùng** (`overlay_enabled`, mặc định bật), không tự suy luận theo việc có chữ hay không. Bật: giữ nguyên scrim và gradient thương hiệu hiện có, kèm hiệu ứng zoom nhẹ như hiện tại. Tắt: hiển thị ảnh nguyên bản, không scrim, không gradient, không zoom (dùng cho ảnh đã thiết kế sẵn nội dung).
- **Chữ và nút đều tùy chọn:** badge, tiêu đề, dòng nhấn, mô tả, nút chính, nút phụ. Trường nào trống thì không render; không có gì thì chỉ hiện ảnh. Có `link_href` thì cả slide bấm được. Người dùng tự chịu trách nhiệm độ tương phản (bật lớp phủ nếu chữ trắng khó đọc); bản xem trước trong form giúp kiểm tra.
- Ảnh điện thoại (`image_mobile_file_id`) tùy chọn: có thì dùng ở màn hình nhỏ, không thì dùng ảnh desktop. Hiển thị gợi ý kích thước trong form (desktop 2100×900, điện thoại 1080×1350), không chặn.
- Ngữ nghĩa: **không** để mỗi slide là `<h1>`. Trang chủ có đúng một `<h1>` ẩn thị giác (`sr-only`), tiêu đề slide là `<h2>`. `image_alt` bắt buộc; slide chỉ có ảnh thì `image_alt` chép lại nội dung chữ trong ảnh.
- Slide dự phòng: hằng `DEFAULT_HERO_SLIDE` trong mã (ảnh cục bộ trong `public/`, nút tới `/register`) chỉ dùng khi **không có slide nào hiển thị**, để trang chủ không trống.

### Task C3 — DAL, action và cache
- Files: `src/server/dal/hero.ts`, `src/actions/hero-actions.ts` (hoặc service), `src/app/(public)/page.tsx`.
- `getPublicHeroSlides()` trả DTO (`id`, văn bản, `primaryAction?`, `secondaryAction?`, `linkHref?`, `image: { src, mobileSrc?, alt }`, `overlayEnabled`), chỉ `select` cột cần thiết. Trang chủ (Server Component) lấy dữ liệu rồi truyền xuống `HeroCarousel`.
- Cache theo cơ chế Next 16 (đọc docs): gắn tag `hero-slides`, `revalidateTag` khi lưu; vì `starts_at/ends_at` đổi trạng thái theo thời gian nên đặt thêm thời hạn cache ≤ 60 giây (trang chủ hiện có `revalidate = 60`).
- Actions (chỉ `faculty_staff|admin`, trả `Result`, ghi audit): `createHeroSlide`, `updateHeroSlide`, `publishHeroSlide`, `unpublishHeroSlide`, `reorderHeroSlides(ids[])` (một giao dịch), `deleteHeroSlide`. Audit: `create_hero_slide`, `update_hero_slide`, `publish_hero_slide`, `unpublish_hero_slide`, `reorder_hero_slides`, `delete_hero_slide`.

### Task C4 — Trang quản lý `/faculty-admin/landing/hero`
- Danh sách slide: ảnh nhỏ, tiêu đề, trạng thái (nháp / đang hiển thị / hẹn giờ / hết hạn — tính từ `status`, `starts_at`, `ends_at`), kéo thả sắp xếp bằng `@dnd-kit`, công tắc đăng/gỡ.
- Form tạo/sửa: tải ảnh desktop và ảnh điện thoại bằng `FileUploader` (`purpose = hero_banner`), `image_alt`, **công tắc "Lớp phủ" bật/tắt**, các trường chữ (tùy chọn), hai nút (tùy chọn, chọn liên kết bằng `LinkPicker`), liên kết cả slide, hẹn giờ; **xem trước trực tiếp** dùng cùng `HeroSlideView`, có chuyển đổi khung desktop/điện thoại và phản ánh đúng công tắc lớp phủ.
- Thêm mục "Nội dung trang chủ → Banner" vào `src/components/shared/sidebar.tsx` cho `faculty_staff|admin`.
- Seed: chuyển 4 slide hiện tại trong `hero-carousel.tsx` thành dữ liệu seed (dùng `seed_key`), ảnh lấy từ `public/` và tải lên kho lưu trữ, không dùng URL ngoài. **Giữ nguyên nội dung chữ, trừ mốc thời gian:** mốc đúng của Trường là **1976–2026 (50 năm)**; mã hiện ghi nhầm "1996–2026" ở slide Homecoming và "1996 — 2026" / "30" ở `anniversary-band.tsx`, phải sửa thành 1976–2026 và 50.
- Nghiệm thu: Tắt công tắc lớp phủ thì trang chủ hiện ảnh nguyên bản, không scrim, không zoom; bật thì có lớp phủ; slide không có chữ và nút thì chỉ hiện ảnh; chọn liên kết từ danh sách hoặc nhập URL đều lưu được; hẹn giờ `starts_at` trong tương lai thì chưa hiện, tới giờ hiện trong ≤ 60 giây; gọi action trực tiếp với `javascript:` hoặc `http:` bị từ chối; người ngoài `faculty_staff|admin` gọi action bị từ chối; sắp xếp lại và đăng/gỡ có dòng audit.

---

## 4. Giai đoạn D — Dọn nội dung viết cứng

### Task D1 — Bảng `site_settings` và trang thiết lập
- Bảng một hàng `site_settings` (id cố định `default`): `contact_phone`, `contact_email`, `website_url`, `address`, `map_url`, `facebook_url`, `youtube_url`, `zalo_url`, `unit_founded_year` (mặc định 1976), `ai_survey_summary_enabled` (mặc định false), `ai_writing_assistant_enabled` (mặc định false), `updated_by`, `updated_at`.
- Trang `/faculty-admin/settings` (zod: email, số điện thoại, URL `https://`), ghi audit, cache theo tag. Trường rỗng thì ẩn phần tử tương ứng trên giao diện.
- Sau đó thay các giá trị cứng ở bảng dưới bằng dữ liệu từ DAL.

### Task D2 — Danh sách phần viết cứng cần xử lý
| File | Đang viết cứng | Cách xử lý |
| :--- | :--- | :--- |
| `landing/hero-carousel.tsx` | 4 slide | Giai đoạn C |
| `landing/network-stats.tsx` | `5000`, `50`, `500M`, `98%` + ảnh nền Unsplash (thay bằng ảnh cục bộ trong `public/`) | Lấy bằng `COUNT` thật qua DAL (cựu SV đã xác thực, doanh nghiệp `verified`, tổng `current_amount` các chiến dịch), cache 10 phút. Chỉ số "98% sinh viên có việc làm" chưa có nguồn: **xóa**, hoặc chỉ hiện khi tính được từ `employment_status` và ghi kèm cỡ mẫu/tỉ lệ phản hồi. Thẻ nào chưa có dữ liệu thì ẩn |
| `landing/partner-logos.tsx` | 9 tên doanh nghiệp (VNG, FPT Software, Viettel Solutions, MoMo, ...) kèm nhãn "Chiến Lược/Đối Tác" | Lấy từ `companies` đã `verified` và có logo; thêm cột `is_featured_partner` để Khoa chọn nhãn chiến lược. Danh sách rỗng thì ẩn khối. Không hiển thị đối tác chưa được Khoa xác nhận |
| `shared/footer.tsx`, `landing/contact-section.tsx`, `shared/quick-rail.tsx` | SĐT `+84911843962`, `it@dlu.edu.vn`, `https://dlu.edu.vn`, liên kết Google Maps dài, link Facebook/YouTube, `https://zalo.me` (chung chung), `© 2026` | Lấy từ `site_settings`; năm bản quyền dùng `new Date().getFullYear()`; Zalo để trống thì ẩn |
| `landing/breaking-ticker.tsx` | 4 mục `defaultItems` | Lấy từ DAL (sự kiện sắp tới, bài đã duyệt mới nhất, chiến dịch đang mở); rỗng thì ẩn |
| `landing/anniversary-band.tsx` | "30", "1996 — 2026" (sai mốc) | Tính từ `unit_founded_year` = 1976: hiển thị "50" và "1976 — 2026" |
| `landing/scholarship-tracker.tsx` | fallback `365000000` / `500000000` | Task A1 |
| `landing/academic-news-portal.tsx` | fallback mẫu + ảnh Unsplash | Task A1 và B4 |
| `jobs/job-apply-modal.tsx`, `(public)/jobs/[id]/page.tsx` | địa chỉ mặc định `tuyendung@dlu-partner.vn` hiện khi tin không có liên hệ | Bỏ mặc định. Tin không có `applyUrlOrEmail` thì ẩn nút ứng tuyển; validator tin tuyển dụng bắt buộc có liên hệ |
| `landing/cta-newsletter.tsx`, `landing/newsletter-box.tsx` | Gửi giả (`setTimeout` / `setSubmitted`), không lưu ở đâu | **Xóa/ẩn cả hai khối.** Đợt này không gửi email nên không có bản tin; không để nút giả |
| `lib/demo-accounts.ts` | 6 avatar Unsplash | Bỏ ảnh ngoài, dùng chữ cái đầu |
| `components/jobs/jobs-filter-client.tsx` | phân tích chuỗi `salaryRange` ("18.000.000 - 32.000.000 đ") | (Ưu tiên thấp) thêm `salary_min`, `salary_max`, `salary_negotiable` dạng số rồi lọc bằng SQL |

- Component **không được import ở đâu** (kiểm tra bằng tìm kiếm trước khi xóa): `bento-showcase`, `media-gallery`, `homecoming-banner`, `chapters-directory` (có email giả `bll.k15@it.edu.vn`), `alumni-survey` (gửi giả), `newsletter-box`, `news-feed-section`. Xóa; `media-gallery` được thay bởi Giai đoạn E, `chapters-directory` thay khi làm Ban liên lạc (`TASK.md` Task 4.3). Chạy `knip` để liệt kê thêm tệp không dùng.
- **Không cần chuyển vào CSDL**: tên trường, logo, nhãn giao diện, menu, câu chữ thương hiệu cố định.
- Nghiệm thu: không còn số liệu, tên đối tác, thông tin liên hệ hay URL ảnh viết cứng trong `src/components/landing` và `shared`; mọi biểu mẫu công khai đều lưu dữ liệu thật hoặc bị ẩn.

---

## 5. Giai đoạn E — Thư viện ảnh

**Tiên quyết:** Task B1–B4 (tải tệp và ảnh), Task D1 (liên kết điều hướng), A4 (tệp riêng tư). Hiện trong `src` chưa có bảng, route hay trang nào cho album ngoài `media-gallery.tsx` viết cứng (không được dùng).

### Task E1 — Schema
- `event_albums`: `id`, `event_id` null FK `events`, `title`, `description`, `cover_photo_id` null (kiểm trong service, không FK cứng để tránh vòng), `status` (`draft|published|archived`), `created_by`, `created_at`, `published_at`.
- `album_photos`: `id`, `album_id` FK (cascade), `file_id` FK `uploaded_files`, `caption` (≤ 200), `taken_at` null, `sort_order`, `status` (`published|removed`), `removed_reason` null, `removed_by` null, `uploaded_by`, `created_at`. Index (`album_id`, `status`, `sort_order`).
- `photo_takedown_requests`: `id`, `photo_id` FK, `requester_user_id` null, `requester_name`, `requester_contact` (email), `reason` (≥ 10 ký tự), `status` (`open|accepted|rejected`), `handler_note`, `handled_by` null, `handled_at` null, `created_at`.
- Trạng thái chuyển hợp lệ thêm vào `state-machine.ts`: album `draft → published → archived`, `archived → published`; ảnh `published → removed` (`removed → published` chỉ admin).

### Task E2 — Tải lên và quản lý (phía Khoa)
- Routes: `/faculty-admin/gallery` (danh sách album, tìm kiếm, tạo mới), `/faculty-admin/gallery/[id]` (sửa thông tin, tải nhiều ảnh, lưới ảnh kéo thả sắp xếp, đặt ảnh bìa, sửa chú thích, gỡ ảnh kèm lý do, đăng/lưu trữ/xóa album), `/faculty-admin/gallery/takedown` (hàng đợi yêu cầu gỡ). Thêm mục "Thư viện ảnh" vào sidebar (nhóm "Sự kiện & Khảo sát").
- Tải nhiều ảnh: tối đa 30 ảnh mỗi lần, song song tối đa 3, hiển thị tiến trình từng ảnh và cho thử lại; JPEG/PNG/WebP, mỗi ảnh ≤ 8 MB; HEIC bị từ chối kèm thông báo rõ ràng. Hạn mức 100 ảnh/ngày/người. Xử lý ảnh theo Task B1 (`album_photo`).
- Quyền: chỉ `faculty_staff|admin` tạo, sửa, gỡ. Ảnh trong album `published` hiển thị ngay; album `draft` thì chưa.
- Yêu cầu gỡ ảnh: khi có yêu cầu `open` thì ảnh tạm ẩn khỏi trang công khai; xử lý trong 72 giờ (hiện bộ đếm); chấp nhận → ảnh `removed` và ghi audit; từ chối → bắt buộc ghi chú, ảnh hiện lại.
- Job worker: xóa khỏi kho lưu trữ các ảnh `removed` quá 30 ngày (job lặp có `jobId` cố định).

### Task E3 — Trang công khai
- `/gallery`: lưới album (ảnh bìa, tên, số ảnh, ngày), lọc theo năm, phân trang 12 album/trang, trạng thái rỗng, metadata SEO.
- `/gallery/[albumId]`: chỉ album `published` (còn lại `notFound()`); lưới ảnh dùng biến thể `thumb`, tải thêm 24 ảnh/lần, `loading="lazy"` và `sizes`; **lightbox** (Base UI Dialog) có phím mũi tên, `Esc`, giữ focus, tải trước ảnh kế tiếp, hiện chú thích và nút "Yêu cầu gỡ ảnh". Dùng biến thể `lg` cho lightbox, không phục vụ ảnh gốc.
- "Yêu cầu gỡ ảnh": biểu mẫu ngắn mở cho cả người chưa đăng nhập (họ tên, email, lý do), có honeypot và giới hạn tốc độ.
- Trang chi tiết sự kiện hiển thị phần "Album sự kiện" khi có album đã đăng. Trang chủ thêm dải tối đa 8 ảnh mới nhất từ album đã đăng (ẩn khi rỗng). Thêm liên kết "Thư viện ảnh" vào navbar/footer.
- DTO công khai không chứa danh tính người tải lên.
- Chính sách hình ảnh: trang đăng ký sự kiện hiển thị dòng "Ban tổ chức có thể chụp và đăng ảnh sự kiện"; tạo `docs/GALLERY_POLICY.md` với văn bản tạm đánh dấu **CẦN PHÊ DUYỆT** (Khoa/pháp chế xác nhận). Không gắn thẻ hay nhận diện khuôn mặt.
- Nghiệm thu: Khoa tải 30 ảnh vào album, đăng, ảnh hiện trên `/gallery/[id]`; ảnh `removed` hoặc album `draft` truy cập bằng id trả 404; yêu cầu gỡ mở → ảnh tạm ẩn; lightbox dùng được bằng bàn phím; EXIF GPS không còn trong ảnh phục vụ.
- Đề xuất cho giai đoạn sau (chưa làm ở đợt này): người đã tham dự đề xuất ảnh vào album, Khoa duyệt hàng loạt (`TASK.md` Task 8.2).

---

## 6. Giai đoạn F — Đăng nhập Google (@dlu.edu.vn) và hợp nhất tài khoản

**Hiện trạng:** `src/lib/auth.ts` chỉ bật `emailAndPassword`; chưa có nhà cung cấp xã hội, chưa có trang `/complete-profile` dù `permissions.ts` đã ném `PROFILE_REQUIRED` và `TASK.md` nhắc tới trang này.

### Task F1 — Cấu hình Google và ràng buộc tên miền
- Files: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `.env.example`, `README.md`.
- Yêu cầu:
  1. Bật Google qua `socialProviders` của Better-Auth. **Đọc skill `better-auth-best-practices` và tài liệu Better-Auth để dùng đúng tên tùy chọn/hook, không đoán.** Thêm `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_ALLOWED_DOMAIN=dlu.edu.vn` (một tên miền duy nhất) vào `.env.example`.
  2. **Ràng buộc tên miền bắt buộc ở máy chủ** (tham số `hd` của Google chỉ gợi ý giao diện, không an toàn): chỉ chấp nhận khi phần tên miền sau dấu `@` **bằng đúng** `GOOGLE_ALLOWED_DOMAIN` (không phân biệt hoa thường). Tài khoản trường luôn có dạng `<tên>@dlu.edu.vn`; **không chấp nhận tên miền con** như `@abc.dlu.edu.vn`. Không dùng `endsWith` thô để tránh `x@evil-dlu.edu.vn`, `x@dlu.edu.vn.evil.com` hay `x@abc.dlu.edu.vn`. Email không hợp lệ bị từ chối và **không tạo `user`/`account`**.
  3. Email cá nhân (Gmail, ...) vẫn đăng nhập/đăng ký bằng mật khẩu như cũ; chỉ nút Google bị giới hạn theo tên miền.
  4. Ghi chú trong README: tạo OAuth Client trong Google Cloud Console, URI chuyển hướng `${BETTER_AUTH_URL}/api/auth/callback/google` (dev: `http://localhost:3000/api/auth/callback/google`), loại màn hình đồng ý (Internal nếu quản trị Google Workspace của trường cho phép, nếu không thì External + người dùng thử).
- Nghiệm thu: đăng nhập bằng `@dlu.edu.vn` thành công; bằng Gmail qua nút Google bị từ chối với thông báo tiếng Việt; thử `x@dlu.edu.vn.evil.com`, `x@evil-dlu.edu.vn` và `x@abc.dlu.edu.vn` đều bị từ chối.

### Task F2 — Hợp nhất tài khoản theo email
- Yêu cầu: nếu email Google trùng email của tài khoản đã đăng ký bằng mật khẩu (so sánh chữ thường) thì **gắn thêm một dòng `account` (Google) vào cùng `user.id`**, không tạo người dùng mới; hồ sơ, vai trò, dữ liệu cũ giữ nguyên. Dùng cơ chế liên kết tài khoản của Better-Auth với Google là nhà cung cấp tin cậy (xem `accountLinking`/`trustedProviders` trong docs). Đợt này không có luồng "quên/đặt mật khẩu" qua email, nên tài khoản tạo bằng Google chỉ đăng nhập bằng Google.
- **Rủi ro chiếm tài khoản (pre-hijacking) phải xử lý:** hiện đăng ký mật khẩu chưa yêu cầu xác minh email. Kẻ xấu có thể đăng ký trước `nan@dlu.edu.vn` với mật khẩu của hắn; khi chủ thật đăng nhập Google và hai tài khoản được hợp nhất, kẻ xấu vẫn giữ mật khẩu cũ. Yêu cầu: khi liên kết Google vào một `user` có `emailVerified = false`, xóa thông tin xác thực mật khẩu (`account.provider_id = 'credential'`) và thu hồi mọi phiên của `user` đó; người này về sau đăng nhập bằng Google. Vì đã bỏ gửi email nên không có xác minh email: mọi tài khoản đăng ký bằng mật khẩu đều có `emailVerified = false`, nghĩa là **liên kết Google luôn xóa mật khẩu cũ của tài khoản đó** (chấp nhận được vì tài khoản `@dlu.edu.vn` đăng nhập bằng Google). Không bật `requireEmailVerification`.
- Nghiệm thu (viết thành test): đăng ký `victim@dlu.edu.vn` bằng mật khẩu P → đăng nhập Google bằng chính email đó → vẫn chỉ có **một** `user`, có hai `account`; mật khẩu P không còn đăng nhập được và các phiên cũ bị thu hồi; vai trò/hồ sơ cũ giữ nguyên.

### Task F3 — Trang `/complete-profile` cho tài khoản mới từ Google
- Files: mới `src/app/complete-profile/page.tsx`, `src/validators/auth-schema.ts` (thêm `completeProfileSchema`), layout `student|employer|faculty-admin`, `src/lib/permissions.ts`.
- Vấn đề: người dùng mới từ Google có `user` nhưng chưa có `profiles` → `getCurrentUser` trả `role = null` → `requireRole` ném `PROFILE_REQUIRED` mà chưa có trang xử lý.
- Yêu cầu: layout bắt `PROFILE_REQUIRED` rồi `redirect("/complete-profile?next=...")` (kiểm tra `next` là đường dẫn nội bộ, chống open redirect). Trang cho chọn vai trò **chỉ `student` hoặc `alumni`** (`admin`, `faculty_staff`, `employer` không tự chọn được; nhân sự cấp quyền qua `adminUpdateUserRole`), điền họ tên (điền sẵn từ Google), MSSV, khóa, năm tốt nghiệp; tạo `profiles` trong một giao dịch và ghi audit. Cựu SV mới ở trạng thái "Chờ xác thực" như `TASK.md` Task 3.2. **Không** tự gán vai trò theo tên miền email.
- Nghiệm thu: tài khoản Google mới không vào được `/student/*` cho tới khi hoàn tất hồ sơ; gọi action trực tiếp với `role: "admin"` bị từ chối; sau khi hoàn tất được chuyển về `next`.

### Task F4 — Giao diện và theo dõi
- Files: `src/app/(auth)/login/login-form.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/profile/profile-editor.tsx`.
- Yêu cầu: nút "Đăng nhập bằng Google" (biểu tượng Google đúng hướng dẫn thương hiệu) gọi `authClient.signIn.social({ provider: "google", callbackURL })` với `callbackURL` đã kiểm tra nội bộ; dòng chú thích "Dành cho tài khoản email của Trường (@dlu.edu.vn). Cựu sinh viên dùng email cá nhân vui lòng đăng nhập bằng mật khẩu." Ánh xạ mã lỗi (tên miền không hợp lệ, hủy đồng ý, lỗi chung) sang thông báo tiếng Việt. Tab "Bảo mật" ở `/profile` liệt kê phương thức đăng nhập đã liên kết (mật khẩu, Google). Tài khoản `locked` đăng nhập bằng Google vẫn bị chặn và thấy trang "Tài khoản bị khóa". Ghi audit `login_google` và `link_google_account`.
- Nghiệm thu: luồng đầy đủ chạy ở dev; mã lỗi hiển thị đúng; `next=https://evil.com` bị bỏ qua.

---

## 7. Giai đoạn G — Hỗ trợ AI

**Nguyên tắc chung:** AI chỉ **đề xuất**, người dùng luôn là người quyết định cuối cùng; không tự ghi đè nội dung, không dùng AI cho quyết định tiền, học bổng hay xác thực cựu SV. Mọi tính năng AI mặc định **tắt** (cờ trong `site_settings`) và tự ẩn nếu thiếu cấu hình hoặc Redis lỗi.

### Task G0 — Hạ tầng AI dùng chung
- Files: `src/server/ai/*`, `package.json` (đã có `ai`), `.env.example`.
- Yêu cầu: đọc skill `ai-sdk` và `migrate-ai-sdk-v6-to-v7` (repo dùng `ai` 7.x, API khác bản 6). Chọn nhà cung cấp và model **bằng biến môi trường** (`AI_PROVIDER`, `AI_MODEL`, khóa tương ứng), không viết cứng. Bộ giới hạn tốc độ theo người dùng bằng Redis (xem Task A6). Hết thời gian chờ rõ ràng, lỗi trả `Result` thân thiện, không làm hỏng chức năng chính. Không truyền công cụ (tool) cho mô hình. Kết quả luôn là **đầu ra có cấu trúc kiểm bằng zod**, hiển thị dưới dạng văn bản thuần (React tự escape), không chèn HTML thô.
- `maskPii(text)`: che email, số điện thoại Việt Nam (`0xxxxxxxxx`, `+84...`), chuỗi số dài ≥ 8 chữ số (CCCD, MSSV), trước khi gửi nội dung ra ngoài. Có test.
- Nội dung người dùng và câu trả lời khảo sát là **dữ liệu không tin cậy** (có thể chứa chỉ dẫn tiêm vào): prompt phải bọc chúng trong khối dữ liệu và yêu cầu mô hình bỏ qua mọi chỉ dẫn nằm trong đó.
- Bảng `ai_summaries`: `id`, `scope` (`form_question|dashboard`), `scope_id`, `input_hash`, `content jsonb`, `model`, `items_count`, `created_by`, `created_at`. Dùng lại kết quả khi `input_hash` không đổi.
- Audit `ai_generate` (loại tính năng, model, số token; **không** ghi nội dung).

### Task G1 — Tóm tắt câu trả lời tự do trong khảo sát
- Files: `src/app/faculty-admin/forms/[id]/responses/page.tsx`, `response-analytics.tsx`, `src/server/services/ai-summary-service.ts`.
- Yêu cầu: với từng câu hỏi `short_text`/`long_text` có ≥ 5 câu trả lời không rỗng, hiện nút "Tóm tắt bằng AI" (chỉ `faculty_staff|admin`, chỉ khi cờ bật). Dữ liệu gửi đi: chỉ nội dung câu trả lời đã `maskPii`, mỗi câu cắt ≤ 1000 ký tự, tối đa 300 câu mới nhất (ghi rõ "dựa trên 300/N câu trả lời" khi bị cắt); **không** gửi danh tính người trả lời. Đầu ra: `{ overview, themes: [{ title, description, prevalence: "ít"|"một số"|"nhiều"|"đa số" }], suggestions: string[], limitations }`, dùng mức độ định tính, **không bịa con số** và không trích nguyên văn có thể nhận dạng người viết. Giao diện hiển thị nhãn "Do AI tổng hợp, cần đối chiếu với câu trả lời gốc", liên kết tới danh sách trả lời gốc, báo "đã cũ" khi có câu trả lời mới, và có nút tạo lại.
- Thêm dòng thông báo ở form khảo sát: câu trả lời có thể được tổng hợp bằng công cụ AI (văn bản **CẦN PHÊ DUYỆT**).
- Nghiệm thu: người ngoài `faculty_staff|admin` gọi bị từ chối; câu hỏi có < 5 câu trả lời không có nút; bản gửi đi không chứa email/số điện thoại (kiểm bằng test trên `maskPii`); gọi lại với cùng dữ liệu dùng bản đã lưu; câu trả lời chứa "bỏ qua mọi hướng dẫn trước đó" không làm đổi hành vi (đầu ra vẫn đúng schema).

### Task G2 — Nhận xét cho dashboard
- Files: `src/app/faculty-admin/dashboard/page.tsx`, `src/actions/analytics-actions.ts`.
- Yêu cầu: thẻ "Nhận xét nhanh" với nút bấm tạo (không tự gọi AI mỗi lần mở trang để tránh tốn chi phí). **Đầu vào chỉ là số liệu đã tổng hợp** (không dữ liệu cá nhân; nhóm dưới 5 người đã ghi "Dưới 5" theo `TASK.md` Task 7.6). Đầu ra: `{ headline, highlights: [{ text, metricKeys: string[] }] (3–5), watchouts: string[] (≤ 3), suggestedActions: string[] (≤ 3) }`. Server kiểm mọi `metricKeys` có trong đầu vào và loại bỏ nhận xét trích khóa không tồn tại; prompt yêu cầu chỉ dùng số liệu được cung cấp. Hiển thị cạnh số liệu gốc, kèm nhãn do AI tạo và thời điểm tạo; lưu vào `ai_summaries` theo `input_hash`.
- Nghiệm thu: nhận xét chỉ nhắc đến số liệu có trong dashboard; dữ liệu không đổi thì dùng lại bản đã lưu; tắt cờ thì thẻ biến mất.

### Task G3 — Trợ lý viết bài và tin tuyển dụng
- Files: `src/app/student/experiences/new/page.tsx` (trình soạn thảo TipTap), `src/app/employer/jobs/new/job-form.tsx`, mới `src/app/api/v1/ai/writing/route.ts`, `src/server/services/ai-writing-service.ts`.
- Endpoint `POST /api/v1/ai/writing`: body `{ kind: "experience"|"job", mode: "polish"|"titles"|"tags"|"job_draft", ... }` validate bằng zod, độ dài đầu vào ≤ 8000 ký tự. Quyền: `kind = experience` theo quyền đăng bài chia sẻ hiện có; `kind = job` theo `requireCompanyContext`. Giới hạn: tối đa 20 lượt/người/ngày và 5 lượt/phút (cấu hình qua env).
- Các chế độ:
  1. `polish`: chỉnh văn, giữ nguyên ý, tên riêng, con số, đường dẫn; không thêm dữ kiện. Server kiểm mọi con số và URL trong đầu ra có trong đầu vào, nếu không thì gắn cảnh báo.
  2. `titles`: 3–5 tiêu đề gợi ý.
  3. `tags` (chỉ bài chia sẻ, cột `experience_posts.tags` đã có): tối đa 5 thẻ, mỗi thẻ ≤ 30 ký tự, chuẩn hóa chữ thường, loại trùng, ưu tiên thẻ đang được dùng nhiều trong CSDL.
  4. `job_draft`: người dùng nhập nhanh vị trí, cấp bậc, kỹ năng chính, địa điểm, hình thức, mức lương (tùy chọn) và vài ý chính; đầu ra `{ description, requirements[], benefits[] }` **chỉ dựa trên thông tin đã nhập**. Phần chưa có dữ liệu để dấu `[Cần bổ sung: ...]`; validator chặn gửi tin khi còn dấu này. Không tự bịa lương, phúc lợi, địa điểm.
- Giao diện: nút "Trợ lý AI" mở hộp thoại hiển thị gợi ý (với `polish` có so sánh trước/sau), người dùng bấm "Áp dụng" hoặc "Bỏ qua". Chuyển đầu ra thành nội dung trình soạn thảo qua văn bản thuần/Markdown rồi để TipTap xử lý theo schema; không chèn HTML thô từ mô hình. Gợi ý của AI **không bỏ qua bước duyệt** của Khoa.
- Nghiệm thu: vượt hạn mức nhận 429; `polish` không đổi con số/URL (nếu đổi thì có cảnh báo); `job_draft` không điền mức lương khi người dùng chưa nhập; tin còn `[Cần bổ sung` không gửi được; tắt cờ thì nút biến mất.

---

## 8. Giai đoạn H — Kiểm thử, CI và tài liệu

### Task H1 — Kiểm thử
- Thiết lập Vitest (đơn vị/service) và Playwright (đường đi chính) như `TASK.md` Task 9.6, chạy với Postgres thử nghiệm và `drizzle-kit migrate`. Các test bắt buộc thêm cho đợt này:
  1. `registerForEvent` song song không vượt `capacity` (A3).
  2. Tệp riêng tư không truy cập được khi chưa đăng nhập hoặc không phải chủ/Khoa (A4).
  3. Cookie demo: production trả 404, cookie giả không cấp quyền (A5).
  4. Hero: `overlay_enabled` quyết định có/không lớp phủ và zoom; cửa sổ `starts_at/ends_at`; `isSafeHref` từ chối `javascript:`/`data:`/`http:`; mọi `href` trong `link-options.ts` hợp lệ và trỏ tới route có thật (C).
  5. Action từ chối `*FileId` của người khác hoặc sai `purpose` (B3); không endpoint nào nhận URL ảnh từ client; `ContentImage` rơi về placeholder khi không có ảnh (B5).
  6. Google: tên miền giả (`dlu.edu.vn.evil.com`, `evil-dlu.edu.vn`) và tên miền con (`abc.dlu.edu.vn`) bị từ chối; hợp nhất cùng email chỉ có một `user`; kịch bản pre-hijacking (F2).
  7. `maskPii`; đầu ra AI sai schema bị loại; hạn mức AI (G).
  8. Thư viện ảnh: album `draft`/ảnh `removed` trả 404; EXIF GPS được loại; quyền quản lý (E).

### Task H2 — CI và README
- GitHub Actions (`.github/workflows/ci.yml`): `npm ci`, `biome check`, `tsc --noEmit`, `npm test`, `npm run build`.
- Viết lại `README.md` (hiện là bản mặc định của create-next-app): giới thiệu, biến môi trường đầy đủ (kể cả `S3_PUBLIC_BASE_URL`, `GOOGLE_*`, `AI_*`), cách chạy CSDL, `db:generate`, `db:migrate`, `db:seed`, worker, test, cấu hình Google OAuth.

---

## 9. Thứ tự thực hiện và phụ thuộc

| Thứ tự | Task | Phụ thuộc |
| :--- | :--- | :--- |
| 1 | A1, A2, A3, A4, A5 | — |
| 2 | B1 → B2 → B3 → B4 → B5 | A4 |
| 3 | A6, A7, A8 | — |
| 4 | C1 → C2 → C3 → C4 | B1–B4 |
| 5 | D1 → D2 | C (hero), A1, B4 |
| 6 | F1 → F2 → F3 → F4 | A6 |
| 7 | E1 → E2 → E3 | B1–B4, D1 |
| 8 | G0 → G1, G2, G3 | A6, D1 (cờ bật/tắt) |
| 9 | H1 làm song song từ bước 1; H2 làm cuối | — |

---

## 10. Điều agent không được tự quyết (hỏi lại người phụ trách)

- Loại màn hình đồng ý OAuth (Internal nếu Google Workspace của trường cho phép) và thông tin đăng nhập Google Cloud. Tên miền đã chốt: chỉ `@dlu.edu.vn`, không có tên miền con.
- Nhà cung cấp và model AI, khóa API, ngân sách; văn bản thông báo cho người trả lời khảo sát và chính sách quyền riêng tư (đánh dấu **CẦN PHÊ DUYỆT**).
- Tên miền công khai/CDN của bucket (`S3_PUBLIC_BASE_URL`).
- Văn bản chính sách hình ảnh và quy trình gỡ ảnh (pháp lý).
- Danh sách đối tác chiến lược hiển thị trên trang chủ; chỉ số thống kê nào được phép công bố.
- Việc xóa dữ liệu cũ khi chuyển đổi (URL ảnh ngoài, MSSV trùng): dừng và báo cáo, không tự xóa.

---

## 11. Phụ lục — Đề xuất chưa nằm trong đợt này

- Bảng cấu hình tác vụ định kỳ (`scheduled_task_configs`) kèm trang bật/tắt, "Chạy ngay" và lịch sử chạy; hiện mới có một tác vụ (đánh dấu tin hết hạn mỗi giờ).
- AI hỗ trợ duyệt bài chia sẻ/tin tuyển dụng (chấm rủi ro, gắn cờ; Khoa vẫn quyết định).
- Danh sách chờ và hủy đăng ký sự kiện (`TASK.md` Task 6.1–6.7), Ban liên lạc, mentoring, ứng tuyển trong hệ thống (`TASK.md` Giai đoạn 4–6).
- Quản lý cựu sinh viên cho Khoa: danh sách có lọc/phân trang/xuất CSV, nhập danh sách tốt nghiệp từ CSV, sửa hồ sơ hộ, báo cáo hồ sơ lỗi thời.

---

## 12. Tiêu chí hoàn thành đợt này

- Không còn dữ liệu mẫu trong mã chạy thật; không còn ô nhập URL ảnh, không còn nguồn ảnh ngoài (không Unsplash) và CSDL không lưu URL ảnh do người dùng nhập; `images.unoptimized` đã bỏ, `next.config.ts` chỉ khai báo host kho lưu trữ và ảnh được tối ưu.
- Tệp riêng tư không truy cập được từ bên ngoài; mọi thao tác xem tệp học bổng có audit.
- Banner trang chủ quản lý được từ CSDL, có công tắc lớp phủ và chọn liên kết từ danh sách hoặc nhập URL; trang chủ không còn số liệu, đối tác, liên hệ viết cứng; biểu mẫu công khai không còn nút giả.
- `/gallery` và `/faculty-admin/gallery` hoạt động đủ quy trình đăng, gỡ, yêu cầu gỡ ảnh.
- Đăng nhập Google chỉ chấp nhận tên miền được phép, hợp nhất theo email, không còn lỗ hổng chiếm tài khoản.
- Ba tính năng AI (tóm tắt khảo sát, nhận xét dashboard, trợ lý viết) chạy sau cờ bật/tắt, có giới hạn tốc độ và che thông tin cá nhân.
- `biome check`, `tsc --noEmit`, `npm test`, `npm run build` đều xanh; README đã cập nhật.