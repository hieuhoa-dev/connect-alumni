/**
 * Dữ liệu mẫu phong phú dành cho Mạng lưới Cựu sinh viên Trường Đại học Đà Lạt (DLU)
 * Đảm bảo mọi chức năng đều có dữ liệu trực quan, hoạt động 100%.
 */

export interface DLUJob {
  id: string;
  title: string;
  jobType: "full_time" | "internship" | "part_time";
  location: string;
  salaryRange: string;
  description: string;
  requirements?: string;
  expiresAt: string;
  company: {
    name: string;
    logoUrl?: string;
  };
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
    description: "Phát triển các ứng dụng giải pháp chuyển đổi số, nông nghiệp công nghệ cao và hệ thống quản lý dữ liệu lớn cho các đối tác chiến lược của Đại học Đà Lạt.",
    expiresAt: "2026-11-30",
    company: {
      name: "Tập đoàn Công nghệ & Nông nghiệp Cao Dalat Hasfarm Tech",
    },
  },
  {
    id: "dlu-job-2",
    title: "Chuyên viên Quản trị Khách sạn & Du lịch Nghỉ dưỡng Cao cấp",
    jobType: "full_time",
    location: "TP. Đà Lạt, Lâm Đồng",
    salaryRange: "15.000.000 - 25.000.000 đ",
    description: "Quản trị vận hành dịch vụ khách hàng, điều phối sự kiện quốc tế tại chuỗi resort 5 sao do cựu sinh viên DLU điều hành.",
    expiresAt: "2026-12-15",
    company: {
      name: "Dalat Palace Luxury Resort & Heritage",
    },
  },
  {
    id: "dlu-job-3",
    title: "Chuyên viên Nghiên cứu Công nghệ Sinh học & Môi trường",
    jobType: "full_time",
    location: "TP. Đà Lạt",
    salaryRange: "14.000.000 - 22.000.000 đ",
    description: "Tham gia các dự án nuôi cấy mô, lai tạo giống cây đặc hữu Tây Nguyên và kiểm định chất lượng giống thực vật.",
    expiresAt: "2026-11-25",
    company: {
      name: "Viện Sinh học Tây Nguyên & BioTech Lab DLU",
    },
  },
  {
    id: "dlu-job-4",
    title: "Thực tập sinh Lập trình Web Fullstack (Intern)",
    jobType: "internship",
    location: "TP. Hồ Chí Minh & Remote",
    salaryRange: "6.000.000 - 10.000.000 đ",
    description: "Chương trình bảo trợ thực tập dành riêng cho sinh viên năm 3, năm 4 Đại học Đà Lạt từ công ty công nghệ của cựu sinh viên K38.",
    expiresAt: "2026-12-30",
    company: {
      name: "FPT Software & DLU Alumni Network",
    },
  },
];

export const sampleDLUEvents: DLUEvent[] = [
  {
    id: "dlu-event-1",
    title: "DLU REUNION 2026: HÀNH TRÌNH TRỞ VỀ MÁI TRƯỜNG HOA & RỪNG THÔNG",
    description: "Đại hội Hội ngộ Cựu sinh viên các thế hệ Trường Đại học Đà Lạt. Giao lưu truyền thống, vinh danh cựu sinh viên tiêu biểu và trao Quỹ học bổng Tiếp sức đến trường.",
    startTime: "2026-11-20T08:00:00",
    locationOrLink: "Hội trường Thư viện Trung tâm - Trường Đại học Đà Lạt (01 Phù Đổng Thiên Vương, TP. Đà Lạt)",
    coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    type: "Gala Thường Niên",
    format: "offline",
    registrations: new Array(285).fill(0),
  },
  {
    id: "dlu-event-2",
    title: "Tọa đàm: Xu hướng Nghề nghiệp & Cơ hội Phát triển cho Sinh viên Đại học Đà Lạt",
    description: "Buổi chia sẻ thực tế cùng 4 diễn giả là Cựu sinh viên DLU đang giữ vị trí lãnh đạo doanh nghiệp tại TP.HCM, Hà Nội và Đà Lạt.",
    startTime: "2026-10-25T14:00:00",
    locationOrLink: "Giảng đường A1 - Trường Đại học Đà Lạt & Trực tuyến qua Zoom",
    coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    type: "Talkshow Hướng Nghiệp",
    format: "offline",
    registrations: new Array(142).fill(0),
  },
  {
    id: "dlu-event-3",
    title: "Ngày hội Phỏng vấn Tuyển dụng Doanh nghiệp Đối tác DLU Career Day 2026",
    description: "Hơn 30 tập đoàn và doanh nghiệp đối tác trực tiếp phỏng vấn tuyển dụng sinh viên tốt nghiệp và cựu sinh viên Trường Đại học Đà Lạt.",
    startTime: "2026-11-05T08:00:00",
    locationOrLink: "Sân đa năng Khu A - Trường Đại học Đà Lạt",
    coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    type: "Ngày hội Việc làm",
    format: "offline",
    registrations: new Array(520).fill(0),
  },
];

