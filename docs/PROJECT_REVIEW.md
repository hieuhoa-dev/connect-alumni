# Rà soát và đề xuất hoàn thiện DLU Alumni

Ngày rà soát: **13/10/2026**. Phạm vi sản phẩm: dự án riêng kết nối sinh viên, cựu sinh viên **toàn Trường Đại học Đà Lạt**, cùng doanh nghiệp và nhà tài trợ.

Đợt kiểm tra bổ sung theo Sinh viên, Alumni, Doanh nghiệp, Vận hành và Admin được ghi tại [ROLE_AUDIT.md](./ROLE_AUDIT.md), gồm kiểm thử trên PostgreSQL riêng và đăng nhập thật bằng trình duyệt, lỗi đã sửa và đề mục nội dung cần cập nhật.

## Đã điều chỉnh

- Nhận diện dùng logo Đại học Đà Lạt; tên, mô tả, trang chủ, footer, sidebar, các nhãn quản trị và nội dung hệ thống không giới hạn vào Khoa CNTT.
- Footer có thông tin liên hệ chính thức của Trường: địa chỉ, điện thoại và email. Nguồn nằm trong [DLU_REFERENCE.md](./DLU_REFERENCE.md); biểu mẫu hỗ trợ dự án vẫn là mục riêng.
- Giới thiệu Trường, môi trường đào tạo đa ngành và lịch sử 1957/1958/1976 ngay tại `/about`; nguồn trong [DLU_REFERENCE.md](./DLU_REFERENCE.md). Các liên kết khám phá nằm trong dự án. Bấm logo tải lại trang chủ.
- Đăng ký/hồ sơ có trường khoa/ngành cho sinh viên và cựu sinh viên. Không tự gán “Công nghệ Thông tin”; năm nhập học hỗ trợ các thế hệ trước năm 1990. Vai trò nhân sự được quản trị viên cấp, không tự đăng ký.
- Trang chủ, Tin tức và Góc chia sẻ tự tìm sau khoảng 350 ms khi nhập; Enter tìm ngay. Trang chủ tìm cùng lúc trong bản tin và bài chia sẻ đã công bố, hiển thị tối đa 30 bài; xóa từ khóa khôi phục trang chủ đầy đủ. Giao diện chỉ có một nút xóa, hiển thị “Kết quả cho…” ngay dưới ô tìm kiếm khi có từ khóa và ẩn khi xóa; bỏ mô tả giới hạn kết quả thừa. Thông báo cập nhật vẫn hỗ trợ trình đọc màn hình. Có trạng thái đang tìm, xử lý gõ tiếng Việt và giữ focus trong ô nhập. Khi một nguồn chưa sẵn sàng, vẫn hiển thị bài từ nguồn còn lại kèm thông báo kết quả chưa đầy đủ.
- Tìm từ một chữ cái hoặc phần đầu từ trong tiêu đề, tóm tắt và văn bản nội dung; bài chia sẻ tìm thêm chủ đề. Ví dụ “b” khớp “Bí…”, “bổng…”; “học b” khớp “học bổng”. Yêu cầu đủ các phần từ đã nhập, không phân biệt hoa/thường, giữ dấu tiếng Việt và không khớp đoạn giữa từ khác hoặc URL/thuộc tính HTML. Bộ lọc chỉ trả nội dung đã công bố; ký tự `%`, `_`, `+` trong từ khóa được xử lý như ký tự thường. Tìm kiếm và số đếm của Tin tức dùng chung điều kiện; bộ lọc chủ đề của Góc chia sẻ được giữ khi tìm.
- Banner tự chạy mỗi 5 giây; tài khoản mẫu trên trang đăng nhập chỉ hiển thị trong môi trường development.
- Đăng ký doanh nghiệp không tự gán ngành CNTT hoặc chức danh nhân sự; ví dụ tuyển dụng/chia sẻ dùng được cho nhiều ngành. Nội dung chiến dịch học bổng nói rõ sinh viên toàn trường đáp ứng điều kiện chiến dịch.
- Sửa thông báo duyệt bài để mở đúng trang chi tiết thay vì route chưa có; tóm tắt bài chia sẻ bỏ thẻ HTML. Bài chưa công bố hiển thị trạng thái và ngày gửi đúng, vẫn áp dụng quyền xem của tác giả/quản trị.
- Script dữ liệu mẫu có 21 người dùng, 7 doanh nghiệp, 10 tin việc làm, 6 sự kiện và 7 bài chia sẻ; bổ sung du lịch, ngoại ngữ, kinh doanh, sinh học. Seed được kiểm tra trên database riêng tại máy; không chạy seed hoặc tự sửa hồ sơ/bài viết trong database triển khai. Các email tài khoản mẫu cũ được giữ để tương thích đăng nhập.
- Đồng bộ đặc tả/README với phạm vi mới; sửa định dạng và imports qua Biome. Cấu hình lint bỏ thư mục kỹ năng/cấu hình agent khỏi phạm vi mã sản phẩm.

