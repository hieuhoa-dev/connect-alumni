# Kiểm tra chức năng theo vai trò và đề xuất cập nhật

Ngày rà soát: **13/10/2026**. Sản phẩm phục vụ sinh viên và cựu sinh viên **toàn Trường Đại học Đà Lạt**, cùng doanh nghiệp, nhà tài trợ và bộ phận vận hành dự án.

## Phạm vi và cách kiểm tra

- Đọc các trang, sidebar, server actions, schema, validation, phân quyền, đăng nhập, thông báo và worker. Kiểm tra quyền ở phía server, không chỉ việc ẩn nút trên giao diện.
- Chạy kiểm thử hồi quy về dữ liệu đầu vào, phiên đăng nhập, tài khoản bị khóa, quyền sở hữu, trạng thái duyệt, hạn nộp và thao tác đồng thời.
- Tạo database PostgreSQL 17 riêng tại máy, áp dụng toàn bộ migration và seed tài khoản trình diễn. Kiểm thử tích hợp dùng các actions và truy vấn Drizzle của sản phẩm; giả lập phiên đăng nhập ở các script tích hợp và tắt gửi email/dịch vụ bên ngoài. Không ghi vào database triển khai.
- Kiểm tra trình duyệt với đăng nhập thật cho 5 vai trò trên bản production chạy riêng tại `localhost:3100`, gồm điều hướng, chặn sai quyền, giao diện mobile và thao tác gửi biểu mẫu.
- Đối chiếu database đang cấu hình bằng truy vấn **chỉ đọc**. Môi trường này có 22 bảng, thiếu `news_articles` và `contact_messages`. Số liệu thử nghiệm ở database riêng không thay thế việc đồng bộ migration ở môi trường triển khai.

## Các lỗi đã sửa

