/**
 * DLU Alumni là dự án riêng dành cho sinh viên và cựu sinh viên toàn trường.
 * Thông tin Trường được tổng hợp cho Giới thiệu và footer; hỗ trợ dự án dùng
 * biểu mẫu riêng. Nguồn: docs/DLU_REFERENCE.md.
 */
export const SITE = {
  appName: "DLU Alumni",
  tagline: "Cộng đồng sinh viên và cựu sinh viên Đại học Đà Lạt",
  logoUrl: "/images/dlu-logo.png",
  logoSourceUrl:
    "https://dlu.edu.vn/wp-content/uploads/2025/07/00.-Newest_DLU-Logo.png",
  logoWidth: 2106,
  logoHeight: 2106,
  logoAlt: "Logo Trường Đại học Đà Lạt",
  universityName: "Trường Đại học Đà Lạt",
  universityContact: {
    address:
      "Số 01 Phù Đổng Thiên Vương, phường Lâm Viên - Đà Lạt, tỉnh Lâm Đồng",
    phone: "0263 3822 246",
    phoneHref: "tel:+842633822246",
    email: "info@dlu.edu.vn",
    verifiedAt: "2026-10-13",
    sourceUrl: "https://ksh.dlu.edu.vn/en/",
  },
  universityProfile: {
    verifiedAt: "2026-10-13",
    overview: [
      "Trường Đại học Đà Lạt là cơ sở giáo dục đại học công lập, đào tạo đa ngành, đa lĩnh vực tại thành phố Đà Lạt. Hoạt động của Trường gắn với đào tạo, nghiên cứu khoa học, chuyển giao công nghệ và phục vụ cộng đồng.",
      "Tiền thân của Trường là Viện Đại học Đà Lạt, được thành lập năm 1957 và bắt đầu tuyển sinh năm 1958. Ngày 27/10/1976, Trường Đại học Đà Lạt được thành lập trên cơ sở kế thừa Viện Đại học Đà Lạt.",
    ],
    milestones: [
      {
        year: "1957",
        text: "Thành lập Viện Đại học Đà Lạt, tiền thân của Trường.",
      },
      {
        year: "1958",
        text: "Viện Đại học Đà Lạt bắt đầu tuyển sinh và đào tạo.",
      },
      {
        year: "1976",
        text: "Thành lập Trường Đại học Đà Lạt theo Quyết định 426/TTg ngày 27/10/1976.",
      },
    ],
  },
  mission:
    "DLU Alumni là dự án riêng kết nối sinh viên, cựu sinh viên của tất cả các khoa, ngành tại Trường Đại học Đà Lạt với doanh nghiệp, cơ hội nghề nghiệp, hoạt động cộng đồng và nguồn lực khuyến học.",
  vision:
    "Xây dựng một không gian chung để các thế hệ sinh viên Đại học Đà Lạt, ở mọi khoa và ngành học, cùng chia sẻ kinh nghiệm và đồng hành trên hành trình nghề nghiệp.",
  values: [
    {
      title: "Kết nối",
      description:
        "Giúp sinh viên, cựu sinh viên và doanh nghiệp từ nhiều lĩnh vực tìm thấy cơ hội đồng hành phù hợp.",
    },
    {
      title: "Minh bạch",
      description:
        "Trình bày rõ nguồn thông tin, điều kiện tham gia và tiến độ của các hoạt động trên nền tảng.",
    },
    {
      title: "Sẻ chia",
      description:
        "Khuyến khích chia sẻ kinh nghiệm học tập, làm việc và hỗ trợ thế hệ sinh viên tiếp theo.",
    },
  ],
  communityLinks: [
    {
      label: "Giới thiệu Trường & dự án",
      description:
        "Khám phá Đại học Đà Lạt và mục tiêu kết nối toàn trường của DLU Alumni.",
      href: "/about",
    },
    {
      label: "Hoạt động & sự kiện",
      description: "Theo dõi lịch gặp gỡ, talkshow và hoạt động của cộng đồng.",
      href: "/events",
    },
    {
      label: "Góc chia sẻ",
      description:
        "Đọc câu chuyện và kinh nghiệm từ sinh viên, cựu sinh viên ở nhiều ngành học.",
      href: "/experiences",
    },
    {
      label: "Hỗ trợ & góp ý",
      description: "Gửi câu hỏi, báo lỗi hoặc đề xuất cải thiện DLU Alumni.",
      href: "/contact",
    },
  ],
  sources: {
    university: "https://dlu.edu.vn/",
    history: "https://50nam.dlu.edu.vn/lich-su/",
    overview: "https://dlu.edu.vn/loi-ngo-cua-hieu-truong/",
    logo: "https://dlu.edu.vn/logo-truong-dai-hoc-da-lat/",
    campus: "https://csv.dlu.edu.vn/",
  },
} as const;