export const sampleDLUExperiences: DLUExperience[] = [
  {
    id: "dlu-exp-1",
    title: "HÀNH TRÌNH TỪ GIẢNG ĐƯỜNG ĐẠI HỌC ĐÀ LẠT ĐẾN GIÁM ĐỐC CÔNG NGHỆ TẠI TP.HCM",
    content: "Đà Lạt với những buổi sáng mù sương trên đồi thông và thư viện DLU yên tĩnh đã rèn luyện cho tôi tính kiên trì, tự học. Bài học lớn nhất tôi mang theo vào đời chính là tinh thần trách nhiệm và lòng say mê với nghề.",
    publishedAt: "2026-10-05",
    tags: ["SuNghiep", "CuuSinhVienDLU", "KhoiNghiep"],
    author: {
      name: "Nguyễn Thanh Bình",
      profile: {
        fullName: "Nguyễn Thanh Bình (Cựu SV Khóa K32)",
        bio: "CTO Công ty Cổ phần Công nghệ SmartCity",
      },
    },
  },
  {
    id: "dlu-exp-2",
    title: "GẶP GỠ CỰU SINH VIÊN KHOA DU LỊCH DLU – TỔNG QUẢN LÝ RESORT NGHỈ DƯỠNG",
    content: "Ngành Du lịch tại Đại học Đà Lạt luôn có nét đẹp rất riêng: chuyên nghiệp, thân thiện và giàu lòng hiếu khách. Bí quyết thành công là luôn giữ thái độ tích cực và sẵn sàng lắng nghe khách hàng.",
    publishedAt: "2026-09-28",
    tags: ["DuLich", "QuanTri", "TruyenCamHung"],
    author: {
      name: "Trần Mai Lan",
      profile: {
        fullName: "Trần Mai Lan (Cựu SV Khóa K35)",
        bio: "Tổng Quản lý Ana Mandara Villas Dalat",
      },
    },
  },
  {
    id: "dlu-exp-3",
    title: "CÂU CHUYỆN VƯỢT NGHỊCH CẢNH CỦA CỰU SINH VIÊN SƯ PHẠM VÙNG CAO",
    content: "Những ngày tháng học tập tại Trường Đại học Đà Lạt đã tiếp thêm cho tôi nghị lực để mang con chữ và tri thức khoa học đến với các em học sinh vùng đồng bào dân tộc thiểu số Tây Nguyên.",
    publishedAt: "2026-09-15",
    tags: ["SuPham", "GiaoDuc", "TuHaoDLU"],
    author: {
      name: "Hoàng Văn Nam",
      profile: {
        fullName: "Hoàng Văn Nam (Cựu SV Khóa K36)",
        bio: "Hiệu phó Trường THCS Dân tộc Nội trú",
      },
    },
  },
  {
    id: "dlu-exp-4",
    title: "TỪ SINH VIÊN NÔNG HỌC DLU ĐẾN CHỦ TRANG TRẠI NÔNG NGHIỆP CÔNG NGHỆ CAO",
    content: "Tận dụng khí hậu ôn hòa của cao nguyên Lâm Viên và kiến thức được thầy cô Đại học Đà Lạt chỉ dạy, tôi đã mạnh dạn áp dụng mô hình thủy canh hồi lưu và nông nghiệp số tự động hóa.",
    publishedAt: "2026-09-02",
    tags: ["NongNghiepSo", "HighTech", "KhoiNghiepDLU"],
    author: {
      name: "Lê Quốc Thịnh",
      profile: {
        fullName: "Lê Quốc Thịnh (Cựu SV Khóa K34)",
        bio: "Nhà sáng lập Green Highland Farm",
      },
    },
  },
];

export const sampleDLUScholarships: DLUScholarship[] = [
  {
    id: "dlu-sch-1",
    title: "Quỹ Khuyến Học Đại Học Đà Lạt 2026: Tiếp Sức Sinh Viên Vượt Khó Hiếu Học",
    description: "Chương trình gây quỹ thường niên do Mạng lưới Cựu sinh viên Trường Đại học Đà Lạt cùng các Doanh nghiệp đối tác tài trợ, trao học bổng toàn phần và bán phần cho sinh viên có hoàn cảnh khó khăn.",
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
    description: "Trao tặng các nhóm sinh viên có đề tài nghiên cứu khoa học xuất sắc, sản phẩm khởi nghiệp tiềm năng đóng góp cho sự phát triển của tỉnh Lâm Đồng và Tây Nguyên.",
    targetAmount: 300000000,
    currentAmount: 220000000,
    deadline: "2026-12-15",
    applicationDeadline: "2026-12-15",
    pledges: new Array(18).fill(0),
    applications: new Array(35).fill(0),
  },
];
