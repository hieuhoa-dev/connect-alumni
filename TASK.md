# AGENT_TASKS.md — Hướng dẫn thực hiện cho AI agent (DLU Connect Alumni)



## 1. Giai đoạn 0 — Khẩn cấp (làm đầu tiên)

### Task 0.1 (N01) — Khóa cửa hậu đăng nhập demo
- Files: `src/app/api/auth/demo-login/route.ts`, `demo-logout/route.ts`, `src/lib/permissions.ts` (`getCurrentUser`), `src/lib/demo-accounts.ts`, `src/app/(auth)/login/page.tsx`, `.env.example`.
- Vấn đề: `POST /api/auth/demo-login {email}` đặt cookie `dlu_demo_user`; `getCurrentUser` tin cookie này trước phiên Better-Auth, dựng người dùng và vai trò (kể cả `admin`) không cần mật khẩu.
- Yêu cầu:
  1. Thêm helper `isDemoEnabled()` trong `demo-accounts.ts`: trả `true` chỉ khi `process.env.ENABLE_DEMO_LOGIN === "true"` **và** `process.env.NODE_ENV !== "production"`.
  2. `demo-login`, `demo-logout`: nếu `!isDemoEnabled()` trả `404`.
  3. `getCurrentUser`: chỉ đọc cookie demo khi `isDemoEnabled()`.
  4. Trang đăng nhập: chỉ hiển thị hộp "Tài khoản demo" khi cờ bật. Vì là Client Component, truyền cờ từ Server Component cha (không đưa `process.env` không có tiền tố `NEXT_PUBLIC_` vào client).
  5. Cookie không còn chứa email thuần: nếu giữ demo, ký giá trị (HMAC bằng `BETTER_AUTH_SECRET`) hoặc lưu id phiên ngẫu nhiên.
  6. Thêm `ENABLE_DEMO_LOGIN=false` vào `.env.example`.
- Nghiệm thu: với `NODE_ENV=production`, `curl -X POST /api/auth/demo-login -d '{"email":"admin@khoacntt.edu.vn"}'` trả 404 và không đặt cookie; đặt tay cookie `dlu_demo_user` không còn cấp quyền; đăng nhập Better-Auth thật vẫn hoạt động.

### Task 0.2 (N02) — Bỏ dữ liệu mẫu tự động thay thế khi lỗi CSDL
- Files: `src/actions/event-actions.ts`, `job-actions.ts`, `scholarship-actions.ts`, `company-actions.ts`, `experience-actions.ts`, `form-actions.ts`, `auth-actions.ts` (`adminGetUsers`), `src/lib/dlu-sample-data.ts`, `scripts/seed-data.ts`.
- Vấn đề: khối `try { ... } catch { /* offline */ }` rồi trả dữ liệu cứng; `if (rows.length > 0) return rows` làm bảng rỗng cũng rơi về dữ liệu mẫu. `registerForEvent` và `applyForScholarship` trả thành công giả (`reg-demo-*`, `app-demo-*`) khi ghi CSDL lỗi.
- Yêu cầu:
  1. Xóa mọi `catch` trả dữ liệu mẫu trong các action liệt kê. Hàm đọc: lỗi CSDL thì để lỗi nổi lên (ghi `console.error` có ngữ cảnh), bảng rỗng thì trả mảng rỗng hoặc `null`.
  2. Hàm ghi (`registerForEvent`, `applyForScholarship`, ...): không bao giờ trả bản ghi giả. Lỗi thì trả `{ ok: false, code: "INTERNAL" }`.
  3. Chuyển nội dung `dlu-sample-data.ts` thành dữ liệu seed trong `scripts/seed-data.ts` (idempotent, có thể chạy lại). Thêm script `pnpm db:seed`.
  4. Nếu dự án cần "chế độ trình diễn", cài đặt **một chỗ duy nhất** (lớp truy cập dữ liệu), bật bằng `ENABLE_DEMO_DATA`, mặc định tắt, và không bao giờ chạy trong production.
  5. Các trang cần có trạng thái rỗng (empty state) thay vì dữ liệu giả: jobs, events, scholarships, experiences, trang chủ.
  6. Xóa import `sampleDLU*` khỏi action. Giữ file mẫu nếu seed còn dùng.
  7. Dashboard `analytics-actions.ts` đã không có dự phòng: giữ nguyên, nhưng thêm xử lý lỗi hiển thị ở trang (xem Task 2.3).
- Nghiệm thu: tắt CSDL thì trang báo lỗi rõ ràng (không hiện số liệu giả, không báo "đã đăng ký" giả); CSDL rỗng thì trang hiện empty state; `pnpm db:seed` chạy hai lần không lỗi và không nhân đôi dữ liệu.

### Task 0.3 (N03) — Bỏ cấp quyền công ty mặc định
- File: `src/lib/permissions.ts` (`requireCompanyContext`), `src/actions/job-actions.ts` (`getEmployerJobs`), `src/lib/demo-accounts.ts` (`sampleDemoCompanies`).
- Vấn đề: người có vai trò `employer` nhưng không có thành viên công ty (hoặc truy vấn lỗi) được gán `sampleDemoCompanies[0]` với vai trò admin công ty. `getEmployerJobs` còn trả hai tin giả của "VNG".
- Yêu cầu:
  1. Xóa nhánh dự phòng. Không có công ty hoạt động hợp lệ thì ném `ForbiddenError` (hoặc kết quả `FORBIDDEN`); trang `employer/*` bắt lỗi này và chuyển tới `/employer/onboarding`.
  2. Khi không có `is_active_context = true`, **không** lấy `memberships[0]` im lặng (L22). Nếu người dùng chỉ có một công ty, đặt nó làm hoạt động trong một giao dịch; nếu có nhiều, buộc chọn.
  3. `getEmployerJobs`: xóa mảng tin giả.
- Nghiệm thu: tài khoản `employer` mới (chưa có công ty) vào `/employer/jobs` được chuyển tới onboarding, không thấy tin của công ty khác.

### Task 0.4 (L35) — Bí mật trong gói gửi đi
- Yêu cầu: kiểm tra `.gitignore` loại `.env*` (trừ `.env.example`); thêm script/ghi chú `docs/SECURITY.md` hướng dẫn xoay vòng khóa CSDL, Redis, S3 và `BETTER_AUTH_SECRET` nếu gói đã chia sẻ. **Không** đọc hay in giá trị trong `.env`.
- Nghiệm thu: `git ls-files | grep -E '^\.env'` chỉ ra `.env.example`.

### Task 0.5 (N04, N06, N12) — Dữ liệu demo lệch schema
- Sau Task 0.2, rà `demo-accounts.ts`: xóa các trường không có trong `profiles` (`currentCompany`, `currentPosition`, `isPublic`, `linkedinUrl`) hoặc, nếu Giai đoạn 3 đã thêm cột tương ứng, dùng đúng tên cột. Seed khảo sát phải dùng giá trị có trong enum `form_type`. Ngày giờ luôn là `Date` (không trộn chuỗi `"2026-11-30"`).
- Nghiệm thu: seed chạy được với CSDL thật; không còn ép kiểu `as` để che lệch schema trong code demo.

---

## 2. Giai đoạn 1 — Bảo mật và toàn vẹn dữ liệu tài chính

### Task 1.1 (L01) — Không cho client tự chọn vai trò
- File: `src/actions/auth-actions.ts` (`registerWithProfile`, `SignUpProfileInput`), `src/validators/` (thêm `auth-schema.ts`), `src/app/(auth)/register/page.tsx`.
- Yêu cầu:
  1. Tạo zod `registerSchema`: `role` chỉ nhận `student | alumni | employer`; email, mật khẩu (độ dài tối thiểu theo cấu hình Better-Auth), `name`, các trường tùy chọn có giới hạn độ dài; `batchYear`, `graduationYear` là số nguyên trong khoảng hợp lý (ví dụ 1990..năm hiện tại + 6).
  2. `registerWithProfile` gọi `registerSchema.parse(input)` ở dòng đầu. `admin` và `faculty_staff` chỉ được cấp qua `adminUpdateUserRole` hoặc seed.
  3. Vai trò `alumni` mới tạo có `alumni_verified = false` (cột thêm ở Task 3.2); trước khi có cột, ghi chú TODO có mã Task 3.2 và để `status = "active"`.
  4. Bắt lỗi trùng email trả `CONFLICT` thân thiện.