| Nhóm | Lỗi phát hiện | Hành vi sau khi sửa |
| --- | --- | --- |
| Footer cộng đồng | Thiếu thông tin liên hệ Trường | Có tên Trường, địa chỉ, điện thoại bấm gọi và email. Logo mở lại trang chủ dự án; các mục khám phá dùng trang nội bộ |
| Vận hành/Admin | Dashboard trả cả nhật ký quản trị cho Vận hành dù trang nhật ký chỉ dành cho Admin | Chỉ Admin được truy vấn và xem nhật ký; Vận hành không nhận dữ liệu nhật ký qua dashboard |
| Điều hướng Admin | Vận hành mở trực tiếp trang Người dùng/Nhật ký gặp màn lỗi thay vì chuyển hướng | Trang kiểm tra quyền trước truy vấn: Vận hành về trang chủ, khách về đăng nhập, Admin tiếp tục dùng bình thường; server action vẫn chặn sai quyền |
| Tài khoản | Người dùng chưa có profile vẫn xuất hiện như tài khoản có thể đổi quyền/khóa; phiên cũ cần bị thu hồi khi khóa | Hiện rõ hồ sơ chưa hoàn thiện; thao tác quản trị kiểm tra tài khoản hiện tại, dữ liệu đầu vào và thu hồi session khi khóa |
| Nội dung riêng | Tài khoản bị khóa vẫn có thể được coi là nhân sự quản trị/tác giả khi xem nội dung chưa công bố | Chỉ tác giả hoặc nhân sự có hồ sơ hoạt động được xem bản riêng; nội dung công khai vẫn đọc được bình thường |
| Tin tức | Nội dung chỉ chứa HTML rỗng; ghim bản chưa đăng; phản hồi thành công khi bản ghi đã bị xóa | Kiểm tra văn bản sau làm sạch HTML; chỉ ghim tin đã đăng; xác nhận bản ghi thực sự được cập nhật; cập nhật lại các trang liên quan |
| Duyệt hồ sơ | Bản bị từ chối/hết hạn biến mất khỏi màn quản lý | Có phần lịch sử xử lý, trạng thái và lý do từ chối; tin đã duyệt nhưng công ty chưa xác minh hiển thị “Đã duyệt · Tạm ẩn” |
| Doanh nghiệp | Công ty bị thu hồi xác minh vẫn thấy số tin “công khai”; dữ liệu sidebar/cache không đổi sau đăng ký/chuyển công ty | Đếm đúng tin còn hạn thuộc công ty đã xác minh; cập nhật lại context và danh sách; hiển thị đúng pending/rejected |
| Tuyển dụng | Trường chỉ có khoảng trắng vượt validation; public query trả trường duyệt nội bộ; `%`/`_` mở rộng tìm kiếm | Chuẩn hóa chuỗi; kiểm tra UUID trước truy vấn; chỉ chọn trường công khai; tìm ký tự đặc biệt theo giá trị nhập thật |
| Diễn giả | Alumni có thể trả lời lời mời cho sự kiện đã hủy/kết thúc | Kiểm tra chủ sở hữu, lời mời đang chờ và tình trạng sự kiện trong cùng câu cập nhật; giao diện không mời trả lời lời mời không còn hiệu lực |
| Tài trợ/học bổng | CTA tài trợ đưa Alumni vào khu vực Doanh nghiệp nên bị chuyển về trang chủ; CTA xin học bổng xuất hiện cả với vai trò không được nộp | Có `/account/scholarships/pledge` dùng chung, chọn đúng chiến dịch từ trang chi tiết; chỉ sinh viên/Admin phù hợp mới có CTA nộp hồ sơ, khách được dẫn đăng nhập kèm trang cần quay lại |
| Bài chia sẻ | Bài chỉ chứa script/HTML rỗng được gửi; gửi xong tới danh sách công khai chưa có bài | Kiểm tra nội dung hiển thị sau làm sạch, lưu trạng thái chờ duyệt và đưa tác giả tới trang xem riêng của bài |
| Khảo sát | Có thể tạo form mở với hạn đã qua; tài khoản không hoạt động vẫn đọc danh sách form nhắm tới mình | Chặn form mở hết hạn, cho lưu nháp; kiểm tra hồ sơ hoạt động; đóng nhận câu trả lời ngay tại thời điểm hết hạn |
| Báo cáo form | Lỗi truy vấn có thể bị trình bày thành “không tìm thấy” | Phân biệt bản ghi không tồn tại và lỗi tải dữ liệu, giữ thông báo lỗi phù hợp |
| Thông báo | Liên kết lưu trong dữ liệu có thể dẫn ra ngoài; ID và trạng thái chưa được kiểm tra đầy đủ | Chỉ chấp nhận đường dẫn nội bộ hợp lệ; cập nhật/xóa luôn gắn với người dùng đang đăng nhập; lỗi đầu vào không ghi DB |
| Tìm tiếng Việt | PostgreSQL dùng locale C có thể khớp giữa từ sau chữ có dấu và không đổi hoa/thường tiếng Việt đúng | Chuẩn hóa Unicode, đổi chữ hoa tiếng Việt và bảo vệ ranh giới từ; kiểm chứng bằng PostgreSQL thật với chữ có dấu, HTML và ký tự đặc biệt |

