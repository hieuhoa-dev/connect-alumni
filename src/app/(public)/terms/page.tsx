import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng - Connect Alumni",
};

const TermsPage = () => {
  return (
    <LegalPage
      eyebrow="Điều khoản"
      title="Điều khoản sử dụng"
      updatedAt="10/2026"
      intro={`Khi đăng ký hoặc sử dụng ${SITE.appName}, bạn đồng ý với các điều khoản dưới đây. Nội dung áp dụng cho tài khoản và hoạt động trên nền tảng.`}
      sections={[
        {
          heading: "Tài khoản",
          paragraphs: [
            "Bạn cung cấp thông tin chính xác khi đăng ký và tự chịu trách nhiệm về việc giữ bí mật mật khẩu.",
            "Tài khoản của cán bộ Khoa và quản trị viên do Khoa cấp, không đăng ký công khai.",
            "Khoa có quyền khóa tài khoản vi phạm điều khoản hoặc có dấu hiệu lạm dụng.",
          ],
        },
        {
          heading: "Nội dung do người dùng đăng",
          paragraphs: [
            "Bài chia sẻ, tin tuyển dụng và thông tin doanh nghiệp phải trung thực, không vi phạm pháp luật và không xâm phạm quyền của người khác.",
            "Mọi bài chia sẻ, tin tuyển dụng và hồ sơ doanh nghiệp đều được Khoa kiểm duyệt trước khi hiển thị. Khoa có thể từ chối hoặc gỡ nội dung không phù hợp.",
          ],
        },
        {
          heading: "Tuyển dụng và đối tác doanh nghiệp",
          paragraphs: [
            "Doanh nghiệp chịu trách nhiệm về tính chính xác của tin tuyển dụng. Việc tuyển dụng, đàm phán và ký kết diễn ra trực tiếp giữa doanh nghiệp và ứng viên, Khoa không phải là bên tuyển dụng.",
          ],
        },
        {
          heading: "Quỹ Khuyến học",
          paragraphs: [
            "Cam kết tài trợ trên hệ thống chỉ có hiệu lực ghi nhận khi cán bộ Khoa xác nhận đã nhận tiền. Việc xét học bổng do hội đồng của Khoa quyết định dựa trên hồ sơ và tiêu chí đã công bố.",
          ],
        },
        {
          heading: "Giới hạn trách nhiệm và liên hệ",
          paragraphs: [
            "Hệ thống được cung cấp trên cơ sở nỗ lực tốt nhất. Khoa không chịu trách nhiệm đối với thiệt hại phát sinh từ nội dung do người dùng hoặc đối tác đăng tải.",
            `Thắc mắc về điều khoản, vui lòng liên hệ ${SITE.email}.`,
          ],
        },
      ]}
    />
  );
};

export default TermsPage;