- Nghiệm thu: gọi action trực tiếp với `role: "admin"` hoặc `"faculty_staff"` bị từ chối `VALIDATION`; đăng ký ba vai trò hợp lệ vẫn chạy.

### Task 1.2 (L07) — Tài khoản không có hồ sơ
- File: `src/lib/permissions.ts` (`getCurrentUser`, `requireRole`), `src/lib/auth.ts`.
- Yêu cầu: khi không có `profiles` thì `role = null` (không mặc định `student`); `requireRole` ném `ForbiddenError` với mã riêng `PROFILE_REQUIRED`; layout chuyển tới trang hoàn tất hồ sơ `/complete-profile` (tạo ở Task 3.3). Cân nhắc dùng hook của Better-Auth để tạo `profiles` cùng lúc với `user`, và bật `requireEmailVerification`.
- Nghiệm thu: tạo `user` qua `/api/auth/sign-up/email` (không qua `registerWithProfile`) không vào được `/student/*`; bị chuyển tới `/complete-profile`.

### Task 1.3 (L02) — Tách truy vấn công khai khỏi dữ liệu nội bộ
- Files: `src/actions/event-actions.ts`, `scholarship-actions.ts`, `experience-actions.ts`, `job-actions.ts`, `src/app/(public)/**`, `src/components/landing/*` (mọi component `"use client"` nhận dữ liệu từ action), `faculty-admin/events/page.tsx`, `student/events/page.tsx`.
- Vấn đề: `getPublishedEvents` trả `registrations` thô, `creator.profile`, `speakers.alumni.profile` (có SĐT); `getCampaignById` trả toàn bộ hồ sơ xin học bổng + hồ sơ sinh viên + mọi cam kết; `getExperiencePostById` trả bài ở mọi trạng thái; trang chủ truyền dữ liệu này xuống component client (nằm trong HTML/JSON gửi trình duyệt).
- Yêu cầu:
  1. Tạo thư mục `src/server/dal/` (Data Access Layer) với các hàm **chỉ-đọc, trả DTO** và **chỉ `select` cột cần thiết**:
     - `getPublicEvents()` → `{ id, title, type, format, startTime, endTime, coverImageUrl, capacity, registeredCount, speakers: [{ displayName, avatarUrl, topic }] }`. Không SĐT, không email, không danh sách đăng ký.
     - `getPublicEventById(id)` → thêm mô tả; `locationOrLink` chỉ trả cho người đã đăng ký hoặc nhân sự Khoa (hàm riêng `getEventJoinInfo(eventId)`); lọc `status = published` (L16).
     - `getPublicCampaigns()`, `getPublicCampaignById(id)` → tiêu đề, mô tả, mục tiêu, đã nhận (chỉ từ `current_amount`), hạn nộp, danh sách nhà tài trợ đã **fulfilled** với tên hiển thị (nhà tài trợ ẩn danh trả "Nhà tài trợ ẩn danh", xử lý phía server). Không `applications`, không `student`.
     - `getPublicExperiencePosts(params)`, `getPublicExperiencePostById(id)` → chỉ `status = published`; tác giả chỉ `fullName`, `avatarUrl`, `batchYear`.
     - `getPublicJobPosts(params)` → xem Task 5.1 về lọc `industry`.
  2. Hàm nội bộ cho Khoa/chủ sở hữu (`getEventForStaff`, `getCampaignDetailsForFaculty`, ...) vẫn gọi `requireRole`.
  3. Trang công khai và component landing chỉ nhận DTO ở trên. Kiểu props khai báo rõ (không `any`).
  4. Trang `experiences/[id]/page.tsx`: nếu bài không `published` thì `notFound()` (trừ tác giả hoặc nhân sự Khoa xem bản xem thử qua đường dẫn riêng có kiểm quyền).
  5. Đổi tên để phân biệt: hàm DAL không nằm trong file `"use server"` (nên không trở thành endpoint công khai); gọi từ Server Component. Nếu client cần dữ liệu, tạo route handler `GET` hoặc truyền `initialData` từ Server Component.
- Nghiệm thu: xem nguồn HTML/RSC payload của trang chủ và trang sự kiện, học bổng: không còn `phone`, `studentCode`, `registrations`, `applications`, email; bài `draft/pending/rejected` truy cập bằng id trả 404; link họp online không hiện với khách.

### Task 1.4 (L04) — Xác nhận nhận tiền không cộng đôi
- File: `src/actions/scholarship-actions.ts` (`confirmFulfillPledge`).
- Yêu cầu: bỏ pre-check ngoài giao dịch làm điều kiện quyết định. Trong `db.transaction`:
  1. `UPDATE donation_pledges SET status='fulfilled', fulfilled_at=now() WHERE id=:id AND status='pledged' RETURNING *`.
  2. Nếu không có dòng: ném `INVALID_STATE`, **không** cộng tiền.
  3. Có dòng: `UPDATE scholarship_campaigns SET current_amount = current_amount + :amount WHERE id = :campaignId` dùng `amount` lấy từ dòng `RETURNING` (không từ bản đọc trước).
  4. Cân nhắc chặn khi chiến dịch đã `closed`.
  Side effect (audit, thông báo) sau commit. `cancelPledge` cũng đổi sang UPDATE có điều kiện `status='pledged'`, ghi audit (`cancel_donation_pledge`).
- Nghiệm thu: test song song: 2 lời gọi đồng thời trên cùng một cam kết → đúng 1 thành công, `current_amount` tăng đúng một lần.

### Task 1.5 (L03, L05, L13) — Hồ sơ xin học bổng đúng và có giao dịch
- Files: `src/app/student/scholarships/[campaignId]/apply/apply-form.tsx`, `page.tsx`, hook `useApplyScholarship`, `scholarship-actions.ts` (`applyForScholarship`), `src/app/student/surveys/[id]/form-renderer.tsx`, `schema.ts`.
- Yêu cầu:
  1. Chiến dịch có `applicationFormId`: trang `apply` dùng `FormRenderer` với câu hỏi của form đó; **bỏ** form cứng `gpa/circumstance/proofUrl` (hoặc, nếu chiến dịch không có form động, tạo một form mặc định khi tạo chiến dịch).
  2. Action mới `submitScholarshipApplication({ campaignId, answers })`: một giao dịch gồm (a) kiểm tra chiến dịch `open` và còn hạn; (b) kiểm tra người nộp là `student` đang `active`; (c) kiểm tra đầy đủ câu bắt buộc, `questionId` thuộc form, giá trị hợp lệ (xem Task 4.2); (d) tạo `form_responses` + `form_answers`; (e) tạo `scholarship_applications` gắn `form_response_id`.
  3. `formResponseId` **không còn** nhận từ client. Nếu phải giữ, kiểm tra `respondent_id = user.id AND form_id = campaign.application_form_id`.
  4. Migration: `UNIQUE (campaign_id, student_id)` trên `scholarship_applications`. Bắt lỗi vi phạm ràng buộc → `CONFLICT` ("Bạn đã nộp hồ sơ").
  5. `reviewScholarshipApplication`: chỉ đặt `decided_at` khi `approved|rejected`; trạng thái cho phép chuyển: `pending → reviewing → approved|rejected`; không đảo `approved ↔ rejected` trừ khi admin (và ghi audit); `score` 0 hiển thị "0", không "Đạt"; nhãn trạng thái trong thông báo bằng tiếng Việt.
  6. Thêm cột `awarded_amount numeric`, `disbursed_at timestamptz` vào `scholarship_applications`; thêm `slots int` vào `scholarship_campaigns` (nullable). Không cho duyệt vượt `slots`.
- Nghiệm thu: nộp hồ sơ → trang Khoa thấy đủ câu trả lời; bấm nộp hai lần nhanh chỉ tạo một hồ sơ; truyền `formResponseId` của người khác bị từ chối.

