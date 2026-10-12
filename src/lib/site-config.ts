/**
 * Thông tin tham chiếu công khai của Khoa CNTT, Trường Đại học Đà Lạt.
 * Đối chiếu nguồn chính thức ngày 12/10/2026; chi tiết tại docs/DLU_REFERENCE.md.
 * mission, vision và values là mục tiêu của Connect Alumni, không phải tuyên bố
 * chính thức của Khoa. board là danh sách Khoa công bố ngày 25/12/2023.
 */
const facultyUrl = "https://cntt.dlu.edu.vn/";
const alumniBoardUrl =
  "https://cntt.dlu.edu.vn/ban-lien-lac-cuu-sinh-vien-khoa-cntt/";
const anniversaryUrl =
  "https://cntt.dlu.edu.vn/le-ky-niem-20-nam-thanh-lap-khoa-cong-nghe-thong-tin-truong-dai-hoc-da-lat-2003-2023/";
const address =
  "Tầng 2, Tòa nhà A7, 01 Phù Đổng Thiên Vương, Phường Lâm Viên – Đà Lạt, tỉnh Lâm Đồng";

export const SITE = {
  appName: "Connect Alumni",
  facultyName: "Khoa Công nghệ Thông tin",
  facultyShortName: "Khoa CNTT · Đại học Đà Lạt",
  universityName: "Trường Đại học Đà Lạt",
  facultyUrl,
  universityUrl: "https://dlu.edu.vn/",
  alumniUrl: "https://cntt.dlu.edu.vn/category/sinh-vien/cuu-sinh-vien/",
  aboutUrl: "https://cntt.dlu.edu.vn/gioi-thieu-khoa-cong-nghe-thong-tin/",
  alumniBoardUrl,
  address,
  email: "it@dlu.edu.vn",
  phone: "0911 843 962",
  phoneHref: "tel:+84911843962",
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
  founded: 2003,
  lastVerified: "2026-10-12",
  mission:
    "Connect Alumni hướng đến kết nối sinh viên và cựu sinh viên Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt với cơ hội nghề nghiệp, hoạt động cộng đồng và nguồn lực khuyến học.",
  vision:
    "Xây dựng một không gian kết nối để các thế hệ sinh viên CNTT Đà Lạt cùng chia sẻ kinh nghiệm và đồng hành trên hành trình nghề nghiệp.",
  values: [
    {
      title: "Kết nối",
      description:
        "Giúp sinh viên, cựu sinh viên và doanh nghiệp tìm thấy những cơ hội đồng hành phù hợp.",
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
  milestones: [
    {
      year: "2003",
      text: "Thành lập Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt.",
      sourceUrl: anniversaryUrl,
    },
    {
      year: "2023",
      text: "Ra mắt Ban liên lạc Hội cựu sinh viên Khoa CNTT tại lễ kỷ niệm 20 năm thành lập Khoa, ngày 14/10/2023.",
      sourceUrl: anniversaryUrl,
    },
  ],
  boardPublishedAt: "25/12/2023",
  board: [
    {
      name: "Đặng Đình Lành",
      title: "Cựu sinh viên CTK31",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Hoàng Văn Vinh",
      title: "Cựu sinh viên CTK29",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Lê Phú Lộc",
      title: "Cựu sinh viên CTK35",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Lê Quang Hoàng",
      title: "Cựu sinh viên CTK32",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Lê Thị Thanh Hậu",
      title: "Cựu sinh viên CTK35CD",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Nguyễn Đoàn Quang Thái",
      title: "Cựu sinh viên CTK33",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Nguyễn Thị Thúy Anh",
      title: "Cựu sinh viên CTK30CD",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Nguyễn Trọng Vũ",
      title: "Cựu sinh viên CTK28CD",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Phạm Trung Anh Vũ",
      title: "Cựu sinh viên CTK40",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Phan Viện",
      title: "Cựu sinh viên CTK27",
      sourceUrl: alumniBoardUrl,
    },
    {
      name: "Tôn Tất Tâm Nguyên",
      title: "Cựu sinh viên CTK34",
      sourceUrl: alumniBoardUrl,
    },
  ],
  specializations: [
    {
      name: "Kỹ thuật phần mềm",
      href: "https://cntt.dlu.edu.vn/chuyen-nganh-ky-thuat-phan-mem/",
    },
    {
      name: "Khoa học dữ liệu",
      href: "https://cntt.dlu.edu.vn/chuyen-nganh-khoa-hoc-du-lieu/",
    },
    {
      name: "Mạng máy tính",
      href: "https://cntt.dlu.edu.vn/chuyen-nganh-mang-may-tinh/",
    },
  ],
  officialLinks: [
    {
      label: "Website Khoa CNTT",
      description: "Tin tức, thông báo và thông tin đào tạo do Khoa công bố.",
      href: facultyUrl,
    },
    {
      label: "Cựu sinh viên Khoa CNTT",
      description: "Hoạt động và thông tin dành cho cựu sinh viên của Khoa.",
      href: "https://cntt.dlu.edu.vn/category/sinh-vien/cuu-sinh-vien/",
    },
    {
      label: "Cổng cựu sinh viên Đại học Đà Lạt",
      description: "Không gian kết nối cựu sinh viên trên phạm vi toàn Trường.",
      href: "https://csv.dlu.edu.vn/",
    },
    {
      label: "Trường Đại học Đà Lạt",
      description: "Thông tin chung và các thông báo trên website của Trường.",
      href: "https://dlu.edu.vn/",
    },
  ],
  sources: {
    homepage: facultyUrl,
    contact:
      "https://cntt.dlu.edu.vn/en/cam-nang-danh-cho-sinh-vien-nganh-cntt-khoa-50/",
    history: anniversaryUrl,
    board: alumniBoardUrl,
    address: "https://csv.dlu.edu.vn/gioi-thieu",
    annualReport:
      "https://dlu.edu.vn/wp-content/uploads/2025/10/1134-BC-DHDL-Bao-cao-thuong-nien-nam-2025.pdf",
  },
} as const;
