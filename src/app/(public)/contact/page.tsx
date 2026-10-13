import type { Metadata } from "next";
import { Tag } from "@/components/landing/landing-parts";
import { PublicPageTitle } from "@/components/shared/public-page-title";
import { SITE } from "@/lib/site-config";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Hỗ trợ & góp ý · DLU Alumni",
  description: `Gửi câu hỏi, báo lỗi hoặc đề xuất hợp tác tới bộ phận quản trị dự án ${SITE.appName}.`,
};

const CONTACT_TOPICS = [
  {
    title: "Hỗ trợ sử dụng",
    description:
      "Câu hỏi về tài khoản, hồ sơ, đăng ký sự kiện hoặc các tính năng trên nền tảng.",
  },
  {
    title: "Góp ý cho dự án",
    description:
      "Báo lỗi hoặc chia sẻ đề xuất để cải thiện giao diện và trải nghiệm DLU Alumni.",
  },
  {
    title: "Hợp tác cộng đồng",
    description:
      "Trao đổi về chia sẻ kinh nghiệm, tổ chức hoạt động, tuyển dụng và học bổng.",
  },
] as const;

const ContactPage = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4 pb-10">
        <Tag tone="blue">Liên hệ</Tag>
        <PublicPageTitle>Chúng mình lắng nghe bạn.</PublicPageTitle>
        <p className="text-base leading-relaxed text-muted-foreground">
          Gửi câu hỏi, góp ý hoặc đề xuất hợp tác tới bộ phận quản trị dự án DLU
          Alumni. Tin nhắn được tiếp nhận ngay trên nền tảng.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12 border-t-2 border-primary pt-8 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-label="Biểu mẫu liên hệ">
          <ContactForm />
        </section>

        <aside className="flex flex-col gap-8 lg:col-span-5 lg:border-l lg:border-border-strong lg:pl-10">
          <h2 className="font-heading text-xl font-semibold">
            Bạn cần trao đổi về điều gì?
          </h2>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {CONTACT_TOPICS.map((topic, index) => (
              <li key={topic.title} className="flex items-start gap-4 py-5">
                <span
                  aria-hidden="true"
                  className="font-mono text-xs text-muted-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold">{topic.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {topic.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <p className="font-heading text-lg font-semibold">
              Để chúng mình hỗ trợ tốt hơn
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Mô tả rõ vấn đề hoặc ý tưởng của bạn và để lại email có thể nhận
              phản hồi. Khi báo lỗi, hãy cho biết trang đang sử dụng và thao tác
              đã thực hiện.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContactPage;