### Task 1.6 (L06) — Lịch tự động đánh dấu tin hết hạn
- Files: `src/lib/notifications.ts` (`scheduleJobExpiryCheck`), `src/workers/notification.worker.ts` (hoặc nơi worker khởi động), `src/instrumentation.ts` (nếu dùng).
- Yêu cầu: gọi `scheduleJobExpiryCheck()` khi worker khởi động, dùng `jobId` cố định (repeatable job) để không tạo lịch trùng. Xử lý job: `UPDATE job_posts SET status='expired' WHERE status='approved' AND expires_at < now()`. Ghi log số dòng cập nhật. Thêm script `pnpm worker` vào `package.json` nếu chưa có và ghi cách chạy vào `README`.
- Nghiệm thu: tạo tin có `expires_at` trong quá khứ, chạy worker → trạng thái thành `expired` trong ≤ 1 chu kỳ; chạy worker hai lần không tạo hai lịch lặp (kiểm tra bằng `queue.getRepeatableJobs()`).

### Task 1.7 (L12) — Chuyển trạng thái có điều kiện
- Files: `job-actions.ts` (`reviewJobPost`), `company-actions.ts` (duyệt công ty), `experience-actions.ts` (duyệt bài), `scholarship-actions.ts` (`reviewScholarshipApplication`).
- Yêu cầu: tạo `src/lib/state-machine.ts` với bảng chuyển hợp lệ cho từng thực thể: job (`pending → approved|rejected`, `approved → expired|closed`, `rejected → pending` khi gửi lại), company (`pending → verified|rejected`, `verified → rejected` chỉ admin), experience (`pending → published|rejected`, `rejected → pending`), application (như Task 1.5). Mỗi UPDATE có `WHERE status IN (:from)`; không có dòng → `INVALID_STATE`. Từ chối bắt buộc có `rejectedReason` (zod `min(5)`), lưu cột `rejected_reason` (thêm cho `experience_posts`).
- Nghiệm thu: duyệt lại tin đã bị từ chối bị chặn; duyệt hai lần đồng thời chỉ một lần có hiệu lực, không gửi thông báo trùng.

### Task 1.8 (L15) — Công ty bị từ chối thì tin ẩn
- File: `job-actions.ts` (truy vấn công khai), `company-actions.ts`.
- Yêu cầu: truy vấn công khai thêm điều kiện công ty `verification_status = 'verified'`. Khi công ty chuyển sang `rejected`, thông báo **tất cả** thành viên (không chỉ `createdBy`).
- Nghiệm thu: từ chối công ty → tin đã duyệt của công ty đó biến mất khỏi trang công khai.

### Task 1.9 (L17) — Cam kết tài trợ
- File: `scholarship-actions.ts` (`createDonationPledge`), `src/validators/scholarship-schema.ts`.
- Yêu cầu: tách hai action: `pledgeDonation` (người dùng đã đăng nhập tự cam kết; `donorId = user.id`, tên hiển thị lấy từ hồ sơ, người dùng chỉ chọn `isAnonymous`) và `recordDonationOnBehalf` (chỉ `faculty_staff|admin`, được nhập tên người tài trợ ngoài hệ thống, `donorId = null`). Cả hai: validate bằng zod **trước** khi dùng `input`, kiểm tra chiến dịch tồn tại và `open`, tài khoản `active`, `amount > 0` và có trần hợp lý, ghi audit. Xóa logic so sánh chuỗi tên với tên nhân sự.
- Nghiệm thu: người dùng thường không thể đặt tên hiển thị tùy ý; cam kết vào chiến dịch đã đóng bị từ chối.

### Task 1.10 (L18) — Chuyển hướng, trang lỗi, lớp bảo vệ đường dẫn
- Files: `src/proxy.ts` (mới, Next.js 16), `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/global-error.tsx`, layout `student|employer|faculty-admin/layout.tsx`.
- Yêu cầu:
  1. `proxy.ts`: kiểm tra có cookie phiên Better-Auth (không truy vấn CSDL) cho tiền tố `/student`, `/employer`, `/faculty-admin`, `/dashboard`; thiếu thì redirect `/login?next=<đường dẫn>`. Matcher loại `_next`, `api/auth`, tệp tĩnh.
  2. Layout: bắt `UnauthorizedError` → `redirect("/login?next=...")`; `ForbiddenError` → `redirect("/403")` hoặc trang thông báo; tài khoản `locked` → trang "Tài khoản bị khóa".
  3. Sau đăng nhập chuyển về `next` (kiểm tra `next` là đường dẫn nội bộ, chống open redirect).
  4. Thêm `error.tsx` và `not-found.tsx` bằng tiếng Việt, đúng thiết kế.
- Nghiệm thu: khách vào `/student/dashboard` được chuyển tới `/login?next=/student/dashboard`; `next=https://evil.com` bị bỏ qua.

---

## 3. Giai đoạn 2 — Nền tảng dùng chung

### Task 2.1 — Lớp dịch vụ và kết quả mutation chuẩn
- Tạo cấu trúc:
  - `src/server/services/*.ts` — hàm nghiệp vụ nhận `actor: { userId, role, profileStatus }` và tham số đã validate, chứa giao dịch; **không** gọi `cookies()`.
  - `src/server/dal/*.ts` — truy vấn chỉ-đọc trả DTO (đã tạo ở Task 1.3).
  - `src/actions/*.ts` — mỏng: xác thực người gọi → zod → gọi service → trả `Result`.
  - `src/lib/result.ts` — kiểu `Result<T>` và hàm `ok()`, `fail(code, message)`, `toActionResult(fn)` bắt lỗi đã biết (`ForbiddenError`, `ZodError`, lỗi ràng buộc Postgres mã `23505` → `CONFLICT`, `23503` → `VALIDATION`).
- Di chuyển lần lượt theo module (jobs, events, scholarships, forms, companies, experiences, auth). Giữ chữ ký tương thích cho tới khi giao diện được cập nhật.
- Hook client dùng `Result`: nếu `ok === false` thì ném lỗi trong `mutationFn` để TanStack Query vào nhánh `onError`, hiển thị `message` bằng toast.
- Nghiệm thu: không còn action nào chứa SQL/giao dịch trực tiếp (trừ DAL/service); có ít nhất test đơn vị cho service tiền (`fulfillPledge`) và đăng ký sự kiện.

### Task 2.2 — Chiến lược TanStack Query
- Quy tắc: Server Component đọc dữ liệu trực tiếp từ DAL; TanStack Query cho **mutation** và dữ liệu client-side thay đổi nhiều (danh sách lọc, tìm kiếm, bảng quản trị). Query key tập trung ở `src/lib/query-keys.ts`. Sau mutation `invalidateQueries` đúng key và `router.refresh()` khi trang dựa vào Server Component.
- Với `useQuery` đọc dữ liệu dùng chung: dùng route handler `GET` (`src/app/api/v1/...`) bọc DAL, hoặc `initialData` từ Server Component. Không dùng server action để đọc dữ liệu cho `useQuery` (action chạy tuần tự, không cache HTTP).
- Thêm route handler mỏng cho: `POST /api/v1/uploads/presign` (Task 2.4), `GET /api/v1/alumni` (Task 4.x). Mỗi route: xác thực → zod → service → JSON; mã trạng thái HTTP đúng (401/403/404/409/422).

### Task 2.3 — Xử lý lỗi hiển thị ở trang
- Mỗi nhóm route có `error.tsx` riêng cho `faculty-admin`, `student`, `employer` với nút "Thử lại". Dashboard Khoa hiển thị thông báo lỗi thay vì trang trắng khi CSDL lỗi.