## Phạm vi kiểm tra và kết quả

Rà soát các nhóm mã nguồn: trang công khai, xác thực/hồ sơ, phân quyền, doanh nghiệp/tuyển dụng, sự kiện/diễn giả, chia sẻ kinh nghiệm, khảo sát, học bổng, liên hệ, thông báo, quản trị/audit, cấu hình dữ liệu và tác vụ nền.

| Kiểm tra | Kết quả |
| --- | --- |
| TypeScript | Đạt |
| Hồi quy tự động | 120/120 kiểm thử đạt: xác thực/phân quyền, giới hạn đăng ký sự kiện, biểu mẫu, học bổng, liên hệ, thông báo, bảng dữ liệu, SSR, tìm kiếm và kiểm tra theo vai trò; 29/29 trường hợp Unicode/phần đầu từ/HTML/ký tự đặc biệt được xác minh bằng SELECT trong PostgreSQL |
| Biome toàn dự án | Không có lỗi chặn; còn các cảnh báo sẵn có, chủ yếu về `any`, ảnh HTML và mã thừa |
| Trình duyệt desktop/mobile | Trang chủ tự tìm từ một chữ “b”; nhập tiếp “bí” trả bài “Bí kíp…” có sẵn. Nhãn “Kết quả cho…” hiển thị một lần ngay dưới ô nhập, giữ focus, chỉ một nút xóa và không còn mô tả kết quả thừa; xóa từ khóa kể cả khi đang điều hướng khôi phục trang gốc và ẩn nhãn. Các trang công khai trên màn hình 390 px không tràn ngang, điều hướng nội bộ; đăng ký không tự gán khoa/ngành. Không phát sinh lỗi JavaScript trong các thao tác đã kiểm tra |
| Điều hướng công khai | Trang chủ, Tin tức, Sự kiện, Góc chia sẻ, Việc làm, Quỹ khuyến học, Giới thiệu, Liên hệ, Bảo mật, Điều khoản giữ người dùng trong dự án |
| Production build | Đạt: Next.js biên dịch thành công, kiểm tra kiểu dữ liệu và tạo toàn bộ route |

Kiểm thử hồi quy dùng dữ liệu trong bộ nhớ; đợt bổ sung có **26 nhóm kiểm thử tích hợp đạt trên PostgreSQL/Drizzle thật tại database riêng**, cùng kiểm tra trình duyệt với đăng nhập thật theo vai trò (chi tiết tại [ROLE_AUDIT.md](./ROLE_AUDIT.md)). Chưa xác minh gửi email thật, upload lên S3 hoặc toàn bộ thao tác ghi dữ liệu bằng từng tài khoản trên hệ thống triển khai. Kiểm tra database chỉ đọc phát hiện **thiếu bảng `news_articles` và `contact_messages`** trong database đang kết nối bên ngoài máy. Vì vậy truy vấn Tin tức và việc lưu liên hệ chưa vận hành đầy đủ ở môi trường này; danh sách rỗng trước đây không phải bằng chứng bản tin chưa có nội dung. Migration tạo hai bảng đã có trong repository. Chưa áp dụng migration hay seed lên database bên ngoài trong đợt rà soát này.

Migration tương ứng: [Tin tức](../drizzle/20261010110452_military_baron_strucker/migration.sql) và [Liên hệ](../drizzle/20261010111141_lethal_malice/migration.sql). Khi chuẩn bị triển khai, đối chiếu lịch sử migration trước khi dùng `npm run db:migrate`; không chạy lại toàn bộ SQL theo cách bỏ qua mọi lỗi “đã tồn tại”.

## Những phần cần hoàn thiện trước khi dùng thực tế

