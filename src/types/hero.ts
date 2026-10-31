export interface HeroSlideData {
  id: string;
  badge?: string | null;
  title?: string | null;
  highlightText?: string | null;
  description?: string | null;
  primaryAction?: {
    label: string;
    href: string;
  } | null;
  secondaryAction?: {
    label: string;
    href: string;
  } | null;
  linkHref?: string | null;
  image: {
    src: string;
    mobileSrc?: string | null;
    alt: string;
  };
  overlayEnabled: boolean;
}

export const DEFAULT_HERO_SLIDE: HeroSlideData = {
  id: "default",
  badge: "TRƯỜNG ĐẠI HỌC ĐÀ LẠT · 1976 – 2026 (50 NĂM)",
  title: "Mừng bạn trở về nhà!",
  highlightText: "Nơi hội tụ, tri ân và tiếp bước tương lai",
  description:
    "Mạng lưới gắn kết các thế hệ Cựu sinh viên, Giảng viên, Doanh nghiệp đối tác và Sinh viên dưới bóng thông xanh xứ ngàn hoa.",
  primaryAction: {
    label: "Đăng ký tham gia",
    href: "/register",
  },
  secondaryAction: {
    label: "Cập nhật hồ sơ Cựu SV",
    href: "/login",
  },
  image: {
    src: "/banner/50_nam_dlu.jpg",
    mobileSrc: null,
    alt: "Khuôn viên Trường Đại học Đà Lạt kỷ niệm 50 năm truyền thống",
  },
  overlayEnabled: true,
};