### Task 2.4 (L14) — Luồng tải tệp (tiền đề cho ảnh đại diện, minh chứng, thư viện ảnh)
- Files: `src/lib/storage.ts`, `schema.ts` (`uploaded_files`), `src/app/api/v1/uploads/presign/route.ts`, `src/components/shared/file-uploader.tsx` (mới), `form-renderer.tsx` (câu hỏi `file_upload`), `next.config.ts` (`images.remotePatterns`).
- Yêu cầu:
  1. `POST /api/v1/uploads/presign` body `{ purpose, filename, contentType, size }`. `purpose` thuộc: `avatar`, `scholarship_proof`, `event_cover`, `album_photo`. Kiểm tra người gọi và quyền theo `purpose`; kiểm tra MIME (danh sách cho phép theo purpose) và dung lượng tối đa (ảnh ≤ 5 MB, minh chứng ≤ 10 MB, PDF/JPEG/PNG). Khóa đối tượng dạng `{purpose}/{userId}/{uuid}.{ext}`, **không** dùng tên tệp người dùng.
  2. Ghi `uploaded_files` ở trạng thái `pending`; endpoint `POST /api/v1/uploads/confirm` kiểm tra đối tượng đã tồn tại trên S3 (HEAD), đối chiếu kích thước/MIME rồi đặt `ready`.
  3. Tệp riêng tư (minh chứng học bổng): không công khai; xem qua liên kết ký có hạn (≤ 5 phút) do action `getScholarshipFileUrl(fileId)` sinh, chỉ chủ hồ sơ và Khoa; **ghi audit** `view_scholarship_file`.
  4. Tệp công khai (ảnh bìa sự kiện, ảnh album đã duyệt, avatar): đường dẫn qua CDN hoặc liên kết ký dài hạn; cấu hình `images.remotePatterns` cho domain lưu trữ.
  5. Thay ô nhập liên kết trong câu hỏi `file_upload` bằng `file-uploader`, lưu `file_id` thay vì URL tự do (`form_answers.file_url` đổi sang tham chiếu `uploaded_files.id`; migration chuyển dữ liệu cũ).
  6. Dọn tệp mồ côi: job định kỳ xóa `uploaded_files` ở `pending` quá 24 giờ.
- Nghiệm thu: tải ảnh hợp lệ thành công; MIME/size sai bị từ chối ở máy chủ; người khác không xem được minh chứng; mỗi lần Khoa xem sinh một dòng audit.

### Task 2.5 — Ràng buộc duy nhất và chỉ mục (một migration gộp, có thể tách theo module)
- `profiles.student_code` UNIQUE (khi không null; dùng unique index một phần `WHERE student_code IS NOT NULL`). Trước khi thêm, script kiểm tra trùng và báo cáo thay vì làm hỏng migration.
- `form_responses (form_id, respondent_id)` UNIQUE (hoặc cho phép sửa phản hồi cũ; chọn một và ghi rõ trong PR).
- `scholarship_applications (campaign_id, student_id)` UNIQUE (Task 1.5).
- `company_members (user_id) WHERE is_active_context` UNIQUE một phần (chỉ một công ty hoạt động mỗi người).
- `companies.tax_code` UNIQUE (nullable); chuẩn hóa tên công ty để cảnh báo trùng.
- Chỉ mục tìm kiếm cho Task 4: `profiles(batch_year)`, `profiles(province)`, `profiles(industry)`, và GIN trigram cho `full_name`, `current_company_name` (cần `CREATE EXTENSION pg_trgm`, ghi vào migration).

### Task 2.6 (L29) — Validator chặt hơn
- `job-schema.ts`: `expiresAt` phải ở tương lai và ≤ 180 ngày; `title`, `description` có giới hạn độ dài.
- `event-schema.ts`: `endTime > startTime`; `capacity` nguyên dương hoặc null; `status` mặc định `draft` (không phải `published`); sự kiện online yêu cầu `locationOrLink` là URL hợp lệ.
- `form-schema.ts`: `single_choice/multi_choice` bắt buộc `options` ≥ 2; `scale` có `min < max`; trạng thái mặc định `draft`.
- `scholarship-schema.ts`: `applicationDeadline` ở tương lai và trước/bằng `deadline` của chiến dịch; `applicationFormId` phải là form loại `scholarship_application` (kiểm tra trong service).
- Mọi `rejectedReason` bắt buộc khi từ chối.

### Task 2.7 (L30, N07) — Audit đầy đủ, không nuốt lỗi
- Thêm audit cho: `cancelPledge`, `markAttendance`, `respondSpeakerInvitation`, `switchActiveCompany`, sửa hồ sơ, xem tệp học bổng, thay đổi vai trò/khóa tài khoản, đổi trạng thái mọi thực thể.
- `logAuditEvent` trong giao dịch: nhận `tx` tùy chọn để ghi audit **cùng giao dịch** cho thao tác tài chính. Ngoài giao dịch: lỗi ghi audit ghi `console.error` kèm ngữ cảnh (không nuốt im lặng) và không làm hỏng thao tác chính.
- `notifications.ts`, `redis.ts`: bỏ `.on("error", () => {})` rỗng; ghi log có cấp độ. Thông báo thất bại được lưu `notifications` ở CSDL trước (nguồn sự thật) rồi mới đẩy hàng đợi; hàng đợi hỏng không làm mất bản ghi.
- Hợp nhất hai hàm `getAuditLogs` (`analytics-actions.ts` và `audit-actions.ts`) thành một, có phân trang (`limit`, `offset` hoặc cursor), lọc theo `action`, `actorId`, khoảng ngày.

### Task 2.8 — Email thật (L34)
- `notification.worker.ts`: thay `console.log` bằng nhà cung cấp email (Resend/SMTP; cấu hình bằng biến môi trường, không hardcode). Mẫu email tiếng Việt cho từng `type`. Thử lại có giới hạn (3 lần, backoff). Không gửi nếu người dùng tắt thông báo email (cột `email_notifications` trong `profiles`, mặc định true). Bỏ emoji trong log.

### Task 2.9 — Hạ tầng ảnh và tài nguyên tĩnh (N08, N09)
- Tạo `public/` với logo (`dlu-logo.svg` hoặc tệp thật do Khoa cung cấp; nếu chưa có, dùng chữ biểu trưng tạm có chú thích TODO), `favicon`, ảnh dự phòng `placeholder-avatar.svg`, `placeholder-cover.svg`.
- Bỏ `images.unoptimized: true`; cấu hình `remotePatterns` cho các nguồn thật; dùng `next/image` với `sizes`.

---

## 4. Giai đoạn 3 — Nhóm 1: Hồ sơ cựu sinh viên

### Task 3.1 — Mở rộng schema hồ sơ
Migration thêm vào `profiles`:

| Cột | Kiểu | Ghi chú |
| :--- | :--- | :--- |
| `major` | text | Chuyên ngành; danh mục cố định (bảng `majors` hoặc enum cấu hình) |
| `province` | text | Tỉnh/thành đang sống; danh mục 63/34 tỉnh thành theo cấu hình |
| `employment_status` | enum `employed`, `self_employed`, `seeking`, `studying`, `other` | Cho thống kê |
| `current_title` | text | Chức danh |
| `current_company_name` | text | Tên nơi làm việc (nhập tự do) |
| `current_company_id` | uuid null FK `companies` | Khi trùng với doanh nghiệp đối tác |
| `industry` | text FK danh mục `industries` | Lĩnh vực chuẩn hóa (dùng chung với `companies.industry`, xem Task 7.1) |
| `linkedin_url`, `github_url`, `website_url` | text | Validate URL |
| `skills` | text[] | Tối đa 20, mỗi thẻ ≤ 30 ký tự |
| `visibility` | enum `public`, `members`, `private` | Mặc định `members` |
| `show_email`, `show_phone` | boolean | Mặc định false |
| `alumni_verified_at` | timestamptz null | Khoa xác thực |
| `last_confirmed_at` | timestamptz null | Lần cuối người dùng xác nhận thông tin còn đúng |
| `email_notifications` | boolean | Mặc định true |

Bảng mới:
- `work_experiences`: `id`, `user_id` FK, `company_name`, `company_id` null, `title`, `industry`, `start_date`, `end_date` null (đang làm), `is_current`, `description`, `created_at`, `updated_at`. Ràng buộc: `end_date >= start_date`; chỉ cho một dòng `is_current` chính được đồng bộ vào `profiles.current_*` (service tự cập nhật).
- `profile_revisions`: `id`, `user_id`, `changed_by`, `changes jsonb` (`{ field: { from, to } }`), `source` (`self`, `staff`, `import`), `created_at`.
- Quan hệ Drizzle relations v2 cho các bảng mới; cập nhật seed.

