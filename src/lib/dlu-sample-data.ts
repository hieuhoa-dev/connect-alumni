/**
 * Dữ liệu mẫu phong phú dành riêng cho Mạng lưới Cựu sinh viên & Sinh viên Trường Đại học Đà Lạt (DLU)
 * Chuẩn bị cho đồ án tốt nghiệp: Trực quan, phong phú, sát thực tế địa phương và chuyên ngành.
 */

export interface DLUCompany {
  id?: string;
  name: string;
  industry: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  verificationStatus?: "verified" | "pending" | "rejected";
}

export interface DLUJob {
  id: string;
  title: string;
  jobType: "full_time" | "internship" | "part_time";
  location: string;
  salaryRange: string;
  description: string;
  requirements?: string;
  benefits?: string;
  applyUrlOrEmail?: string;
  expiresAt: string;
  company: DLUCompany;
}

export interface DLUEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  locationOrLink: string;
  coverImageUrl: string;
  type: string;
  format: "offline" | "online";
  registrations: any[];
}

export interface DLUExperience {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  tags: string[];
  author: {
    name: string;
    profile?: {
      fullName?: string;
      bio?: string;
      avatarUrl?: string;
    };
  };
}

export interface DLUScholarship {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  applicationDeadline: string;
  pledges: any[];
  applications: any[];
}