| Ưu tiên | Phát hiện trong mã nguồn | Việc cần làm |
| --- | --- | --- |
| P0 | Database đang kết nối thiếu `news_articles`, `contact_messages`; migration đã có trong `drizzle/` | Đối chiếu schema và lịch sử migration, áp dụng đúng migration vào môi trường triển khai rồi kiểm tra đăng/duyệt/tìm tin và gửi/đọc liên hệ bằng dữ liệu kiểm thử |
| P0 | Worker email chỉ ghi log mô phỏng (`src/workers/notification.worker.ts`) | Kết nối dịch vụ email, kiểm tra gửi thật, theo dõi thất bại và cho phép gửi lại |
| P0 | Trường upload của biểu mẫu đang nhận URL; module S3 chưa được nối vào luồng nộp tệp | Làm upload có kiểm tra loại/dung lượng, lưu object key và cấp URL tạm theo quyền; không trả URL công khai khi cấp URL tạm thất bại |
| P0 | Có đổi mật khẩu trong hồ sơ nhưng chưa có luồng quên mật khẩu/khôi phục qua email | Thêm khôi phục mật khẩu, xác minh email và xử lý tài khoản chưa xác minh |
| P1 | Khoa/ngành hiện nhập tự do; dữ liệu mẫu và hồ sơ cũ từng tập trung CNTT | Chuẩn hóa danh mục khoa/ngành từ nguồn Trường, bổ sung ngành học riêng nếu cần; cho người dùng rà soát hồ sơ cũ, không tự suy đoán khoa/ngành |
| P1 | Nền tảng có nội dung/sự kiện/việc làm nhưng chưa có danh bạ và luồng kết nối trực tiếp sinh viên–cựu sinh viên | Ưu tiên danh bạ có kiểm soát quyền riêng tư và yêu cầu kết nối/cố vấn |
| P1 | Tìm kiếm hiện theo phần đầu từ từ một chữ cái, có phân biệt dấu tiếng Việt; chuyên mục khác còn cơ chế lọc riêng | Cân nhắc tìm không dấu có xếp hạng để hạn chế kết quả không liên quan, lọc khoa/ngành/khóa/chủ đề và phân trang; đồng bộ trải nghiệm tìm kiếm ở Việc làm/Sự kiện |
| P1 | Chưa có trang quản lý bài của tác giả; `getMyExperiencePosts` đã có nhưng chưa được dùng | Thêm “Bài chia sẻ của tôi”, trạng thái chờ duyệt/đã đăng/từ chối, lý do duyệt và sửa/gửi lại; sau khi gửi dẫn tới danh sách riêng |
| P2 | Một số trang vẫn dùng typography, icon, ảnh, trạng thái trống khác nhau; còn cảnh báo lint | Chuẩn hóa theo giao diện hiện có, tối ưu ảnh, bổ sung loading/empty/error thống nhất và giảm `any` |
| P2 | Chưa có sitemap/robots và nội dung SEO riêng cho một số trang công khai | Bổ sung metadata, ảnh chia sẻ và sitemap cho nội dung đã công bố; không đưa trang riêng tư vào sitemap |
| P2 | Chưa thấy cấu hình CI trong repository | Tự động chạy lint, typecheck, test, build; bổ sung kiểm tra vận hành, sao lưu và khôi phục database trước khi triển khai |
| P2 | Chưa có FAQ/tài nguyên cộng đồng, trang loading và 404 riêng | Thêm hướng dẫn theo vai trò, liên kết tới thao tác có thật, trạng thái tải/không tìm thấy thống nhất; điều hướng bằng bàn phím và hỗ trợ giảm chuyển động |

Các mục trên là đề xuất dựa trên mã nguồn và kiểm tra hiện có, không phải các tính năng đã được triển khai trong đợt sửa này.

## Tính năng nên phát triển tiếp theo

1. **Danh bạ cộng đồng:** lọc theo khoa/ngành, khóa, nghề nghiệp và địa phương; hồ sơ có kỹ năng, nhu cầu chia sẻ. Chỉ công khai thông tin người dùng cho phép, gửi yêu cầu kết nối thay vì hiển thị email/số điện thoại.
2. **Cố vấn nghề nghiệp:** cựu sinh viên đăng ký chủ đề và thời gian có thể hỗ trợ; sinh viên gửi nhu cầu, người cố vấn nhận/từ chối, lưu trạng thái và đánh giá sau buổi trao đổi.
3. **Cơ hội theo ngành:** phân loại tin tuyển dụng, thực tập, sự kiện và bài chia sẻ để các ngành ngoài CNTT có nội dung phù hợp; lưu việc làm/sự kiện quan tâm và nhắc hạn.
4. **Thông báo theo dõi:** chọn khoa/ngành/chủ đề quan tâm, theo dõi sự kiện đã đăng ký và trạng thái học bổng. Tách thông báo quan trọng khỏi bản tin định kỳ.