### Task 3.2 — Xác thực cựu sinh viên (L08)
- Cựu SV đăng ký: `alumni_verified_at = null` → nhãn "Chờ xác thực"; chỉ khi đã xác thực mới: hiện trong danh bạ, đăng bài chia sẻ, nhận lời mời diễn giả, nhận lời kết nối.
- Khoa có trang `/faculty-admin/alumni-verification`: danh sách chờ, đối chiếu (MSSV, khóa, năm tốt nghiệp), nút Duyệt/Từ chối (lý do), ghi audit và thông báo. Tùy chọn nhập danh sách tốt nghiệp từ CSV để tự khớp theo `student_code`.
- MSSV duy nhất (Task 2.5). Cân nhắc yêu cầu xác minh email (`emailVerified`) trước khi gửi yêu cầu xác thực.

### Task 3.3 — Trang hồ sơ cá nhân (xem/sửa) và hoàn tất hồ sơ
- Routes: `/profile` (xem và sửa hồ sơ của mình, mọi vai trò đã đăng nhập), `/complete-profile` (khi thiếu hồ sơ, Task 1.2), `/alumni/[id]` (hồ sơ công khai theo `visibility`).
- Tab: Thông tin cơ bản, Nghề nghiệp (kèm `work_experiences` thêm/sửa/xóa), Quyền riêng tư, Lịch sử cập nhật (từ `profile_revisions`).
- Action `updateMyProfile` thay `updateCurrentUserProfile` (L09): dùng `requireRole` (cấm tài khoản bị khóa), zod; phân biệt `undefined` (giữ nguyên) và `null` (xóa); **khóa** `studentCode`, `batchYear`, `graduationYear` sau khi đã được Khoa xác thực (chỉ Khoa sửa qua `staffUpdateProfile`, ghi `profile_revisions.source = 'staff'`); mỗi lần sửa ghi `profile_revisions` trong cùng giao dịch.
- Ảnh đại diện dùng `file-uploader` (Task 2.4), purpose `avatar`.
- Giao diện: dùng `FieldGroup`/`Field`, hiển thị độ đầy đủ hồ sơ (%), nhắc "Xác nhận thông tin còn đúng" cập nhật `last_confirmed_at`.

### Task 3.4 — Nhắc cập nhật hồ sơ định kỳ
- Job BullMQ hằng tháng: tìm cựu SV có `last_confirmed_at` null hoặc quá 12 tháng, gửi thông báo + email "Cập nhật thông tin nghề nghiệp" (tối đa 1 lần/90 ngày/người). Trang Khoa có chỉ số "Hồ sơ lỗi thời". Liên kết thông báo trỏ đúng `/profile` (không trỏ trang không tồn tại như L25).

### Task 3.5 — Liên kết cựu SV với doanh nghiệp
- Khi nhập `current_company_name`, gợi ý (autocomplete) các `companies` đã `verified`; chọn thì gán `current_company_id`. Trang công ty (`/companies/[id]`, tạo mới, công khai) liệt kê "Cựu sinh viên đang công tác" theo `visibility` và `alumni_verified`. Dùng cho thống kê đối tác (Task 7).

---

## 5. Giai đoạn 4 — Nhóm 2: Kết nối cựu sinh viên

### Task 4.1 — Danh bạ và tìm kiếm
- Route `/alumni` (đã đăng nhập; vai trò student, alumni, faculty_staff, admin). Chỉ hiển thị hồ sơ: `status = active`, `alumni_verified_at IS NOT NULL`, và `visibility` cho phép (`public` cho mọi người đã đăng nhập; `members` cho người đã đăng nhập đủ điều kiện; `private` không hiển thị trừ Khoa).
- Bộ lọc: khóa (`batch_year`, nhiều lựa chọn), chuyên ngành, tỉnh/thành, lĩnh vực, tình trạng việc làm, kỹ năng, doanh nghiệp; tìm kiếm theo tên/công ty/chức danh (`pg_trgm` + `ILIKE`). Phân trang theo cursor (mặc định 20/trang). Sắp xếp: tên, khóa, hoạt động gần nhất.
- DTO: `{ userId, fullName, avatarUrl, batchYear, major, province, industry, currentTitle, currentCompanyName, skills }`. Email/SĐT chỉ có khi `show_email/show_phone` **và** hai bên đã kết nối (Task 4.2).
- Triển khai: route handler `GET /api/v1/alumni?...` (zod cho query) + trang client dùng TanStack Query với `keepPreviousData`/`placeholderData`; bộ lọc đồng bộ lên URL (`searchParams`).
- Quyền riêng tư: không lộ người `private` qua bất kỳ truy vấn nào; test bắt buộc.

### Task 4.2 — Lời mời kết nối
Bảng `alumni_connections`: `id`, `requester_id`, `receiver_id`, `status` enum (`pending`, `accepted`, `declined`, `blocked`, `cancelled`), `message` (≤ 300 ký tự), `created_at`, `responded_at`. Ràng buộc: `requester_id <> receiver_id`; unique theo **cặp không có thứ tự** (`LEAST/GREATEST` index) để không có hai dòng A→B và B→A.
- Actions/service: `sendConnectionRequest`, `respondConnectionRequest(accept|decline)`, `cancelConnectionRequest`, `removeConnection`, `blockUser`, `listMyConnections`, `listPendingRequests`.
- Quy tắc: chỉ người dùng đã xác thực gửi/nhận; không gửi cho người đã chặn mình; giới hạn 20 lời mời `pending` và 10 lời mời mới mỗi ngày; B gửi A khi A đã gửi B đang `pending` thì tự động chấp nhận; khi `declined` chỉ được gửi lại sau 30 ngày. Thông báo (in-app + email theo tùy chọn). Ghi audit.
- Giao diện: nút "Kết nối" (trạng thái theo quan hệ: Kết nối / Đã gửi / Chấp nhận / Đã kết nối), trang `/connections` (tab: Đã kết nối, Lời mời nhận, Lời mời đã gửi), dialog nhập lời nhắn.
- Khi `accepted`: hiện email/SĐT nếu bên kia bật `show_email/show_phone`.

### Task 4.3 — Ban liên lạc (khóa/khu vực/ngành)
Bảng `chapters`: `id`, `type` enum (`batch`, `region`, `major`), `name`, `batch_year` null, `province` null, `major` null, `description`, `contact_email`, `leader_user_id` null, `status`. Bảng `chapter_members`: `chapter_id`, `user_id`, `role` (`leader`, `member`), `joined_at`; unique (`chapter_id`, `user_id`).
- Khoa quản trị CRUD ban liên lạc; cựu SV đã xác thực xin tham gia hoặc được tự động gán theo `batch_year`/`province`; trang công khai `/chapters` thay cho `chapters-directory.tsx` dữ liệu cứng; sự kiện có thể gắn `chapter_id` (Task 6.5).

---

## 6. Giai đoạn 5 — Nhóm 3: Tuyển dụng, thực tập, mentoring, chia sẻ

### Task 5.1 (L26) — Lọc lĩnh vực đúng và tìm kiếm tuyển dụng
- `getPublicJobPosts`: đưa `industry` vào truy vấn (join `companies`, lọc `companies.industry_id`) **trước** `limit/offset`; trả `total` để phân trang; thêm lọc `jobType`, `location`, `salary` (nếu có), sắp xếp mới nhất/sắp hết hạn. Escape ký tự đặc biệt `%`, `_` của `ILIKE`.

### Task 5.2 — Vòng đời tin tuyển dụng
- Thêm action và giao diện cho nhà tuyển dụng: sửa tin (tin `approved` bị sửa → quay về `pending` nếu đổi nội dung chính), đóng sớm (`closed`), gia hạn (≤ 180 ngày tổng), gửi lại sau khi bị từ chối (sửa rồi `rejected → pending`), nhân bản tin. Nhà tuyển dụng thấy lý do từ chối.
- Thêm trạng thái `closed` vào enum `job_status` (migration).

### Task 5.3 — Thực tập thành đợt riêng
- Với `job_type = internship` thêm trường: `duration_months`, `slots`, `is_paid`, `start_date`, `school_year_target`. Hiển thị bộ lọc "Thực tập" riêng, huy hiệu "Có lương".