Thông tin footer lấy từ [trang chính thức thuộc Đại học Đà Lạt](https://ksh.dlu.edu.vn/en/): Số 01 Phù Đổng Thiên Vương, phường Lâm Viên - Đà Lạt, tỉnh Lâm Đồng; **0263 3822 246**; **info@dlu.edu.vn**. Thông tin liên hệ Trường và biểu mẫu hỗ trợ dự án là hai mục riêng. Nguồn và ngày đối chiếu nằm trong [DLU_REFERENCE.md](./DLU_REFERENCE.md).

## Ma trận chức năng theo vai trò

| Vai trò | Chức năng đã rà soát | Ranh giới quyền cần giữ |
| --- | --- | --- |
| Sinh viên | Dashboard, hồ sơ/đổi mật khẩu, thông báo, sự kiện/đăng ký của tôi, khảo sát phù hợp khóa/đối tượng, hồ sơ học bổng, khám phá việc làm và chia sẻ, cam kết tài trợ chung | Không tạo bài bằng quyền Alumni, không dùng quản lý công ty/duyệt nội dung; chỉ nộp và xem hồ sơ/câu trả lời của mình |
| Alumni | Các trang thành viên, gửi bài và xem riêng khi chờ duyệt, tham gia sự kiện, trả lời lời mời diễn giả, khảo sát phù hợp, cam kết tài trợ chung | Không tự duyệt bài, không nộp học bổng sinh viên bằng quyền Alumni, không dùng dữ liệu riêng của người khác |
| Doanh nghiệp | Đăng ký hồ sơ, chuyển công ty thuộc membership, xem trạng thái, tạo tin tuyển dụng, xem tin theo công ty, cam kết tài trợ | Công ty chưa xác minh không tạo tin; tin phải qua duyệt và còn hạn mới công khai; không đọc/đổi context công ty không thuộc membership |
| Vận hành (`faculty_staff`) | Thống kê, tin tức/liên hệ, duyệt công ty/việc làm/chia sẻ, tạo sự kiện/mời diễn giả/điểm danh, tạo và quản lý form/câu trả lời, học bổng/xét hồ sơ/xác nhận tài trợ | Không đổi vai trò hoặc khóa tài khoản; không xem endpoint nhật ký Admin; hồ sơ bị khóa mất quyền thao tác |
| Admin | Toàn bộ nghiệp vụ vận hành; quản lý vai trò/trạng thái người dùng và nhật ký | Không tự khóa hoặc hạ quyền tài khoản đang dùng; kiểm tra tính hợp lệ của người dùng đích; thao tác phải có dữ liệu và dấu vết phù hợp |

Admin có quyền vượt giới hạn vai trò trong guard hiện có. Nếu cần phân tách người duyệt hồ sơ nhạy cảm với quản trị hệ thống, nên bổ sung quyền chi tiết thay vì tiếp tục mở rộng quyền Admin mặc định.

## Kết quả kiểm chứng

| Nhóm kiểm tra | Kết quả |
| --- | --- |
| Hồi quy tự động | **120/120 đạt**, gồm bộ kiểm tra nền và 4 nhóm `audit-admin` (16), `audit-employers` (14), `audit-members` (20), `audit-shared` (4) |
| Tích hợp Sinh viên/Alumni | **11/11 nhóm đạt** trên PostgreSQL/Drizzle thật: đăng ký đồng thời suất cuối, chống trùng, lời mời hết hiệu lực/quyền sở hữu, bài riêng và duyệt công khai, tìm kiếm/chủ đề/lượt xem, form theo vai trò/câu bắt buộc/chống trùng, học bổng chống dùng câu trả lời của người khác và nộp trùng |
| Tích hợp Doanh nghiệp | **6/6 luồng đạt**: đăng ký và membership trong transaction, điều kiện xác minh/tạo tin, duyệt và phạm vi public fields, thu hồi xác minh ẩn tin, cô lập thành viên/quyền, hết hạn và điều kiện duyệt không phụ thuộc Redis |
| Tìm kiếm PostgreSQL | **29/29 trường hợp đạt**: 9 trường hợp ranh giới/Unicode/hoa-thường và 20 trường hợp HTML/URL/thuộc tính/script/entity/ký tự đặc biệt |
| Tích hợp Vận hành/Admin | **9/9 nhóm đạt**: quyền 5 vai trò/locked/missing profile; vòng đời tin/ghim/ngày đăng/làm sạch HTML; contact chống spam đồng thời và xử lý; form bắt buộc/đối tượng/hạn/chống trùng; đổi quyền/khóa và thu hồi session; xác nhận tài trợ đồng thời chỉ cộng tiền một lần và ghi một audit; dashboard Vận hành không trả nhật ký Admin |
| Trình duyệt 5 vai trò | **Đạt**: 16 trang công khai gồm danh sách/chi tiết; 71 lượt trang theo vai trò; 11 trường hợp chặn sai vai trò; 15 màn hình vai trò ở 390 px và footer mobile không tràn/cắt nội dung ngang. Đăng nhập thật cả 5 vai trò; đăng ký Sinh viên tạo đủ user/profile; gửi liên hệ lưu đúng DB; Alumni gửi cam kết có trạng thái `pledged`, chưa tăng tiền đã nhận. Tìm “b”/“bí” trả card bài phù hợp, một nút xóa và nhãn đúng; xóa khôi phục trang chủ. Lượt kiểm tra cuối không có thất bại hoặc ngoại lệ JavaScript |
| TypeScript/Biome/production build | **Đạt**. Next.js 16.3.6 biên dịch bản production cuối, kiểm tra TypeScript và tạo các route; Biome toàn bộ 260 tệp không có lỗi chặn, `git diff --check` sạch. Còn các cảnh báo sẵn có, cần xử lý dần |

Script tích hợp và database trình diễn nằm trong thư mục `.local/` đã được gitignore. Các kiểm thử hồi quy có thể chạy bằng `npm test`. Không dùng script audit để seed hay sửa database triển khai. Các kiểm tra tích hợp giả lập phiên và tác vụ gửi thông báo không phải bằng chứng đã gửi email thật; kiểm tra trình duyệt sử dụng phiên đăng nhập thật và database riêng.

Sau kiểm tra đã dừng ứng dụng audit và xóa riêng database audit được tạo cho đợt này. Giữ báo cáo và kết quả kiểm tra; không đổi `.env`, không seed/migrate/xóa dữ liệu của môi trường triển khai.

## Những việc cần hoàn thiện trước khi triển khai

| Ưu tiên | Mục cần cập nhật | Tiêu chí hoàn thành |
| --- | --- | --- |
| P0 | Đồng bộ database triển khai | Đối chiếu lịch sử migration, áp dụng đúng hai migration Tin tức/Liên hệ đang thiếu; kiểm tra đăng/duyệt/tìm tin và lưu/đọc liên hệ trên môi trường triển khai |
| P0 | Email và khôi phục tài khoản | Worker gửi qua nhà cung cấp thật; có trạng thái gửi thất bại/gửi lại; hoàn thiện quên mật khẩu và xác minh email. Hiện worker chỉ ghi log mô phỏng email |
| P0 | Tệp minh chứng và quyền đọc | Nối upload vào form; giới hạn loại/dung lượng; lưu object key, chỉ cấp URL tạm khi người dùng có quyền. Hiện form nhận URL, module S3 chưa được nối; fallback public URL cần bỏ khi triển khai tài liệu riêng |
| P1 | Lịch sử và gửi lại nội dung cá nhân | “Bài chia sẻ của tôi”, sửa/gửi lại khi bị từ chối; hồ sơ doanh nghiệp và tin tuyển dụng cũng cần chỉnh sửa, đóng/gia hạn/gửi lại; luôn hiện lý do và trạng thái |
| P1 | Quy trình xác minh doanh nghiệp | Thu thập mã số thuế/giấy đăng ký và người liên hệ, có hướng dẫn kiểm tra và lý do duyệt. Trạng thái `verified` hiện là kết quả duyệt hồ sơ trên nền tảng, chưa chứng minh kiểm chứng pháp lý |
| P1 | Sự kiện trọn vòng đời | Hủy đăng ký có hạn, hoàn trả suất an toàn, danh sách chờ, nhắc lịch; lịch sử thư mời và thông báo cho Ban tổ chức khi Alumni nhận/từ chối |
| P1 | Chỉnh sửa cấu hình đã tạo | Có màn sửa/hủy sự kiện, sửa/đóng chiến dịch, sửa biểu mẫu và quy tắc thay đổi khi đã có đăng ký/câu trả lời; không buộc tạo bản mới chỉ vì sai nội dung |
| P1 | Học bổng/tài trợ rõ tiến trình | “Cam kết của tôi”, hướng dẫn đối soát, lịch sử từng bước xét hồ sơ; cam kết chưa được coi là tiền nhận. Xác nhận hai lần chỉ cộng tiền một lần |
| P1 | Giữ thao tác sau đăng nhập | CTA ở chi tiết học bổng đã có callback; CTA tài trợ từ landing/footer/danh sách cần giữ đích và chiến dịch qua đăng nhập, thay vì chỉ mở dashboard |
| P1 | Nhật ký đáng tin cậy | `logAuditEvent` hiện ghi sau mutation và trả `null` khi lỗi, nên chưa bảo đảm đầy đủ. Với thao tác cần kiểm toán, dùng transaction hoặc outbox cùng thay đổi dữ liệu, giám sát lỗi và kiểm chứng khả năng phục hồi |
| P1 | Hồ sơ và kết nối toàn trường | Chuẩn hóa khoa/ngành/khóa theo nguồn Trường; danh bạ có quyền riêng tư, yêu cầu kết nối và cố vấn. Đây là luồng chính còn thiếu so với mục tiêu kết nối sinh viên–cựu sinh viên |
| P2 | Khảo sát, tìm kiếm, danh sách lớn | Lịch sử khảo sát đã hoàn thành kể cả form đóng; tìm không dấu có xếp hạng, bộ lọc lĩnh vực/khoa/khóa, phân trang thống nhất; không dùng lượt có hồ sơ để khẳng định tỷ lệ có việc làm |
| P2 | Quản trị và chất lượng vận hành | Bộ lọc trạng thái và lịch sử xét duyệt; export dữ liệu đúng quyền; phân quyền thành viên công ty; CI lint/typecheck/test/build, sao lưu và thử khôi phục, kiểm tra worker/storage |
| P2 | Trải nghiệm hoàn thiện | FAQ theo vai trò, trạng thái loading/empty/error/404 thống nhất, tối ưu ảnh, kiểm tra bàn phím và giảm chuyển động, metadata/sitemap chỉ cho nội dung công khai |

## Các mục nội dung nên cập nhật

| Mục | Nội dung cốt lõi | Đề mục bài viết gợi ý |
| --- | --- | --- |
| Tin cộng đồng | Thông báo tham gia, hoạt động liên ngành, đối tác và kết quả chương trình | “Các hoạt động kết nối sinh viên–cựu sinh viên trong tháng”; “Hướng dẫn tham gia cộng đồng DLU Alumni” |
| Câu chuyện Alumni | Hành trình nghề nghiệp và bài học thực tế từ nhiều ngành, có sự đồng ý của người chia sẻ | “Công việc đầu tiên sau tốt nghiệp”; “Từ giảng đường đến doanh nghiệp địa phương”; “Chuyển hướng nghề nghiệp: kinh nghiệm và điều cần chuẩn bị” |
| Cơ hội | Việc làm/thực tập/cộng tác/nghiên cứu đa ngành, nêu đơn vị, điều kiện, hình thức và hạn nhận hồ sơ | “Cơ hội thực tập theo lĩnh vực”; “Chuẩn bị hồ sơ ứng tuyển cho sinh viên năm cuối” |
| Sự kiện | Gặp mặt các thế hệ, trao đổi nghề nghiệp, kỹ năng, khởi nghiệp và hoạt động cộng đồng | “Ngày gặp gỡ cộng đồng DLU”; “Buổi trao đổi nghề nghiệp cùng Alumni”; “Workshop CV và phỏng vấn” |
| Khuyến học | Điều kiện, hạn nộp, hồ sơ cần chuẩn bị, trạng thái xét và kết quả đã được phép công bố | “Hướng dẫn chuẩn bị minh chứng học bổng”; “Cập nhật tiến độ tiếp nhận và trao hỗ trợ” |
| Tài nguyên và hướng dẫn | CV, phỏng vấn, nghiên cứu, quyền riêng tư và cách dùng từng tính năng đang có | “Cách cập nhật hồ sơ khoa/ngành”; “Gửi bài chia sẻ và theo dõi xét duyệt”; “Đăng ký sự kiện và đọc thông báo” |

Nội dung tham khảo từ website khoa chỉ nên dùng để học cách tổ chức chuyên mục. Biên soạn cho phạm vi toàn trường; ghi tác giả/nguồn, ngày cập nhật và trạng thái. Không trình bày nội dung mẫu thành thông báo, tài trợ hay quan hệ đối tác chính thức. Không tạo mục điều hướng cho danh bạ/cố vấn/ứng tuyển trước khi có luồng sử dụng hoàn chỉnh.

## Thứ tự đề xuất

1. Hoàn thiện nền tảng đang có: migration triển khai, email/khôi phục mật khẩu, upload, lịch sử và chỉnh sửa/gửi lại, nghiệp vụ sự kiện và đối soát.
2. Xây danh bạ riêng tư và yêu cầu kết nối, rồi bổ sung cố vấn nghề nghiệp; ưu tiên luồng này trước chat thời gian thực.
3. Bổ sung nội dung đa ngành, tìm kiếm/bộ lọc, tài nguyên/FAQ, kiểm tra tự động và vận hành.

Các bảng đề xuất là công việc tiếp theo, không phải tính năng đã được xây dựng trong đợt rà soát. Phạm vi đã kiểm chứng và các phụ thuộc chưa kiểm chứng phải được giữ rõ khi trình diễn hoặc triển khai đồ án.