Làm danh bạ và yêu cầu kết nối trước, sau đó mới mở rộng cố vấn. Đây là luồng trực tiếp thể hiện mục tiêu kết nối toàn trường, dùng lại hồ sơ, phân quyền và thông báo đã có. Hiện tại sản phẩm mạnh về cung cấp nội dung và cơ hội, nhưng chưa có luồng thành viên tìm và kết nối với nhau.

## Nội dung cốt lõi nên giữ

[Website Khoa CNTT DLU](https://cntt.dlu.edu.vn/) hiện tổ chức các nhóm tin hoạt động, thông báo, sự kiện và tài nguyên sinh viên. Chỉ tham khảo cách tổ chức các nhóm nội dung này, biên soạn cho phạm vi toàn trường:

| Nhóm nội dung | Cách thể hiện trong dự án |
| --- | --- |
| Giới thiệu | Tổng quan Trường, mục tiêu dự án, cách tham gia; không biến thành cổng đào tạo/tuyển sinh |
| Bản tin và thông báo | Hoạt động cộng đồng, cơ hội tham gia, tin đối tác; chuyên mục rõ, ngày đăng và nguồn nếu có |
| Sự kiện | Gặp mặt, talkshow, hội thảo, ngày hội nghề nghiệp; ngày/địa điểm/đối tượng và nút đăng ký ngay trong dự án |
| Câu chuyện cựu sinh viên | Kinh nghiệm nghề nghiệp từ nhiều ngành, hành trình sau tốt nghiệp, chia sẻ kỹ năng và cơ hội cố vấn |
| Học bổng và hỗ trợ | Điều kiện, hạn nộp, hồ sơ cần chuẩn bị và tiến độ xét duyệt; tách cam kết tài trợ khỏi xác nhận đã nhận tiền |
| Hướng dẫn cộng đồng | FAQ về tài khoản, quyền riêng tư, đăng bài, kết nối/cố vấn, sự kiện và học bổng; liên hệ Ban quản trị khi cần |

Không dùng chuyên ngành CNTT, danh sách lãnh đạo một khoa hoặc thông báo có thời hạn từ website Khoa làm thông tin đại diện cho toàn trường. Các khoa/ngành có thể xuất hiện như phạm vi của một bài viết, sự kiện hoặc hồ sơ cụ thể.

## Bằng chứng mã nguồn và tiêu chí cho các nâng cấp

| Nhóm | Cơ sở hiện có | Tiêu chí khi hoàn thiện |
| --- | --- | --- |
| Tài khoản | `src/lib/auth.ts`, `src/actions/auth-actions.ts`, `src/validators/profile-schema.ts` | Người dùng tự khôi phục tài khoản qua email thật; xác minh email; hồ sơ có danh mục khoa/ngành và quyền hiển thị từng nhóm thông tin |
| Kết nối | `src/db/schema.ts` có `profiles`; `getAlumniForSpeakerInvitation` chỉ phục vụ quản trị mời diễn giả | Thành viên tìm được người phù hợp; gửi, nhận, từ chối, hủy yêu cầu kết nối; chỉ xem dữ liệu chủ hồ sơ cho phép; chặn gửi trùng và giới hạn tần suất |
| Cố vấn | Dashboard sinh viên/cựu sinh viên hiện tập trung sự kiện, học bổng, khảo sát | Cựu sinh viên khai báo chủ đề/thời gian; sinh viên mô tả nhu cầu; theo dõi chờ nhận, được nhận, từ chối, hoàn tất; có thông báo trong ứng dụng |
| Đăng bài | `getMyExperiencePosts` trong `src/actions/experience-actions.ts` | Tác giả nhìn thấy mọi bài của mình và trạng thái xét duyệt; bài từ chối có lý do; sửa/gửi lại không làm lộ bài chưa công bố |
| Khám phá | News đã phân trang; Experiences giới hạn 30 bài, Jobs giới hạn 50, Events chưa có tìm kiếm | Tổng kết quả đúng, phân trang trước khi tải quá nhiều dữ liệu; tìm không dấu; bộ lọc lĩnh vực/chủ đề/khoa-ngành; xóa từ khóa giữ bộ lọc hợp lý |
| Email, upload | Worker mô phỏng email; `src/lib/storage.ts` chưa được nối vào các form nhận URL | Gửi email thật có trạng thái thất bại/gửi lại; upload kiểm tra loại/dung lượng; minh chứng học bổng chỉ người có quyền đọc; xử lý lỗi ký URL rõ ràng |
| Vận hành | Migration đã tồn tại, nhưng database thực tế chưa đủ bảng; chưa có CI | Schema đồng bộ; toàn bộ kiểm tra tự động chạy trước phát hành; kiểm tra database/worker/storage; sao lưu và thử khôi phục |

## Thiết kế nội dung cốt lõi

Trang chủ nên dẫn tới **Thành viên → Cố vấn → Cơ hội → Hoạt động → Góc chia sẻ → Khuyến học** khi các tính năng tương ứng đã được xây dựng. Giữ bản tin gọn; chỉ thêm mục vào menu khi có trang và luồng sử dụng hoàn chỉnh.

| Chuyên mục | Nội dung đề xuất | Thông tin cần có trong mỗi nội dung |
| --- | --- | --- |
| Câu chuyện cựu sinh viên | Công việc đầu tiên, chuyển hướng nghề nghiệp, nghiên cứu, khởi nghiệp, làm việc ở địa phương | Ngành học, thời điểm học, bối cảnh, bài học cụ thể và lời khuyên; do thành viên đồng ý chia sẻ |
| Cơ hội | Việc làm, thực tập, cộng tác và cơ hội nghiên cứu cho nhiều lĩnh vực | Ngành phù hợp, yêu cầu, địa điểm/hình thức, hạn nhận hồ sơ, đơn vị tuyển dụng và cách ứng tuyển |
| Hoạt động | Gặp mặt các thế hệ, trao đổi nghề nghiệp, workshop ngoại ngữ/kỹ năng, hoạt động cộng đồng | Đối tượng, chủ đề, người tổ chức, thời gian, địa điểm, số chỗ, hạn đăng ký và trạng thái sự kiện |
| Khuyến học | Hỗ trợ hoàn cảnh khó khăn, học tập, nghiên cứu hoặc dự án cộng đồng | Điều kiện, tiêu chí xét, hạn nộp, minh chứng, tiến độ; số đã nhận tiền tách khỏi cam kết tài trợ |
| Tài nguyên | Mẫu CV, cách viết hồ sơ, chuẩn bị phỏng vấn, cách tìm thực tập và làm đề tài | Tác giả/nguồn, đối tượng sử dụng, ngày cập nhật, tài liệu được phép chia sẻ; không sao chép học vụ riêng của Khoa |
| Hướng dẫn | Ai có thể tham gia, cập nhật khoa/ngành, đăng bài, đăng ký/hủy sự kiện, theo dõi học bổng và gửi góp ý | Câu trả lời ngắn, liên kết tới thao tác đang có; phần kết nối/cố vấn chỉ công bố sau khi xây dựng xong |

Nội dung mẫu bổ sung cần trải đều qua khoa học tự nhiên, kinh tế, ngôn ngữ, du lịch, xã hội và công nghệ. Không dùng bài của một ngành để sửa khoa/ngành trong hồ sơ tác giả; không đổi hồ sơ hay nội dung thật bằng suy đoán.

## Thứ tự phát triển

1. **Hoàn thiện nền tảng đang có:** đồng bộ migration, email/khôi phục mật khẩu, upload minh chứng, trang quản lý bài cá nhân và kiểm tra luồng thực tế của từng vai trò.
2. **Hoàn thiện mục tiêu kết nối:** hồ sơ có quyền riêng tư, danh bạ đa ngành, yêu cầu kết nối, sau đó cố vấn. Ưu tiên luồng này trước chat thời gian thực hoặc thêm nhiều chuyên mục.
3. **Tăng khả năng khám phá và duy trì cộng đồng:** tìm không dấu, bộ lọc, phân trang, lưu/theo dõi nội dung, tài nguyên, FAQ; đồng bộ giao diện và trạng thái tải/lỗi, SEO và CI.

Các tiêu chí trên là kế hoạch đề xuất. Danh bạ, cố vấn, email thật và upload chưa được triển khai trong đợt điều chỉnh này.