### Task 5.4 — Theo dõi ứng tuyển
Bảng `job_applications`: `id`, `job_id`, `applicant_id`, `status` enum (`submitted`, `viewed`, `shortlisted`, `rejected`, `hired`, `withdrawn`), `cover_letter` (≤ 2000), `cv_file_id` null FK `uploaded_files`, `created_at`, `updated_at`; unique (`job_id`, `applicant_id`).
- Sinh viên/cựu SV nộp (nếu tin cho phép ứng tuyển trong hệ thống; nếu chỉ có `applyUrlOrEmail` thì đếm lượt nhấp qua endpoint chuyển hướng `/jobs/[id]/apply` ghi `job_clicks`). Nhà tuyển dụng quản lý ứng viên của công ty mình; ứng viên xem trạng thái hồ sơ của mình. CV là tệp riêng tư (Task 2.4). Thông báo khi đổi trạng thái. Nhà tuyển dụng chỉ xem CV của người ứng tuyển vào tin của mình.

### Task 5.5 — Mentoring
Bảng:
- `mentor_profiles`: `user_id` PK/FK (cựu SV đã xác thực), `headline`, `fields text[]` (lĩnh vực hướng dẫn), `languages`, `max_mentees` (1–10), `availability` (text hoặc jsonb khung giờ), `format` (`online`, `offline`, `both`), `status` (`pending`, `active`, `paused`), `created_at`.
- `mentoring_requests`: `id`, `mentee_id`, `mentor_id`, `goal` (≤ 1000), `topic`, `status` (`pending`, `accepted`, `declined`, `cancelled`, `completed`), `decline_reason` null, `created_at`, `responded_at`, `completed_at`.
- `mentoring_sessions` (tùy chọn): `request_id`, `scheduled_at`, `duration_minutes`, `link_or_place`, `note`, `status`, `mentee_rating` (1–5), `mentee_feedback`.
Quy tắc: chỉ cựu SV đã xác thực đăng ký làm mentor, Khoa duyệt hồ sơ mentor (hoặc tự động nếu cấu hình); sinh viên/cựu SV gửi yêu cầu (tối đa 3 yêu cầu `pending` cùng lúc, không gửi trùng mentor đang `pending/accepted`); mentor không nhận vượt `max_mentees` đang `accepted`; chỉ mentor phản hồi; chỉ hai bên thấy yêu cầu; thông báo + audit.
Giao diện: `/mentoring` (danh sách mentor, lọc theo lĩnh vực/khóa), `/mentoring/become-mentor`, `/mentoring/my` (yêu cầu của tôi, yêu cầu nhận), trang Khoa duyệt mentor và thống kê (số mentor, số cặp, hoàn thành, điểm trung bình).

### Task 5.6 (L24, L25) — Bài chia sẻ kinh nghiệm
- Lọc theo thẻ hoạt động thật (join bảng thẻ hoặc `tags text[]` với toán tử chứa); tìm theo tiêu đề + nội dung.
- Tác giả sửa bài (bài `published` sửa lớn → `pending`), lưu nháp (`draft` dùng thật), gửi duyệt, thấy lý do từ chối (cột `rejected_reason`).
- Tạo trang `/student/experiences` (hoặc `/my/experiences`) liệt kê bài của mình; sửa mọi liên kết trong thông báo trỏ tới trang này; rà soát toàn dự án mọi `linkUrl` thông báo trỏ tới route tồn tại (thêm test đơn giản liệt kê `linkUrl` so với danh sách route).
- Lượt xem: chỉ tăng một lần mỗi phiên/người (cookie hoặc bảng `post_views` có `unique(post_id, viewer_key)` theo ngày), bỏ qua bot (User-Agent). Không tăng khi tác giả xem.

---

## 7. Giai đoạn 6 — Nhóm 4: Sự kiện, họp mặt, đăng ký trực tuyến

### Task 6.1 (L11) — Đăng ký sự kiện an toàn
- Service `registerForEvent(actor, eventId)` trong một giao dịch: khóa dòng sự kiện (`SELECT ... FOR UPDATE`) hoặc dùng chèn có điều kiện đếm; kiểm tra `status = published`, `now < endTime`, hạn đăng ký (`registration_deadline` nếu thêm), vai trò `student|alumni` (cựu SV phải đã xác thực), tài khoản `active`; vượt `capacity` → thêm vào **danh sách chờ** (`waitlisted`) nếu bật, ngược lại `CONFLICT`.
- Enum `attendance_status` thêm `waitlisted`, `cancelled`. Action `cancelRegistration` (trước giờ bắt đầu); khi có người hủy, tự chuyển người đầu danh sách chờ lên `registered` và thông báo.
- Nghiệm thu: test 20 đăng ký đồng thời cho sự kiện capacity 10 → đúng 10 `registered`.

### Task 6.2 — Sửa, hủy, kết thúc sự kiện
- Actions (chỉ `faculty_staff|admin`): `updateEvent` (sửa thông tin; đổi thời gian/địa điểm sau khi đã có đăng ký → thông báo cho người đăng ký), `publishEvent`, `cancelEvent` (lý do bắt buộc, thông báo hàng loạt qua hàng đợi, đổi đăng ký sang `cancelled`), `completeEvent` (sau `endTime`). Enum trạng thái `draft|published|cancelled|completed` đã có: dùng bảng chuyển trạng thái (Task 1.7). Audit mọi thao tác.
- Trang Khoa `/faculty-admin/events/[id]`: tab Thông tin, Đăng ký (xuất CSV), Diễn giả, Điểm danh, Phản hồi, Album.

### Task 6.3 — Điểm danh và check-in
- `markAttendance`: kiểm tra đăng ký thuộc sự kiện của người gọi có quyền, ghi audit, chỉ trong khoảng từ `startTime - 1h` đến `endTime + 24h`. Thêm mã QR check-in (token ký ngắn hạn theo sự kiện) cho người tham dự tự check-in; tùy chọn.

### Task 6.4 (L19) — Diễn giả
- `inviteSpeaker`: kiểm tra sự kiện tồn tại và chưa kết thúc, người được mời là `alumni` đã xác thực, chưa được mời (trả `CONFLICT` thân thiện); thông báo đúng tên sự kiện. `respondSpeakerInvitation`: chỉ khi `pending` (hoặc cho đổi ý trước `startTime - 48h`), thông báo ngược cho người mời, ghi audit. Liên kết thông báo trỏ trang có thật.

### Task 6.5 — Loại "họp mặt" và gắn Ban liên lạc
- Thêm giá trị `reunion` (họp mặt) và `homecoming` vào enum `event_type`; thêm `chapter_id` null FK vào `events`; bộ lọc theo loại/ban liên lạc/thời gian (sắp tới, đã qua). Thêm `registration_deadline`, `waitlist_enabled` vào `events`.

### Task 6.6 — Phản hồi sau sự kiện
- Thêm `event_id` null FK vào `forms` (loại `event_feedback`). Khi `completeEvent`, tự tạo form phản hồi mẫu (đánh giá chung 1–5, nội dung, góp ý) và gửi thông báo cho người `attended`. Trang Khoa xem kết quả theo sự kiện, điểm trung bình hiển thị ở chi tiết sự kiện.

### Task 6.7 — Nhắc lịch
- Job BullMQ gửi thông báo 24 giờ và 1 giờ trước sự kiện cho người `registered` (không gửi trùng; đánh dấu `reminded_24h_at`, `reminded_1h_at` trên `event_registrations`). Link họp online chỉ hiện từ 1 giờ trước (hoặc sau đăng ký, tùy cấu hình) cho người đã đăng ký.

---

## 8. Giai đoạn 7 — Nhóm 5: Thống kê và Dashboard

### Task 7.1 (L28) — Danh mục lĩnh vực chuẩn hóa
- Bảng `industries` (`id`, `slug`, `name`, `sort_order`, `is_active`); `companies.industry` và `profiles.industry` đổi sang `industry_id` (migration chuyển dữ liệu: ánh xạ chuỗi cũ về danh mục, những chuỗi không ánh xạ được vào "Khác" và ghi báo cáo). Form công ty, hồ sơ, tin tuyển dụng dùng `Select` danh mục. Seed ~15 lĩnh vực (CNTT, Giáo dục, Y tế, Tài chính, Du lịch - Khách sạn, Nông nghiệp công nghệ cao, ...).