export const sampleDLUJobs: DLUJob[] = [
  {
    id: "dlu-job-1",
    title: "Kỹ sư Phát triển Phần mềm & AI Solutions",
    jobType: "full_time",
    location: "TP. Đà Lạt & Hybrid",
    salaryRange: "18.000.000 - 32.000.000 đ",
    description:
      "Phát triển các ứng dụng giải pháp chuyển đổi số, nông nghiệp công nghệ cao và hệ thống quản lý dữ liệu lớn cho các đối tác chiến lược của Đại học Đà Lạt.",
    requirements:
      "Tốt nghiệp ngành Công nghệ Thông tin, Kỹ thuật Phần mềm (Ưu tiên cựu SV hoặc SV năm cuối DLU). Thành thạo TypeScript, React/Next.js, Python, hiểu biết về IoT hoặc mô hình AI là lợi thế.",
    benefits:
      "Lương thưởng tháng 13-14, gói bảo hiểm sức khỏe VIP, môi trường làm việc trong lành tại Đà Lạt kết hợp làm việc từ xa.",
    applyUrlOrEmail: "careers@dalathasfarm.com",
    expiresAt: "2026-11-30",
    company: {
      id: "comp-hasfarm",
      name: "Tập đoàn Công nghệ & Nông nghiệp Cao Dalat Hasfarm Tech",
      industry: "Công nghệ thông tin & Nông nghiệp số",
      website: "https://dalathasfarm.com",
      description: "Tập đoàn hoa và nông nghiệp công nghệ cao hàng đầu Châu Á, hợp tác chiến lược cùng Trường ĐH Đà Lạt.",
      logoUrl: "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-2",
    title: "Chuyên viên Quản trị Khách sạn & Du lịch Nghỉ dưỡng Cao cấp",
    jobType: "full_time",
    location: "TP. Đà Lạt, Lâm Đồng",
    salaryRange: "15.000.000 - 25.000.000 đ",
    description:
      "Quản trị vận hành dịch vụ khách hàng, điều phối sự kiện quốc tế tại chuỗi resort 5 sao do cựu sinh viên DLU điều hành.",
    requirements:
      "Tốt nghiệp chuyên ngành Du lịch, Khách sạn, Quản trị Kinh doanh, Tiếng Anh giao tiếp lưu loát IELTS 6.0+, kỹ năng xử lý tình huống linh hoạt.",
    benefits:
      "Phụ cấp lưu trú và ăn uống cao cấp, cơ hội luân chuyển tu nghiệp tại các khách sạn 5 sao quốc tế.",
    applyUrlOrEmail: "hr@dalatpalace.vn",
    expiresAt: "2026-12-15",
    company: {
      id: "comp-palace",
      name: "Dalat Palace Luxury Resort & Heritage",
      industry: "Du lịch & Khách sạn",
      website: "https://dalatpalacehotel.com",
      description: "Khách sạn di sản tiêu chuẩn 5 sao lâu đời bậc nhất xứ sở ngàn hoa Đà Lạt.",
      logoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-3",
    title: "Chuyên viên Nghiên cứu Công nghệ Sinh học & Môi trường",
    jobType: "full_time",
    location: "TP. Đà Lạt",
    salaryRange: "14.000.000 - 22.000.000 đ",
    description:
      "Tham gia các dự án nuôi cấy mô, lai tạo giống cây đặc hữu Tây Nguyên và kiểm định chất lượng giống thực vật.",
    requirements:
      "Tốt nghiệp Cử nhân hoặc Thạc sĩ Sinh học, Công nghệ Sinh học, Khoa học Môi trường DLU. Kỹ năng thực hành phòng lab cẩn thận, tỉ mỉ.",
    benefits:
      "Được tài trợ kinh phí nghiên cứu khoa học, công bố bài báo quốc tế và học bổng sau đại học.",
    applyUrlOrEmail: "tuyendung@vienbiotech-dlu.vn",
    expiresAt: "2026-11-25",
    company: {
      id: "comp-biotech",
      name: "Viện Sinh học Tây Nguyên & BioTech Lab DLU",
      industry: "Công nghệ sinh học & Khoa học đời sống",
      website: "https://taynguyenbiotech.gov.vn",
      description: "Trung tâm nghiên cứu sinh học hàng đầu khu vực Tây Nguyên trực thuộc viện hàn lâm.",
      logoUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-4",
    title: "Thực tập sinh Lập trình Web Fullstack (Intern)",
    jobType: "internship",
    location: "TP. Hồ Chí Minh & Remote",
    salaryRange: "6.000.000 - 10.000.000 đ",
    description:
      "Chương trình bảo trợ thực tập dành riêng cho sinh viên năm 3, năm 4 Đại học Đà Lạt từ công ty công nghệ của cựu sinh viên K38.",
    requirements:
      "Sinh viên năm 3 hoặc năm cuối khoa CNTT. Nắm vững HTML/CSS/JS, React hoặc Node.js, tinh thần ham học hỏi và cầu tiến.",
    benefits:
      "Được cựu sinh viên DLU trực tiếp mentor 1-on-1, hỗ trợ dấu mộc thực tập đồ án tốt nghiệp, cơ hội ký hợp đồng chính thức sau 3 tháng.",
    applyUrlOrEmail: "recruitment@fpt-alumni.vn",
    expiresAt: "2026-12-30",
    company: {
      id: "comp-fpt",
      name: "FPT Software & DLU Alumni Network",
      industry: "Công nghệ thông tin",
      website: "https://fptsoftware.com",
      description: "Doanh nghiệp công nghệ toàn cầu với mạng lưới đông đảo cựu sinh viên DLU công tác.",
      logoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-5",
    title: "Kỹ sư IoT & Tự động hóa Nông nghiệp Thông minh",
    jobType: "full_time",
    location: "TP. Đà Lạt & Lâm Đồng",
    salaryRange: "16.000.000 - 28.000.000 đ",
    description:
      "Thiết kế, lắp đặt và tối ưu hệ thống cảm biến độ ẩm, nhiệt độ, tưới tiêu tự động và quản lý nhà kính vi khí hậu cho các trang trại dâu tây và hoa lan.",
    requirements:
      "Tốt nghiệp Điện tử, Tự động hóa, CNTT hoặc Kỹ thuật Nông nghiệp. Có kinh nghiệm với vi điều khiển ESP32, MQTT, LoRaWAN.",
    benefits:
      "Thưởng dự án theo mùa vụ, xe đưa đón nội bộ đến các nông trại thực nghiệm, phụ cấp công tác.",
    applyUrlOrEmail: "iot-agri@highlandtech.vn",
    expiresAt: "2026-12-20",
    company: {
      id: "comp-highland",
      name: "Highland Smart AgTech Corporation",
      industry: "Nông nghiệp công nghệ cao",
      website: "https://highlandagri.vn",
      description: "Tiên phong giải pháp IoT nông nghiệp thông minh tại cao nguyên Lâm Viên.",
      logoUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-6",
    title: "Chuyên viên Truyền thông & Marketing Nông sản Đặc sản",
    jobType: "full_time",
    location: "TP. Đà Lạt",
    salaryRange: "12.000.000 - 20.000.000 đ",
    description:
      "Xây dựng chiến dịch nội dung quảng bá các dòng đặc sản Đà Lạt (Atiso, mứt dâu, hồng treo gió, trà hoa vàng) trên các kênh số và sàn thương mại điện tử.",
    requirements:
      "Tốt nghiệp ngành Marketing, Quản trị Kinh doanh, Ngữ văn hoặc Xã hội học DLU. Khả năng viết lách cảm xúc, sáng tạo video ngắn TikTok/Reels.",
    benefits:
      "Chiết khấu sản phẩm 30%, tham gia các sự kiện văn hóa Festival Hoa Đà Lạt thường niên.",
    applyUrlOrEmail: "hr@langfarm.com",
    expiresAt: "2026-11-15",
    company: {
      id: "comp-langfarm",
      name: "L'angfarm Đà Lạt — Chuỗi Đặc sản Cao cấp",
      industry: "Bán lẻ & Thương mại điện tử",
      website: "https://langfarm.com",
      description: "Thương hiệu nông đặc sản uy tín hàng đầu Lâm Đồng với hơn 40 cửa hàng toàn quốc.",
      logoUrl: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-7",
    title: "Thực tập sinh Quản trị Nhà hàng & Khách sạn 5 Sao",
    jobType: "internship",
    location: "TP. Đà Lạt",
    salaryRange: "5.000.000 - 8.000.000 đ",
    description:
      "Thực tập tại bộ phận Tiền sảnh (Front Desk), F&B và Điều phối Sự kiện tại quần thể biệt thự Pháp cổ kính Ana Mandara.",
    requirements:
      "Sinh viên năm 3, 4 chuyên ngành Du lịch, Khách sạn, Ngoại ngữ. Ngoại hình sáng, giao tiếp tự tin, chăm chỉ.",
    benefits:
      "Phụ cấp bữa ăn, đồng phục, cấp chứng nhận thực tập quốc tế và ưu tiên nhận chính thức sau ra trường.",
    applyUrlOrEmail: "careers@anamandara-resort.vn",
    expiresAt: "2026-12-05",
    company: {
      id: "comp-ana",
      name: "Ana Mandara Villas Dalat Resort & Spa",
      industry: "Du lịch & Khách sạn",
      website: "https://anamandara-resort.com",
      description: "Khu nghỉ dưỡng di sản kiến trúc Pháp ẩn mình giữa đồi thông mộng mơ.",
      logoUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-8",
    title: "Giảng viên & Trợ giảng Tiếng Anh Học thuật (Part-time)",
    jobType: "part_time",
    location: "TP. Đà Lạt",
    salaryRange: "8.000.000 - 15.000.000 đ",
    description:
      "Trực tiếp giảng dạy và trợ giảng các lớp luyện thi IELTS, TOEIC và tiếng Anh giao tiếp cho sinh viên Đại học Đà Lạt.",
    requirements:
      "Sinh viên năm cuối hoặc cựu sinh viên chuyên ngành Sư phạm Tiếng Anh, Ngôn ngữ Anh DLU. IELTS từ 7.0 trở lên hoặc chứng chỉ tương đương.",
    benefits:
      "Lịch dạy linh hoạt theo ca sáng/tối, môi trường sư phạm thân thiện, nâng cao nghiệp vụ sư phạm.",
    applyUrlOrEmail: "language@dlu-center.edu.vn",
    expiresAt: "2026-11-28",
    company: {
      id: "comp-lang-center",
      name: "Trung tâm Ngoại ngữ & Hợp tác Quốc tế DLU",
      industry: "Giáo dục & Đào tạo",
      website: "https://languages.dlu.edu.vn",
      description: "Đơn vị đào tạo ngoại ngữ và liên kết trao đổi sinh viên quốc tế trực thuộc trường.",
      logoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-9",
    title: "Data Analyst & Kỹ sư Phân tích Dữ liệu Nông nghiệp",
    jobType: "full_time",
    location: "TP. Đà Lạt & Đức Trọng",
    salaryRange: "15.000.000 - 26.000.000 đ",
    description:
      "Phân tích chuỗi giá trị nông sản, dự báo năng suất cây trồng theo điều kiện thời tiết cao nguyên bằng Python, SQL và PowerBI.",
    requirements:
      "Tốt nghiệp Toán - Tin, Khoa học Dữ liệu, CNTT hoặc Kinh tế Nông nghiệp. Có khả năng trình bày dữ liệu dạng dashboard trực quan.",
    benefits:
      "Laptop làm việc cấu hình cao, thưởng dự án theo quý, tham gia các hội thảo Data Science trong nước.",
    applyUrlOrEmail: "data-hr@cpgroup.vn",
    expiresAt: "2026-12-10",
    company: {
      id: "comp-cpgroup",
      name: "Tập đoàn Nông nghiệp & Dữ liệu C.P. Lâm Đồng",
      industry: "Nông nghiệp công nghệ cao & Dữ liệu",
      website: "https://cp.com.vn",
      description: "Đối tác tài trợ thiết bị và tiếp nhận hàng trăm cựu sinh viên DLU hàng năm.",
      logoUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-10",
    title: "Kỹ sư Phần mềm Mobile (Flutter / React Native)",
    jobType: "full_time",
    location: "TP. Hồ Chí Minh & Remote Đà Lạt",
    salaryRange: "20.000.000 - 35.000.000 đ",
    description:
      "Phát triển các tính năng thanh toán, ví điện tử và dịch vụ số phục vụ hàng chục triệu người dùng trong nước.",
    requirements:
      "Ít nhất 1 năm kinh nghiệm với Flutter hoặc React Native. Cựu sinh viên DLU các ngành CNTT, KTPM.",
    benefits:
      "Chế độ làm việc từ xa (Remote) hoàn toàn nếu sinh sống tại Đà Lạt, gói chăm sóc sức khỏe gia đình, thưởng Tết hào phóng.",
    applyUrlOrEmail: "recruitment@momo.vn",
    expiresAt: "2026-12-25",
    company: {
      id: "comp-momo",
      name: "Công ty Cổ phần Dịch vụ Di động Trực tuyến (MoMo)",
      industry: "Công nghệ thông tin & FinTech",
      website: "https://momo.vn",
      description: "Siêu ứng dụng thanh toán và tài chính công nghệ hàng đầu Việt Nam.",
      logoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-11",
    title: "Thực tập sinh Nhân sự & Tuyển dụng (HR Talent Acquisition Intern)",
    jobType: "internship",
    location: "TP. Hồ Chí Minh & Online",
    salaryRange: "6.000.000 - 9.000.000 đ",
    description:
      "Tham gia xây dựng mối quan hệ kết nối giữa doanh nghiệp và các trường đại học, tổ chức ngày hội việc làm và sourcing ứng viên công nghệ.",
    requirements:
      "Sinh viên năm 3, 4 ngành Quản trị Nhân lực, Luật, Quản trị Kinh doanh, Xã hội học DLU. Kỹ năng giao tiếp xuất sắc.",
    benefits:
      "Trải nghiệm môi trường công nghệ kỳ lân VNG, vé xe về quê dịp lễ tết, lộ trình thăng tiến rõ ràng.",
    applyUrlOrEmail: "hr@vng.com.vn",
    expiresAt: "2026-12-15",
    company: {
      id: "comp-vng",
      name: "Tập đoàn VNG Corporation",
      industry: "Công nghệ thông tin & Game",
      website: "https://vng.com.vn",
      description: "Kỳ lân công nghệ đầu tiên tại Việt Nam, đối tác chiến lược của Đại học Đà Lạt.",
      logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-12",
    title: "Chuyên viên Thiết kế Đồ họa & Sáng tạo Truyền thông (Part-time)",
    jobType: "part_time",
    location: "TP. Đà Lạt",
    salaryRange: "7.000.000 - 12.000.000 đ",
    description:
      "Thiết kế ấn phẩm truyền thông, poster sự kiện, bộ nhận diện thương hiệu cho các sự kiện văn hóa nghệ thuật của sinh viên và cựu sinh viên.",
    requirements:
      "Sử dụng tốt Photoshop, Illustrator, Figma. Có gu thẩm mỹ tinh tế, yêu mến phong cách tối giản thanh lịch của Đà Lạt.",
    benefits:
      "Thời gian tự do, được trang bị phòng làm việc view thung lũng thông, thưởng theo từng dự án thiết kế.",
    applyUrlOrEmail: "creative@dalatstudio.vn",
    expiresAt: "2026-11-20",
    company: {
      id: "comp-studio",
      name: "Dalat Creative House & Media Hub",
      industry: "Truyền thông & Thiết kế",
      website: "https://dalatcreative.vn",
      description: "Tổ hợp sáng tạo nội dung nghệ thuật của nhóm cựu sinh viên Khoa Quốc tế học.",
      logoUrl: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-13",
    title: "Chuyên viên Phát triển Thị trường Xuất khẩu Cà phê Đặc sản",
    jobType: "full_time",
    location: "TP. Đà Lạt & Cầu Đất",
    salaryRange: "15.000.000 - 30.000.000 đ",
    description:
      "Quản lý đơn hàng xuất khẩu hạt cà phê Arabica Cầu Đất sang thị trường Nhật Bản, Hàn Quốc và Châu Âu; đón tiếp đoàn đối tác quốc tế.",
    requirements:
      "Tốt nghiệp ngành Kinh tế Quốc tế, Ngoại ngữ hoặc Nông nghiệp. Tiếng Anh thương mại tốt, am hiểu về cà phê đặc sản là điểm cộng lớn.",
    benefits:
      "Hoa hồng theo doanh số xuất khẩu không giới hạn, du lịch nước ngoài hàng năm cùng đối tác.",
    applyUrlOrEmail: "export@caudatfarm.com",
    expiresAt: "2026-12-18",
    company: {
      id: "comp-caudat",
      name: "Cầu Đất Farm 1927 — Di sản Cà phê Arabica",
      industry: "Nông nghiệp & Xuất khẩu",
      website: "https://caudatfarm.com",
      description: "Vùng trồng và chế biến cà phê Arabica vang danh toàn cầu từ năm 1927 tại Đà Lạt.",
      logoUrl: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-14",
    title: "Kỹ sư Cảnh quan Đô thị & Quy hoạch Rừng Cao nguyên",
    jobType: "full_time",
    location: "TP. Đà Lạt",
    salaryRange: "14.000.000 - 24.000.000 đ",
    description:
      "Tham gia tư vấn thiết kế mảng xanh đô thị, bảo tồn rừng thông cảnh quan và tôn tạo công viên hoa thành phố hướng đến Festival Hoa Quốc tế.",
    requirements:
      "Tốt nghiệp ngành Quản lý Đất đai, Lâm nghiệp, Nông học hoặc Kiến trúc Cảnh quan DLU. Sử dụng tốt AutoCAD, GIS.",
    benefits:
      "Chế độ công chức/viên chức theo quy định hoặc hợp đồng dài hạn, nhà công vụ cho ứng viên xa nhà.",
    applyUrlOrEmail: "tuyendung@moitruongdothi-dalat.vn",
    expiresAt: "2026-11-22",
    company: {
      id: "comp-urban",
      name: "Công ty Cổ phần Quản lý Đô thị & Cảnh quan Đà Lạt",
      industry: "Môi trường & Quy hoạch Cảnh quan",
      website: "https://moitruongdothidalat.vn",
      description: "Đơn vị bảo tồn và kiến tạo không gian xanh thơ mộng của thành phố mộng mơ.",
      logoUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-15",
    title: "Thực tập sinh Kế toán & Quản trị Tài chính Doanh nghiệp",
    jobType: "internship",
    location: "TP. Đà Lạt",
    salaryRange: "5.500.000 - 8.500.000 đ",
    description:
      "Thực tập kiểm toán nội bộ, đối soát hóa đơn chứng từ, hỗ trợ báo cáo thuế và quản trị dòng tiền cho chuỗi bán lẻ du lịch.",
    requirements:
      "Sinh viên năm cuối ngành Kế toán, Tài chính - Ngân hàng, Quản trị Kinh doanh DLU. Thành thạo Excel, phần mềm MISA là lợi thế.",
    benefits:
      "Được cựu sinh viên K30 là Kế toán trưởng chỉ dạy tận tình, hỗ trợ số liệu làm khóa luận tốt nghiệp đạt điểm cao.",
    applyUrlOrEmail: "ketoan@dalathospitality.vn",
    expiresAt: "2026-12-12",
    company: {
      id: "comp-ttc",
      name: "Tập đoàn Du lịch & Dịch vụ TTC Hospitality",
      industry: "Tài chính & Dịch vụ Khách hàng",
      website: "https://ttchospitality.vn",
      description: "Tập đoàn sở hữu nhiều điểm du lịch nổi tiếng tại Thung Lũng Tình Yêu & Đồi Mộng Mơ.",
      logoUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-16",
    title: "Nhân viên Vận hành Chuỗi Cung ứng & Kho lạnh Nông sản (Part-time)",
    jobType: "part_time",
    location: "Đức Trọng & TP. Đà Lạt",
    salaryRange: "8.500.000 - 14.000.000 đ",
    description:
      "Giám sát nhiệt độ chuỗi kho lạnh (Cold Chain), phân loại rau củ chuẩn VietGAP và đóng gói hàng xuất kho chuyển sân bay Liên Khương.",
    requirements:
      "Sinh viên các ngành Kỹ thuật hoặc Nông nghiệp. Nhanh nhẹn, cẩn thận, có thể làm việc theo ca bán thời gian.",
    benefits:
      "Hỗ trợ tiền cơm ca, bảo hiểm tai nạn 24/7, trợ cấp thâm niên làm việc trong thời gian còn đi học.",
    applyUrlOrEmail: "logistics@dalatexpress.vn",
    expiresAt: "2026-11-29",
    company: {
      id: "comp-coldchain",
      name: "Dalat Cold Chain & Express Logistics",
      industry: "Vận tải & Kho bãi Logistics",
      website: "https://dalatcoldchain.vn",
      description: "Hệ thống chuỗi cung ứng lạnh chuyên nghiệp kết nối nông sản Đà Lạt đến khắp cả nước.",
      logoUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-17",
    title: "Kỹ sư Trí tuệ Nhân tạo & LLMs (AI Solutions Engineer)",
    jobType: "full_time",
    location: "TP. Đà Lạt & Remote",
    salaryRange: "25.000.000 - 45.000.000 đ",
    description:
      "Nghiên cứu ứng dụng các mô hình ngôn ngữ lớn (LLMs), RAG và thị giác máy tính vào hệ thống định danh giống cây trồng và quản lý hồ sơ sinh viên thông minh.",
    requirements:
      "Tốt nghiệp ngành Công nghệ Thông tin, Kỹ thuật Phần mềm, Toán - Tin DLU. Thành thạo Python, PyTorch, LangChain/LlamaIndex, kinh nghiệm fine-tuning hoặc xây dựng AI Agent.",
    benefits:
      "Thưởng dự án AI lên đến 4 tháng lương/năm, tài trợ toàn bộ tài khoản GPU Cloud (NVIDIA H100), cơ hội công tác tại văn phòng Tokyo và Singapore.",
    applyUrlOrEmail: "ai-lab@fpt.com",
    expiresAt: "2026-12-31",
    company: {
      id: "comp-fpt-ai",
      name: "FPT Software AI Center",
      industry: "Công nghệ thông tin & AI",
      website: "https://fpt-aicenter.com",
      description: "Trung tâm nghiên cứu và phát triển giải pháp trí tuệ nhân tạo quy mô toàn cầu.",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-18",
    title: "Chuyên viên An toàn Thông tin & Giám sát SOC (Security Analyst)",
    jobType: "full_time",
    location: "TP. Đà Lạt, Lâm Đồng",
    salaryRange: "18.000.000 - 30.000.000 đ",
    description:
      "Trực vận hành hệ thống giám sát an ninh mạng SOC, phân tích log sự cố bảo mật, rà quét lỗ hổng và bảo vệ hạ tầng dữ liệu số cho tỉnh Lâm Đồng.",
    requirements:
      "Cử nhân chuyên ngành An toàn Thông tin, Mạng máy tính hoặc CNTT. Có kiến thức về SIEM, Wireshark, kiến thức chứng chỉ CompTIA Security+, CEH là lợi thế.",
    benefits:
      "Bảo hiểm sức khỏe cao cấp 24/7, phụ cấp chứng chỉ quốc tế 2.000.000 đ/tháng, môi trường làm việc chuẩn an ninh quốc gia.",
    applyUrlOrEmail: "sec-careers@vnpt-lamdong.vn",
    expiresAt: "2026-12-28",
    company: {
      id: "comp-vnpt",
      name: "Tập đoàn Bưu chính Viễn thông VNPT Lâm Đồng",
      industry: "Viễn thông & An toàn thông tin",
      website: "https://vnptlamdong.vn",
      description: "Nhà cung cấp hạ tầng số và giải pháp chính quyền điện tử hàng đầu tại địa phương.",
      logoUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-19",
    title: "Chuyên viên Pháp chế & Sở hữu Trí tuệ Nông sản Cao nguyên",
    jobType: "full_time",
    location: "TP. Đà Lạt",
    salaryRange: "14.000.000 - 22.000.000 đ",
    description:
      "Thực hiện thủ tục đăng ký nhãn hiệu, chỉ dẫn địa lý và bảo vệ bản quyền giống cây trồng Đà Lạt; soạn thảo và thẩm định hợp đồng thương mại quốc tế.",
    requirements:
      "Tốt nghiệp Cử nhân Luật (ưu tiên khoa Luật DLU). Nắm vững Luật Sở hữu trí tuệ, Luật Doanh nghiệp, tiếng Anh pháp lý đọc hiểu tốt.",
    benefits:
      "Hỗ trợ kinh phí tham gia các khóa đào tạo Luật sư tại Học viện Tư pháp, phụ cấp thâm niên và du lịch hàng năm.",
    applyUrlOrEmail: "phapche@dalatlaw.vn",
    expiresAt: "2026-11-30",
    company: {
      id: "comp-law",
      name: "Hãng Luật & Tư vấn Sở hữu Trí tuệ Cao Nguyên",
      industry: "Tư vấn Pháp lý & Sở hữu trí tuệ",
      website: "https://caonguyenlaw.vn",
      description: "Tổ chức hành nghề luật uy tín do cựu sinh viên Khoa Luật Trường ĐH Đà Lạt sáng lập.",
      logoUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-20",
    title: "Kỹ sư Giống Cây Trồng In-vitro & Vi sinh Nông nghiệp",
    jobType: "full_time",
    location: "Đơn Dương & TP. Đà Lạt",
    salaryRange: "15.000.000 - 25.000.000 đ",
    description:
      "Chỉ đạo kỹ thuật phòng nuôi cấy mô tế bào thực vật, chuyển giao quy trình nhân giống hoa lan, dâu tây và khoai tây sạch bệnh thế hệ mới.",
    requirements:
      "Tốt nghiệp Cử nhân hoặc Thạc sĩ Nông học, Công nghệ Sinh học DLU. Tối thiểu 1 năm kinh nghiệm quản lý phòng nuôi cấy mô hoặc phòng thí nghiệm.",
    benefits:
      "Nhà lưu trú miễn phí tại trang trại, xe đưa đón nội bộ, thưởng sản lượng cây giống xuất vườn định kỳ.",
    applyUrlOrEmail: "invitro@bioseed-dlu.vn",
    expiresAt: "2026-12-15",
    company: {
      id: "comp-bioseed",
      name: "Trung tâm Giống Cây Trồng Công nghệ cao BioSeed Dalat",
      industry: "Công nghệ sinh học & Nông nghiệp",
      website: "https://bioseed.vn",
      description: "Đơn vị cung ứng cây giống nuôi cấy mô chất lượng cao lớn nhất khu vực Nam Tây Nguyên.",
      logoUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-21",
    title: "Chuyên viên Quản trị Khách sạn Quốc tế & Quan hệ Du khách VIP",
    jobType: "full_time",
    location: "Hồ Tuyền Lâm, TP. Đà Lạt",
    salaryRange: "16.000.000 - 28.000.000 đ",
    description:
      "Chăm sóc đoàn khách ngoại giao và khách VIP quốc tế nghỉ dưỡng tại hồ Tuyền Lâm; điều phối các dạ tiệc và hội nghị thượng đỉnh doanh nhân.",
    requirements:
      "Tốt nghiệp ngành Du lịch, Khách sạn, Quốc tế học hoặc Ngoại ngữ DLU. Tiếng Anh lưu loát, ưu tiên biết thêm tiếng Pháp hoặc tiếng Hàn.",
    benefits:
      "Chế độ nghỉ dưỡng 5 sao miễn phí trên toàn hệ thống resort, xe đưa đón từ trung tâm TP. Đà Lạt mỗi ngày.",
    applyUrlOrEmail: "vip-guest@edenseeresort.com",
    expiresAt: "2026-12-22",
    company: {
      id: "comp-edensee",
      name: "Dalat Edensee Lake Resort & Spa",
      industry: "Du lịch & Khách sạn",
      website: "https://dalatedensee.com",
      description: "Khu nghỉ dưỡng sinh thái cao cấp bên bờ hồ Tuyền Lâm thơ mộng.",
      logoUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-22",
    title: "Thực tập sinh Phân tích Dữ liệu Kinh doanh (Business Intelligence Intern)",
    jobType: "internship",
    location: "TP. Hồ Chí Minh & Remote",
    salaryRange: "7.000.000 - 11.000.000 đ",
    description:
      "Trích xuất và trực quan hóa dữ liệu hành vi người dùng, đánh giá hiệu quả chiến dịch khuyến mãi bằng SQL, Tableau và Google Looker Studio.",
    requirements:
      "Sinh viên năm 3, 4 chuyên ngành Toán - Tin, Khoa học Máy tính, Hệ thống Thông tin Quản lý hoặc Thống kê DLU. Tư duy logic nhạy bén.",
    benefits:
      "Phụ cấp thực tập cạnh tranh, được tiếp cận nguồn dữ liệu quy mô hàng triệu giao dịch, trợ cấp mua thiết bị làm việc.",
    applyUrlOrEmail: "bi-interns@grab.vn",
    expiresAt: "2026-12-10",
    company: {
      id: "comp-grab",
      name: "Grab Vietnam Technology R&D",
      industry: "Công nghệ thông tin & Dữ liệu",
      website: "https://grab.com/vn",
      description: "Tập đoàn công nghệ vận tải và dịch vụ số đa quốc gia.",
      logoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-23",
    title: "Kỹ sư Phần cứng Nhúng & Firmware IoT Nông nghiệp",
    jobType: "full_time",
    location: "TP. Đà Lạt & TP. Hồ Chí Minh",
    salaryRange: "18.000.000 - 32.000.000 đ",
    description:
      "Lập trình C/C++ vi điều khiển ARM Cortex-M, STM32, thiết kế mạch PCB cho các trạm quan trắc khí tượng và điều khiển tưới nhỏ giọt tự động.",
    requirements:
      "Tốt nghiệp ngành Kỹ thuật Điện - Điện tử, Vật lý Kỹ thuật hoặc CNTT. Có kinh nghiệm hàn mạch, đo kiểm tín hiệu dao động ký.",
    benefits:
      "Thưởng sáng chế và giải pháp hữu ích, xét tăng lương 2 lần/năm, tài trợ toàn bộ chi phí thi chứng chỉ kỹ sư chuyên nghiệp.",
    applyUrlOrEmail: "embedded@viettelhightech.com",
    expiresAt: "2026-12-20",
    company: {
      id: "comp-viettel",
      name: "Viettel High Technology Industries",
      industry: "Phần cứng & Viễn thông",
      website: "https://viettelhightech.vn",
      description: "Tổng công ty Công nghiệp Công nghệ cao trực thuộc Tập đoàn Viettel.",
      logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-24",
    title: "Giáo viên Toán & Khoa học Tự nhiên Song ngữ (Part-time / Full-time)",
    jobType: "part_time",
    location: "TP. Đà Lạt",
    salaryRange: "9.000.000 - 18.000.000 đ",
    description:
      "Giảng dạy chương trình Toán và Khoa học bằng tiếng Anh cho học sinh phổ thông liên cấp quốc tế tại TP. Đà Lạt.",
    requirements:
      "Tốt nghiệp Sư phạm Toán, Sư phạm Vật lý, Sư phạm Hóa học hoặc Ngôn ngữ Anh DLU. Phát âm tiếng Anh chuẩn, nhiệt huyết với nghề giáo.",
    benefits:
      "Thời gian linh động, môi trường giáo dục khai phóng, được tập huấn phương pháp giáo dục STEM/STEAM hiện đại.",
    applyUrlOrEmail: "recruitment@dalat-academy.edu.vn",
    expiresAt: "2026-11-25",
    company: {
      id: "comp-academy",
      name: "Trường Quốc tế Song ngữ Cao nguyên (Highland Academy)",
      industry: "Giáo dục & Đào tạo",
      website: "https://highlandacademy.edu.vn",
      description: "Hệ thống trường song ngữ quốc tế hàng đầu khu vực Tây Nguyên.",
      logoUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-25",
    title: "Chuyên viên Phân tích Môi trường & Bản đồ GIS Đất đai",
    jobType: "full_time",
    location: "TP. Đà Lạt & Lâm Hà",
    salaryRange: "13.000.000 - 21.000.000 đ",
    description:
      "Thu thập mẫu nước, mẫu đất rừng đầu nguồn hồ Than Thở và Suối Vàng; số hóa dữ liệu bản đồ hiện trạng rừng bằng ArcGIS và QGIS.",
    requirements:
      "Tốt nghiệp chuyên ngành Khoa học Môi trường, Quản lý Đất đai, Địa lý hoặc Nông học DLU. Kỹ năng làm việc thực địa tốt.",
    benefits:
      "Phụ cấp độc hại phòng lab, công tác phí thực địa chu đáo, cơ hội quy hoạch cán bộ nguồn của tỉnh.",
    applyUrlOrEmail: "moitruong@tnmt-lamdong.gov.vn",
    expiresAt: "2026-12-14",
    company: {
      id: "comp-env",
      name: "Trung tâm Quan trắc Tài nguyên & Môi trường Lâm Đồng",
      industry: "Môi trường & Khoa học Trái đất",
      website: "https://tnmt.lamdong.gov.vn",
      description: "Đơn vị nghiên cứu và giám sát chất lượng môi trường trực thuộc Sở Tài nguyên & Môi trường.",
      logoUrl: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-26",
    title: "Chuyên viên Tư vấn Tài chính & Quản lý Danh mục Đầu tư",
    jobType: "full_time",
    location: "TP. Đà Lạt & TP. Hồ Chí Minh",
    salaryRange: "15.000.000 - 35.000.000 đ",
    description:
      "Tư vấn giải pháp tài chính cá nhân, quản lý tài sản và phân bổ danh mục cổ phiếu, trái phiếu cho khách hàng doanh nghiệp tại Lâm Đồng.",
    requirements:
      "Tốt nghiệp ngành Tài chính - Ngân hàng, Kinh tế hoặc Kế toán DLU. Nhanh nhạy với tin tức thị trường chứng khoán, chứng chỉ hành nghề là điểm cộng.",
    benefits:
      "Hoa hồng giao dịch hấp dẫn không giới hạn trần, thưởng nóng theo tháng, chương trình đào tạo chuyên sâu từ các chuyên gia CFA.",
    applyUrlOrEmail: "hr-dalat@ssi.com.vn",
    expiresAt: "2026-12-25",
    company: {
      id: "comp-ssi",
      name: "Công ty Cổ phần Chứng khoán SSI — Chi nhánh Đà Lạt",
      industry: "Tài chính & Chứng khoán",
      website: "https://ssi.com.vn",
      description: "Định chế tài chính và công ty chứng khoán hàng đầu thị trường vốn Việt Nam.",
      logoUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-27",
    title: "Thực tập sinh Quản lý Dự án Công nghệ (Project Management Intern)",
    jobType: "internship",
    location: "TP. Đà Lạt & Online",
    salaryRange: "6.000.000 - 9.500.000 đ",
    description:
      "Hỗ trợ Project Manager theo dõi tiến độ sprint Scrum/Agile, ghi nhận yêu cầu khách hàng và tổ chức họp review sản phẩm phần mềm.",
    requirements:
      "Sinh viên năm cuối ngành Kỹ thuật Phần mềm, Hệ thống Thông tin hoặc Quản trị Kinh doanh DLU. Khả năng tổ chức, quản lý thời gian tốt.",
    benefits:
      "Được cấp tài khoản Jira/Confluence bản quyền doanh nghiệp, cơ hội trở thành Junior PM sau khi tốt nghiệp.",
    applyUrlOrEmail: "pm-intern@vng.com.vn",
    expiresAt: "2026-12-18",
    company: {
      id: "comp-vng-pm",
      name: "Tập đoàn VNG Corporation",
      industry: "Công nghệ thông tin & Game",
      website: "https://vng.com.vn",
      description: "Kỳ lân công nghệ hàng đầu Việt Nam, đối tác chiến lược tuyển dụng của Trường Đại học Đà Lạt.",
      logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
      verificationStatus: "verified",
    },
  },
  {
    id: "dlu-job-28",
    title: "Kỹ sư Nuôi cấy Nấm Dược liệu & Chiết xuất Hoạt chất Sinh học",
    jobType: "full_time",
    location: "TP. Đà Lạt & Lạc Dương",
    salaryRange: "16.000.000 - 27.000.000 đ",
    description:
      "Vận hành phòng thí nghiệm nhân giống nấm Đông Trùng Hạ Thảo và nấm Linh Chi đỏ; kiểm định hàm lượng cordycepin và polysaccharide bằng HPLC.",
    requirements:
      "Tốt nghiệp Cử nhân hoặc Thạc sĩ Công nghệ Sinh học, Hóa học hoặc Dược học DLU. Cẩn thận, yêu thích công việc phòng thí nghiệm và sản xuất sạch.",
    benefits:
      "Được sử dụng miễn phí sản phẩm bảo vệ sức khỏe của công ty, thưởng sáng kiến kỹ thuật, phụ cấp nhà ở.",
    applyUrlOrEmail: "biopharm@highlandcordy.vn",
    expiresAt: "2026-12-28",
    company: {
      id: "comp-cordy",
      name: "Dalat BioPharm & Cordyceps Highland Corporation",
      industry: "Công nghệ sinh học & Dược phẩm",
      website: "https://biopharmhighland.vn",
      description: "Thương hiệu đông trùng hạ thảo và dược liệu quý ứng dụng công nghệ sinh học cao nguyên.",
      logoUrl: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=200",
      verificationStatus: "verified",
    },
  },
];

export const sampleDLUEvents: DLUEvent[] = [
  {
    id: "dlu-event-1",
    title: "DLU REUNION 2026: HÀNH TRÌNH TRỞ VỀ MÁI TRƯỜNG HOA & RỪNG THÔNG",
    description:
      "Đại hội Hội ngộ Cựu sinh viên các thế hệ Trường Đại học Đà Lạt. Giao lưu truyền thống, vinh danh cựu sinh viên tiêu biểu và trao Quỹ học bổng Tiếp sức đến trường.",
    startTime: "2026-11-20T08:00:00",
    locationOrLink:
      "Hội trường Thư viện Trung tâm - Trường Đại học Đà Lạt (01 Phù Đổng Thiên Vương, TP. Đà Lạt)",
    coverImageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    type: "Gala Thường Niên",
    format: "offline",
    registrations: new Array(285).fill(0),
  },
  {
    id: "dlu-event-2",
    title: "Tọa đàm: Xu hướng Nghề nghiệp & Cơ hội Phát triển cho Sinh viên Đại học Đà Lạt",
    description:
      "Buổi chia sẻ thực tế cùng 4 diễn giả là Cựu sinh viên DLU đang giữ vị trí lãnh đạo doanh nghiệp tại TP.HCM, Hà Nội và Đà Lạt.",
    startTime: "2026-10-25T14:00:00",
    locationOrLink: "Giảng đường A1 - Trường Đại học Đà Lạt & Trực tuyến qua Zoom",
    coverImageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    type: "Talkshow Hướng Nghiệp",
    format: "offline",
    registrations: new Array(142).fill(0),
  },
  {
    id: "dlu-event-3",
    title: "Ngày hội Phỏng vấn Tuyển dụng Doanh nghiệp Đối tác DLU Career Day 2026",
    description:
      "Hơn 30 tập đoàn và doanh nghiệp đối tác trực tiếp phỏng vấn tuyển dụng sinh viên tốt nghiệp và cựu sinh viên Trường Đại học Đà Lạt.",
    startTime: "2026-11-05T08:00:00",
    locationOrLink: "Sân đa năng Khu A - Trường Đại học Đà Lạt",
    coverImageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    type: "Ngày hội Việc làm",
    format: "offline",
    registrations: new Array(520).fill(0),
  },
  {
    id: "dlu-event-4",
    title: "Hackathon DLU 2026: Giải pháp AI & Nông nghiệp Công nghệ cao",
    description:
      "Cuộc thi lập trình 48 giờ dành cho sinh viên và cựu sinh viên DLU xây dựng sản phẩm công nghệ ứng dụng giải quyết bài toán nông nghiệp cao nguyên.",
    startTime: "2026-12-05T08:30:00",
    locationOrLink: "Không gian Sáng tạo Khởi nghiệp DLU Innovation Hub",
    coverImageUrl:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    type: "Cuộc thi Công nghệ",
    format: "offline",
    registrations: new Array(180).fill(0),
  },
];

export const sampleDLUExperiences: DLUExperience[] = [
  {
    id: "dlu-exp-1",
    title: "HÀNH TRÌNH TỪ GIẢNG ĐƯỜNG ĐẠI HỌC ĐÀ LẠT ĐẾN GIÁM ĐỐC CÔNG NGHỆ TẠI TP.HCM",
    content:
      "Đà Lạt với những buổi sáng mù sương trên đồi thông và thư viện DLU yên tĩnh đã rèn luyện cho tôi tính kiên trì, tự học. Bài học lớn nhất tôi mang theo vào đời chính là tinh thần trách nhiệm và lòng say mê với nghề.",
    publishedAt: "2026-10-05",
    tags: ["SuNghiep", "CuuSinhVienDLU", "KhoiNghiep"],
    author: {
      name: "Nguyễn Thanh Bình",
      profile: {
        fullName: "Nguyễn Thanh Bình (Cựu SV Khóa K32)",
        bio: "CTO Công ty Cổ phần Công nghệ SmartCity",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
      },
    },
  },
  {
    id: "dlu-exp-2",
    title: "GẶP GỠ CỰU SINH VIÊN KHOA DU LỊCH DLU – TỔNG QUẢN LÝ RESORT NGHỈ DƯỠNG",
    content:
      "Ngành Du lịch tại Đại học Đà Lạt luôn có nét đẹp rất riêng: chuyên nghiệp, thân thiện và giàu lòng hiếu khách. Bí quyết thành công là luôn giữ thái độ tích cực và sẵn sàng lắng nghe khách hàng.",
    publishedAt: "2026-09-28",
    tags: ["DuLich", "QuanTri", "TruyenCamHung"],
    author: {
      name: "Trần Mai Lan",
      profile: {
        fullName: "Trần Mai Lan (Cựu SV Khóa K35)",
        bio: "Tổng Quản lý Ana Mandara Villas Dalat",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
      },
    },
  },
  {
    id: "dlu-exp-3",
    title: "CÂU CHUYỆN VƯỢT NGHỊCH CẢNH CỦA CỰU SINH VIÊN SƯ PHẠM VÙNG CAO",
    content:
      "Những ngày tháng học tập tại Trường Đại học Đà Lạt đã tiếp thêm cho tôi nghị lực để mang con chữ và tri thức khoa học đến với các em học sinh vùng đồng bào dân tộc thiểu số Tây Nguyên.",
    publishedAt: "2026-09-15",
    tags: ["SuPham", "GiaoDuc", "TuHaoDLU"],
    author: {
      name: "Hoàng Văn Nam",
      profile: {
        fullName: "Hoàng Văn Nam (Cựu SV Khóa K36)",
        bio: "Hiệu phó Trường THCS Dân tộc Nội trú",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      },
    },
  },
  {
    id: "dlu-exp-4",
    title: "TỪ SINH VIÊN NÔNG HỌC DLU ĐẾN CHỦ TRANG TRẠI NÔNG NGHIỆP CÔNG NGHỆ CAO",
    content:
      "Tận dụng khí hậu ôn hòa của cao nguyên Lâm Viên và kiến thức được thầy cô Đại học Đà Lạt chỉ dạy, tôi đã mạnh dạn áp dụng mô hình thủy canh hồi lưu và nông nghiệp số tự động hóa.",
    publishedAt: "2026-09-02",
    tags: ["NongNghiepSo", "HighTech", "KhoiNghiepDLU"],
    author: {
      name: "Lê Quốc Thịnh",
      profile: {
        fullName: "Lê Quốc Thịnh (Cựu SV Khóa K34)",
        bio: "Nhà sáng lập Green Highland Farm",
        avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
      },
    },
  },
];

export const sampleDLUScholarships: DLUScholarship[] = [
  {
    id: "dlu-sch-1",
    title: "Quỹ Khuyến Học Đại Học Đà Lạt 2026: Tiếp Sức Sinh Viên Vượt Khó Hiếu Học",
    description:
      "Chương trình gây quỹ thường niên do Mạng lưới Cựu sinh viên Trường Đại học Đà Lạt cùng các Doanh nghiệp đối tác tài trợ, trao học bổng toàn phần và bán phần cho sinh viên có hoàn cảnh khó khăn.",
    targetAmount: 500000000,
    currentAmount: 385000000,
    deadline: "2026-11-20",
    applicationDeadline: "2026-11-20",
    pledges: new Array(32).fill(0),
    applications: new Array(48).fill(0),
  },
  {
    id: "dlu-sch-2",
    title: "Học Bổng Cựu Sinh Viên DLU: Đồng Hành Cùng Tài Năng Trẻ Đổi Mới Sáng Tạo",
    description:
      "Trao tặng các nhóm sinh viên có đề tài nghiên cứu khoa học xuất sắc, sản phẩm khởi nghiệp tiềm năng đóng góp cho sự phát triển của tỉnh Lâm Đồng và Tây Nguyên.",
    targetAmount: 300000000,
    currentAmount: 220000000,
    deadline: "2026-12-15",
    applicationDeadline: "2026-12-15",
    pledges: new Array(18).fill(0),
    applications: new Array(35).fill(0),
  },
];
