import { Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Tag } from "@/components/landing/landing-parts";
import { SITE } from "@/lib/site-config";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Liên hệ · CNTT Đại học Đà Lạt",
  description: `Gửi câu hỏi, đề xuất hợp tác hoặc thông tin cập nhật tới ${SITE.facultyName}.`,
};

const CONTACT_ITEMS = [
  {
    icon: MapPin,
    label: "Văn phòng Khoa",
    value: SITE.address,
    href: SITE.mapUrl,
  },
  {
    icon: Mail,
    label: "Email Khoa",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
  },
  {
    icon: Phone,
    label: "Điện thoại Khoa",
    value: SITE.phone,
    href: SITE.phoneHref,
  },
] as const;

const ContactPage = () => {
  return (
    <div className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="flex max-w-3xl flex-col gap-4 pb-10">
        <Tag tone="blue">Liên hệ</Tag>
        <h1 className="font-serif text-4xl font-normal leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          Kết nối với Khoa{" "}
          <span className="font-light italic text-foreground/80">
            và cộng đồng.
          </span>
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Liên hệ văn phòng Khoa qua email hoặc điện thoại bên dưới. Biểu mẫu
          tiếp nhận câu hỏi, đề xuất hợp tác và thông tin cựu sinh viên trên
          Connect Alumni.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12 border-t-2 border-foreground pt-8 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-label="Biểu mẫu liên hệ">
          <ContactForm />
        </section>

        <aside className="flex flex-col gap-8 lg:col-span-5 lg:border-l lg:border-border-strong lg:pl-10">
          <ul className="flex flex-col divide-y divide-border-strong border-y border-border-strong">
            {CONTACT_ITEMS.map((item) => (
              <li key={item.label} className="flex items-start gap-3 py-4">
                <item.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                  <a
                    href={item.href}
                    className="text-sm leading-relaxed text-foreground hover:underline underline-offset-4"
                  >
                    {item.value}
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <p className="font-serif text-xl">Ghé thăm văn phòng Khoa</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tầng 2, nhà A7, trong khuôn viên {SITE.universityName}.
            </p>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm font-medium underline underline-offset-4 hover:text-muted-foreground"
            >
              Tìm đường đến Trường <span aria-hidden="true">↗</span>
            </a>
            <a
              href={SITE.sources.contact}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Thông tin liên hệ từ cẩm nang của Khoa{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ContactPage;