### Task 7.2 — Tỷ lệ việc làm
- Công thức: trong cựu SV đã xác thực và có `employment_status`, tỷ lệ có việc = `(employed + self_employed) / (tổng có trả lời)`; hiển thị cả **tỷ lệ phản hồi** = `có employment_status / tổng cựu SV đã xác thực` để người xem hiểu độ tin cậy. Phân tầng theo khóa (`batch_year`), chuyên ngành, năm tốt nghiệp (ví dụ việc làm trong 6/12 tháng sau tốt nghiệp nếu có `first_job_date`; nếu không có dữ liệu, bỏ chỉ số này, không bịa).
- Hàm `getEmploymentStats()` viết bằng SQL aggregate trong DAL (không kéo hết hàng lên JS). Đổi tên biến `batchAlumniStats` đang gây hiểu lầm.

### Task 7.3 — Phân bố nghề nghiệp
- Theo `industry_id`, theo `current_title` (nhóm theo bảng chuẩn hóa vị trí nếu có, hoặc top N), theo `province`, theo loại hình (doanh nghiệp/tự do/học tiếp). Biểu đồ cột/tròn bằng `recharts`; mỗi biểu đồ có bảng số liệu và nút xuất CSV.

### Task 7.4 — Doanh nghiệp đối tác
- Số doanh nghiệp `verified`, số tin đã đăng/đã duyệt theo tháng, số ứng tuyển và tuyển được (từ `job_applications`), số cựu SV làm việc tại từng doanh nghiệp (Task 3.5), top doanh nghiệp theo số cựu SV và theo số tin. Chỉ tính tin `approved|expired|closed`, bỏ `pending|rejected` (L28).

### Task 7.5 (L27) — Mức độ tham gia
- Tỷ lệ tham dự = `attended / registered` **chỉ trên sự kiện `completed`** (bỏ `waitlisted`, `cancelled`). Thêm: số cựu SV hoạt động trong 12 tháng (có đăng nhập/đăng ký sự kiện/đăng bài/ứng tuyển/phản hồi khảo sát/cam kết tài trợ/kết nối) — định nghĩa "hoạt động" ghi trong tài liệu và dùng bảng `user_activity` hoặc suy ra từ các bảng; tỷ lệ phản hồi khảo sát; số kết nối, số cặp mentoring; đóng góp quỹ (đã nhận, đang cam kết). Bảng xếp hạng top hoạt động chỉ hiển thị cho Khoa.
- Bộ lọc thời gian (năm học, quý), so sánh kỳ trước.

### Task 7.6 — Hiệu năng và quyền
- Tất cả thống kê chỉ cho `faculty_staff|admin`; truy vấn aggregate có chỉ mục; cache `unstable_cache`/`use cache` với thời hạn ngắn (5 phút) và `revalidateTag` khi dữ liệu liên quan thay đổi. Dashboard có skeleton, empty state, và xử lý lỗi (Task 2.3). Dữ liệu cá nhân **không** xuất hiện trong bảng thống kê (chỉ số gộp; nhóm có < 5 người ghi "Dưới 5" để tránh lộ danh tính).
- Trang công khai `/about/stats` (tùy chọn) chỉ hiển thị số liệu tổng đã ẩn danh.

---

## 9. Giai đoạn 8 — Thư viện ảnh

**Yêu cầu tiên quyết:** Task 2.4 (tải tệp), 2.9 (ảnh), 3.2 (xác thực cựu SV), 6.2 (vòng đời sự kiện).

### Task 8.1 — Schema
- `event_albums`: `id`, `event_id` null FK (null nếu album chung), `chapter_id` null FK, `title`, `description`, `cover_photo_id` null, `status` (`draft`, `published`, `archived`), `created_by`, `created_at`, `published_at`.
- `album_photos`: `id`, `album_id` FK, `uploaded_file_id` FK `uploaded_files`, `caption` (≤ 200), `taken_at` null, `uploaded_by`, `status` (`pending`, `published`, `removed`), `removed_reason` null, `sort_order`, `created_at`. Index (`album_id`, `status`, `sort_order`).
- `photo_takedown_requests`: `id`, `photo_id`, `requester_id` null, `requester_contact`, `reason`, `status` (`open`, `accepted`, `rejected`), `handled_by`, `created_at`, `handled_at`.
- `uploaded_files.related_type = 'album_photo'`.

### Task 8.2 — Tải lên và kiểm duyệt
- Nhân sự Khoa/ban tổ chức tạo album, tải nhiều ảnh (tối đa 30 ảnh mỗi lần, mỗi ảnh ≤ 5 MB, JPEG/PNG/WebP); ảnh của Khoa vào `published` ngay nếu album `published`. Người **đã đăng ký tham dự** (`attended` hoặc `registered`, sự kiện đã `completed`) đề xuất ảnh vào album sự kiện → `pending`; Khoa duyệt hàng loạt (chọn nhiều ảnh).
- Xử lý ảnh phía máy chủ khi `confirm`: kiểm tra thật sự là ảnh (đọc header, dùng `sharp`), xóa EXIF (đặc biệt định vị GPS), tạo bản `thumb` (400px) và `display` (1600px) WebP, lưu khóa các bản vào `uploaded_files.variants jsonb`. Giới hạn tỉ lệ tải: 100 ảnh/ngày/người.
- Quy tắc xóa: người đăng xóa ảnh của mình khi còn `pending`; Khoa gỡ (`removed`) kèm lý do; ảnh `removed` bị xóa khỏi lưu trữ sau 30 ngày bằng job.

### Task 8.3 — Giao diện
- Công khai: `/gallery` (lưới album: bìa, tên, số ảnh, ngày; lọc theo năm/loại sự kiện/ban liên lạc), `/gallery/[albumId]` (lưới ảnh, lightbox có phím mũi tên, tải tiếp bằng cuộn vô hạn hoặc phân trang), tăng dần `loading="lazy"` và `sizes`. Trang sự kiện hiển thị album liên quan. Trang chủ có dải ảnh lấy từ album `published` mới nhất (thay `media-gallery.tsx` dữ liệu cứng).
- Khoa: `/faculty-admin/gallery` (quản lý album, hàng đợi duyệt ảnh, yêu cầu gỡ ảnh).
- Mỗi ảnh có nút "Yêu cầu gỡ ảnh" (biểu mẫu ngắn, cho cả người không đăng nhập qua email) → `photo_takedown_requests`; Khoa xử lý trong 72 giờ (hiển thị bộ đếm), ảnh bị khiếu nại tạm ẩn khi có yêu cầu `open` (cấu hình).
- Truy cập: ảnh album `published` công khai; ảnh `pending/removed` chỉ người đăng và Khoa. Không gắn thẻ/nhận diện khuôn mặt. Không cho tải ảnh gốc độ phân giải cao nếu cấu hình `allow_original_download = false`.
- Tuân thủ giao diện: dùng palette và hiệu ứng theo `DESIGN.md` (hiệu ứng xuất hiện nhẹ bằng `motion`, tôn trọng `prefers-reduced-motion`).

### Task 8.4 — Chấp thuận hình ảnh
- Khi sự kiện có chụp ảnh, trang đăng ký hiển thị thông báo "Ban tổ chức có thể chụp và đăng ảnh sự kiện"; hồ sơ có cờ `photo_opt_out` (người dùng không muốn xuất hiện: Khoa kiểm tra thủ công khi đăng; ghi hướng dẫn trong `docs/GALLERY_POLICY.md`). Văn bản chính sách cần Khoa/pháp chế xác nhận.

---

## 10. Giai đoạn 9 — Dọn dẹp và còn lại

### Task 9.1 (L21) — Doanh nghiệp
- `registerCompany`: chỉ vai trò `employer` (hoặc nâng vai trò người dùng thành `employer` khi tạo công ty qua luồng onboarding rõ ràng; chọn và ghi trong PR). `tax_code` bắt buộc, duy nhất; cảnh báo trùng tên. `switchActiveCompany`: một giao dịch, chỉ mục duy nhất một phần (Task 2.5). Luồng mời đồng nghiệp: `company_invitations` (`company_id`, `email`, `role`, `token`, `expires_at`, `accepted_at`), email mời, chấp nhận khi đăng nhập đúng email. Chỉ chủ/admin công ty mời và gỡ thành viên; không gỡ admin cuối cùng.

