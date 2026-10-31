export interface LinkOption {
  label: string;
  href: string;
  group: "Trang chính" | "Dịch vụ & Mạng lưới" | "Tài khoản";
}

export const PREDEFINED_LINK_OPTIONS: LinkOption[] = [
  { label: "Trang chủ", href: "/", group: "Trang chính" },
  { label: "Tin tức & Sự kiện", href: "/events", group: "Trang chính" },
  { label: "Thư viện ảnh sự kiện", href: "/gallery", group: "Trang chính" },
  { label: "Góc chia sẻ kinh nghiệm", href: "/experiences", group: "Dịch vụ & Mạng lưới" },
  { label: "Cơ hội việc làm", href: "/jobs", group: "Dịch vụ & Mạng lưới" },
  { label: "Quỹ học bổng Cựu sinh viên", href: "/scholarships", group: "Dịch vụ & Mạng lưới" },
  { label: "Mạng lưới Cựu sinh viên DLU", href: "/alumni", group: "Dịch vụ & Mạng lưới" },
  { label: "Dành cho Doanh nghiệp đối tác", href: "/employer/onboarding", group: "Dịch vụ & Mạng lưới" },
  { label: "Đăng ký thành viên", href: "/register", group: "Tài khoản" },
  { label: "Đăng nhập hệ thống", href: "/login", group: "Tài khoản" },
];
