import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Bảo mật dữ liệu cá nhân - Connect Alumni",
};

const PrivacyPage = () => {
  return (
    <LegalPage
      eyebrow="Bảo mật"
      title="Chính sách bảo mật dữ liệu cá nhân"
      updatedAt="10/2026"
      intro={`${SITE.appName} phục vụ cộng đồng sinh viên, cựu sinh viên và doanh nghiệp gắn với ${SITE.facultyName}, ${SITE.universityName}. Trang này giải thích việc sử dụng dữ liệu trên nền tảng.`}
      sections={[
        {
          heading: "Dữ liệu chúng tôi thu thập",
          paragraphs: [
            "Thông tin tài khoản: họ tên, email và mật khẩu (mật khẩu được mã hóa một chiều, quản trị viên không đọc được).",
            "Thông tin hồ sơ bạn tự nhập: vai trò, mã số sinh viên, khóa, năm tốt nghiệp, số điện thoại, giới thiệu bản thân và ảnh đại diện.",
            "Dữ liệu hoạt động: đăng ký sự kiện, câu trả lời khảo sát, hồ sơ xin học bổng, cam kết tài trợ, bài chia sẻ và tin nhắn liên hệ.",
            "Nhật ký thao tác quan trọng (đăng nhập, duyệt bài, xác nhận tài trợ) để phục vụ kiểm tra khi có sự cố.",
          ],
        },
        {
          heading: "Mục đích sử dụng",
          paragraphs: [
            "Dữ liệu chỉ dùng để vận hành mạng lưới: xác thực tài khoản, kết nối cựu sinh viên với sinh viên và doanh nghiệp, tổ chức sự kiện, xét học bổng và gửi thông báo liên quan đến hoạt động của bạn.",
            "Chúng tôi không bán hay cho thuê dữ liệu cá nhân cho bên thứ ba.",
          ],
        },
        {
          heading: "Thông tin hiển thị công khai",
          paragraphs: [
            "Tên và khóa của tác giả được hiển thị cùng bài chia sẻ đã được duyệt. Diễn giả đã nhận lời được hiển thị trên trang sự kiện.",
            "Nhà tài trợ được ghi danh bằng tên bạn đã nhập sau khi Khoa xác nhận đã nhận tiền. Chọn chế độ ẩn danh thì tên không được hiển thị công khai.",
            "Số điện thoại, mã số sinh viên, email và hồ sơ xin học bổng không hiển thị công khai. Chỉ cán bộ Khoa được phân quyền mới xem được.",
          ],
        },
        {
          heading: "Thời gian lưu trữ và bảo vệ dữ liệu",
          paragraphs: [
            "Dữ liệu được lưu trong thời gian tài khoản còn hoạt động và theo quy định của Khoa về lưu trữ hồ sơ.",
            "Hệ thống phân quyền theo vai trò, mã hóa kết nối và chỉ cho phép cán bộ được giao nhiệm vụ truy cập dữ liệu cá nhân.",
          ],
        },
        {
          heading: "Quyền của bạn",
          paragraphs: [
            "Bạn có thể xem và chỉnh sửa hồ sơ của mình, hoặc yêu cầu đính chính, ẩn hay xóa dữ liệu cá nhân bằng cách liên hệ Khoa.",
            `Liên hệ: ${SITE.email}, hoặc dùng biểu mẫu tại trang Liên hệ.`,
          ],
        },
      ]}
    />
  );
};

export default PrivacyPage;