### Task 9.2 (L23) — Quản trị người dùng
- `adminToggleUserLock`, `adminUpdateUserRole`: không tự khóa/hạ quyền chính mình; bảo đảm còn ≥ 1 admin `active`; kiểm tra người dùng tồn tại (không có dòng → `NOT_FOUND`, không ghi audit giả); khóa tài khoản thì **thu hồi toàn bộ phiên** (`DELETE FROM session WHERE user_id = ?`); ghi audit trong cùng giao dịch. Thêm trang quản lý phân trang, tìm kiếm, lọc theo vai trò/trạng thái.

### Task 9.3 (L10) — Form và khảo sát
- `submitFormResponse` → service trong giao dịch: kiểm tra đối tượng (vai trò, khóa theo `targetBatches`) bằng **cùng một hàm** `isFormEligible(user, form)` dùng cho cả liệt kê; kiểm tra đủ câu bắt buộc, `questionId` thuộc form, giá trị thuộc `options`, thang điểm trong `min..max`, độ dài văn bản; tài khoản `active`; chống gửi trùng (Task 2.5).
- (L31) Khi form nhắm theo khóa mà hồ sơ chưa có `batchYear`: hiển thị nhắc cập nhật hồ sơ thay vì ẩn form im lặng; form đăng ký cựu SV bắt buộc `batchYear` hoặc `graduationYear`.

### Task 9.4 — Dọn component và dữ liệu cứng (L32, L33)
- Xóa hoặc nối dữ liệu thật cho: `bento-showcase`, `media-gallery` (thay bằng Task 8.3), `chapters-directory` (Task 4.3), `alumni-survey`, `partner-logos` (từ `companies` đã `verified` có logo), `newsletter-box`, `news-feed-section`, `homecoming-banner`, và `academic-news-portal.tsx`, `scholarship-tracker.tsx` (bỏ `365000000/500000000`; lấy từ `scholarship_campaigns`). Số liệu trên trang chủ (số cựu SV, số doanh nghiệp, ...) lấy từ `COUNT` thật qua DAL, cache 10 phút. Nội dung chưa có hiển thị empty state hoặc ẩn khối, không dùng ảnh Unsplash dựng sẵn.
- Dùng công cụ như `knip` (hoặc `ts-prune`) để liệt kê tệp không dùng; xóa sau khi xác nhận.

### Task 9.5 — Newsletter và liên hệ
- `cta-newsletter.tsx`, `contact-section.tsx` (bản mới): kiểm tra biểu mẫu có thực sự gửi đi đâu không. Nếu chưa, hoặc nối vào bảng `newsletter_subscribers`/`contact_messages` (có zod, chống spam bằng honeypot + giới hạn tốc độ, trang Khoa xem), hoặc ẩn khối. Không để nút giả.

### Task 9.6 — Kiểm thử và CI
- Thiết lập Vitest (đơn vị/service) và Playwright (đường đi chính). Bộ test tối thiểu: (1) không thể đăng ký `admin`; (2) demo-login 404 ở production; (3) xác nhận nhận tiền song song; (4) đăng ký sự kiện song song; (5) nộp học bổng trùng; (6) DTO công khai không chứa trường nhạy cảm (so khớp danh sách khóa cho phép); (7) quyền danh bạ theo `visibility`; (8) chuyển trạng thái không hợp lệ bị chặn; (9) bài chưa duyệt trả 404; (10) kết nối: cặp trùng, tự kết nối, giới hạn. Dùng CSDL Postgres thử nghiệm (container) và `drizzle-kit migrate` trước test.
- CI (GitHub Actions): `lint`, `tsc`, `test`, `build`.

---

## 11. Phụ lục — Ma trận quyền (tham chiếu khi viết `requireRole`)

| Thao tác | student | alumni (đã xác thực) | employer | faculty_staff | admin |
| :--- | :-: | :-: | :-: | :-: | :-: |
| Xem tin, sự kiện, học bổng, bài chia sẻ công khai (DTO) | x | x | x | x | x |
| Đăng ký sự kiện | x | x | | x | x |
| Nộp hồ sơ học bổng | x | | | | |
| Cam kết tài trợ (tự) | x | x | x | x | x |
| Ghi nhận tài trợ hộ | | | | x | x |
| Xác nhận nhận tiền / hủy cam kết | | | | x | x |
| Đăng bài chia sẻ | | x | | x | x |
| Đăng tin tuyển dụng | | | x (công ty đã xác minh) | | x |
| Duyệt tin, công ty, bài, hồ sơ học bổng | | | | x | x |
| Tạo sự kiện, album, form, chiến dịch | | | | x | x |
| Danh bạ cựu SV, gửi kết nối | x | x | | x | x |
| Đăng ký làm mentor | | x | | | |
| Gửi yêu cầu mentoring | x | x | | | |
| Xem dashboard, audit log | | | | dashboard | cả hai |
| Đổi vai trò, khóa tài khoản | | | | | x |

`admin` bỏ qua kiểm tra vai trò nhưng **không** bỏ qua ràng buộc dữ liệu và chuyển trạng thái.

---

## 12. Thứ tự thực hiện và phụ thuộc

| Giai đoạn | Task | Phụ thuộc |
| :--- | :--- | :--- |
| 0 | 0.1, 0.2, 0.3, 0.4, 0.5 | — |
| 1 | 1.1 → 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10 | 0.2; 1.5 cần 2.5 (ràng buộc duy nhất) và 9.3 (hàm kiểm tra form dùng chung) — làm ràng buộc trước |
| 2 | 2.1 → 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9 | 1.x (có thể làm xen kẽ; 2.1 nên làm sớm vì các task sau dùng `Result`) |
| 3 | 3.1 → 3.2, 3.3, 3.4, 3.5 | 2.1, 2.4, 2.5 |
| 4 | 4.1, 4.2, 4.3 | 3.x |
| 5 | 5.1 → 5.6 | 2.4 (CV), 3.2 (mentor), 7.1 (danh mục lĩnh vực — làm 7.1 trước 5.1) |
| 6 | 6.1 → 6.7 | 1.7, 4.3 (cho 6.5) |
| 7 | 7.1 → 7.6 | 3.1, 5.4, 6.2 |
| 8 | 8.1 → 8.4 | 2.4, 2.9, 3.2, 6.2 |
| 9 | 9.1 → 9.6 | 9.6 nên bắt đầu sớm song song từ Giai đoạn 1 |

Thứ tự thực tế được khuyến nghị: 0 → 1 (cùng 2.5, 2.1) → 2 còn lại → 7.1 → 3 → 4 → 5 → 6 → 7 còn lại → 8 → 9.

---

## 13. Tiêu chí hoàn thành toàn bộ

- Không còn mã L01–L35 và N01–N12 trong `docs/LOGIC_REVIEW_V2.md` ở trạng thái "còn" (mỗi mục sửa hoặc có ghi chú lý do bỏ).
- Năm nhóm chức năng của yêu cầu ban đầu có dữ liệu, action, trang và quyền hoàn chỉnh; Thư viện ảnh hoạt động theo Giai đoạn 8.
- `lint`, `tsc`, `build`, `test` đều xanh; không còn cảnh báo kiểu `any` mới.
- Không có dữ liệu mẫu chạy trong production; không có endpoint đăng nhập không mật khẩu.
- Mọi trang công khai chỉ nhận DTO; kiểm tra nguồn trang không thấy trường nhạy cảm.
- Có `README` cập nhật: biến môi trường, cách chạy CSDL, migration, seed, worker, test.

---

## 14. Điều agent không được tự quyết (hỏi lại người phụ trách)

- Nội dung chính sách riêng tư, điều khoản, chính sách hình ảnh (pháp lý, ví dụ Nghị định 13/2023/NĐ-CP): chỉ dựng chỗ đặt và văn bản tạm có đánh dấu "CẦN PHÊ DUYỆT".
- Danh mục lĩnh vực, chuyên ngành, tỉnh/thành chính thức; định nghĩa "cựu SV hoạt động".
- Chọn nhà cung cấp email/lưu trữ thật; thông tin tài khoản và khóa.
- Nguồn danh sách tốt nghiệp để xác thực cựu SV.
- Việc xóa dữ liệu cũ khi migration không ánh xạ được: dừng và báo cáo, không tự xóa.

---
