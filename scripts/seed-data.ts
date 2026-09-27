import "dotenv/config";
import { db } from "../src/db";
import { auth } from "../src/lib/auth";
import {
  profiles,
  companies,
  companyMembers,
  jobPosts,
  events,
  eventSpeakers,
  eventRegistrations,
  experiencePosts,
  forms,
  formQuestions,
  scholarshipCampaigns,
  donationPledges,
  scholarshipApplications,
  auditLogs,
  notifications,
  user,
} from "../src/db/schema";
import { eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// SEED DATA CONFIGURATION (JSON ARRAYS)
// ═══════════════════════════════════════════════════════════════════════════

export const SEED_USERS = [
  // 1. Ban Lãnh đạo & Quản trị viên Khoa
  {
    email: "admin@khoacntt.edu.vn",
    password: "Password123!",
    name: "TS. Nguyễn Văn Quản Trị",
    role: "admin" as const,
    faculty: "Công nghệ Thông tin",
    phone: "0901234567",
    bio: "Trưởng Khoa kiêm Quản trị viên hệ thống Mạng lưới Cựu sinh viên Khoa CNTT",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
  },
  {
    email: "staff@khoacntt.edu.vn",
    password: "Password123!",
    name: "ThS. Trần Thị Giáo Vụ",
    role: "faculty_staff" as const,
    faculty: "Công nghệ Thông tin",
    phone: "0902345678",
    bio: "Phó Trưởng Bộ môn - Phụ trách Quan hệ Doanh nghiệp & Hoạt động Cựu sinh viên",
    avatarUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
  },
  {
    email: "staff.haidang@khoacntt.edu.vn",
    password: "Password123!",
    name: "ThS. Lê Hải Đăng",
    role: "faculty_staff" as const,
    faculty: "Công nghệ Thông tin",
    phone: "0902345699",
    bio: "Giảng viên phụ trách Công tác Sinh viên & Quản lý Quỹ Học bổng Tài năng",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  },

  // 2. Mạng lưới Cựu sinh viên (Alumni qua các thế hệ)
  {
    email: "alumni.le@gmail.com",
    password: "Password123!",
    name: "Lê Hoàng Nam",
    role: "alumni" as const,
    faculty: "Công nghệ Thông tin",
    batchYear: 2018,
    graduationYear: 2022,
    phone: "0903456789",
    bio: "Tech Lead tại FPT Software | Cựu sinh viên K18 | Chuyên môn Cloud & Kiến trúc Microservices",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  },
  {
    email: "alumni.mai@gmail.com",
    password: "Password123!",
    name: "Vũ Thị Thanh Mai",
    role: "alumni" as const,
    faculty: "Công nghệ Thông tin",
    batchYear: 2017,
    graduationYear: 2021,
    phone: "0904567890",
    bio: "Senior Product Manager tại VNG Corporation | Cựu sinh viên K17",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  },
  {
    email: "alumni.quoc@gmail.com",
    password: "Password123!",
    name: "Trần Bảo Quốc",
    role: "alumni" as const,
    faculty: "Công nghệ Thông tin",
    batchYear: 2016,
    graduationYear: 2020,
    phone: "0908889999",
    bio: "Principal Software Engineer tại MoMo | Cựu sinh viên K16 | Speaker System Design",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
  },
  {
    email: "alumni.linh@gmail.com",
    password: "Password123!",
    name: "Đỗ Thùy Linh",
    role: "alumni" as const,
    faculty: "Công nghệ Thông tin",
    batchYear: 2019,
    graduationYear: 2023,
    phone: "0907778888",
    bio: "AI Research Engineer tại Viettel AI | Cựu sinh viên K19 | Tác giả bài báo khoa học quốc tế",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
  },
  {
    email: "alumni.khang@techstartup.vn",
    password: "Password123!",
    name: "Nguyễn Đình Khang",
    role: "alumni" as const,
    faculty: "Công nghệ Thông tin",
    batchYear: 2015,
    graduationYear: 2019,
    phone: "0906665555",
    bio: "Co-Founder & CTO tại NextGen Solutions | Cựu sinh viên K15",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200",
  },

  // 3. Sinh viên đang theo học (Students)
  {
    email: "student.hoa@khoacntt.edu.vn",
    password: "Password123!",
    name: "Nguyễn Tiến Hoa",
    role: "student" as const,
    studentCode: "21110045",
    faculty: "Công nghệ Thông tin",
    batchYear: 2021,
    phone: "0905678901",
    bio: "Sinh viên năm cuối ngành Kỹ thuật Phần mềm (K21), GPA 3.65/4.0, đam mê Fullstack Web và AI Agent",
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
  },
  {
    email: "student.tuan@khoacntt.edu.vn",
    password: "Password123!",
    name: "Phạm Minh Tuấn",
    role: "student" as const,
    studentCode: "22110112",
    faculty: "Công nghệ Thông tin",
    batchYear: 2022,
    phone: "0905123456",
    bio: "Sinh viên năm 3 ngành Khoa học Máy tính (K22), thành viên CLB Học thuật & Nghiên cứu Khoa học",
    avatarUrl:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200",
  },
  {
    email: "student.linh@khoacntt.edu.vn",
    password: "Password123!",
    name: "Hoàng Khánh Linh",
    role: "student" as const,
    studentCode: "23110250",
    faculty: "Công nghệ Thông tin",
    batchYear: 2023,
    phone: "0905987654",
    bio: "Sinh viên năm 2 ngành Hệ thống Thông tin (K23), Bí thư Chi đoàn, tích cực hoạt động tình nguyện",
    avatarUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
  },

  // 4. Doanh nghiệp Công nghệ Đối tác (Employers)
  {
    email: "hr@vng.com.vn",
    password: "Password123!",
    name: "Phạm Thu Trang (HR VNG)",
    role: "employer" as const,
    phone: "0906789012",
    bio: "Lead Talent Acquisition - VNG Corporation",
    avatarUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
  },
  {
    email: "hr@fpt.com.vn",
    password: "Password123!",
    name: "Đặng Tuấn Anh (HR FPT)",
    role: "employer" as const,
    phone: "0907890123",
    bio: "Head of University Relations - FPT Software Global",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
  },
  {
    email: "hr@momo.vn",
    password: "Password123!",
    name: "Nguyễn Hải Yến (HR MoMo)",
    role: "employer" as const,
    phone: "0908123987",
    bio: "Talent Acquisition Partner - Công ty Cổ phần Dịch vụ Di động Trực tuyến (MoMo)",
    avatarUrl:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=200",
  },
  {
    email: "hr@viettel.vn",
    password: "Password123!",
    name: "Bùi Trọng Nhân (HR Viettel)",
    role: "employer" as const,
    phone: "0909654321",
    bio: "Giám đốc Tuyển dụng & Đào tạo Nhân tài Công nghệ - Viettel Telecom",
    avatarUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200",
  },
];

export const SEED_COMPANIES = [
  {
    name: "VNG Corporation",
    description:
      "Tập đoàn công nghệ kỳ lân đầu tiên tại Việt Nam, phát triển Zalo, ZaloPay, Game Publishing toàn cầu và nền tảng AI Cloud.",
    industry: "Internet & Nền tảng số",
    website: "https://vng.com.vn",
    logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
    ownerEmail: "hr@vng.com.vn",
    roleInCompany: "Lead Talent Acquisition",
  },
  {
    name: "FPT Software",
    description:
      "Công ty xuất khẩu phần mềm lớn nhất Đông Nam Á với hơn 30.000 kỹ sư phục vụ khách hàng Fortune 500 tại Nhật Bản, Mỹ và châu Âu.",
    industry: "Dịch vụ CNTT & Chuyển đổi số",
    website: "https://fptsoftware.com",
    logoUrl:
      "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=200",
    ownerEmail: "hr@fpt.com.vn",
    roleInCompany: "Head of University Relations",
  },
  {
    name: "MoMo (M_Service)",
    description:
      "Siêu ứng dụng tài chính số hàng đầu Việt Nam phục vụ hơn 31 triệu người dùng với hạ tầng phân tán xử lý hàng chục triệu giao dịch mỗi ngày.",
    industry: "Công nghệ Tài chính (Fintech)",
    website: "https://momo.vn",
    logoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=200",
    ownerEmail: "hr@momo.vn",
    roleInCompany: "Talent Acquisition Partner",
  },
  {
    name: "Viettel Telecom & Digital",
    description:
      "Tập đoàn Công nghiệp - Viễn thông Quân đội, tiên phong làm chủ hạ tầng viễn thông 5G, Trung tâm Dữ liệu và giải pháp AI phục vụ quốc gia.",
    industry: "Viễn thông & Công nghệ Cao",
    website: "https://viettel.vn",
    logoUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200",
    ownerEmail: "hr@viettel.vn",
    roleInCompany: "HR Director",
  },
];

export const SEED_JOBS = [
  {
    companyName: "VNG Corporation",
    title: "Thực tập sinh Lập trình Web Fullstack (Next.js / Node.js)",
    description:
      "Tham gia trực tiếp vào đội ngũ phát triển sản phẩm Zalo Mini Apps và hệ thống quản trị nội bộ phục vụ hàng triệu người dùng tại VNG Campus.",
    requirements:
      "Nắm chắc kiến thức cấu trúc dữ liệu và giải thuật, HTML/CSS/JavaScript hiện đại, quen thuộc React hoặc Next.js. Tư duy giải quyết vấn đề tốt.",
    location: "VNG Campus, Quận 7, TP. Hồ Chí Minh",
    jobType: "internship" as const,
    salaryRange: "8.000.000 - 12.000.000 VNĐ/tháng",
    applyUrlOrEmail: "recruitment@vng.com.vn",
  },
  {
    companyName: "VNG Corporation",
    title: "Backend Engineer (Go / Node.js) - ZaloPay Core Payments",
    description:
      "Thiết kế, xây dựng và tối ưu các dịch vụ xử lý thanh toán thời gian thực với độ trễ siêu thấp và khả năng chịu tải hàng chục nghìn TPS.",
    requirements:
      "Tối thiểu 1 năm kinh nghiệm phát triển Backend với Go hoặc Node.js. Nắm vững cơ sở dữ liệu PostgreSQL, Redis, Apache Kafka và kiến trúc Microservices.",
    location: "TP. Hồ Chí Minh (Chế độ Hybrid linh hoạt)",
    jobType: "full_time" as const,
    salaryRange: "22.000.000 - 38.000.000 VNĐ",
    applyUrlOrEmail: "talents@vng.com.vn",
  },
  {
    companyName: "FPT Software",
    title: "Kỹ sư Trí tuệ Nhân tạo & Xử lý Ngôn ngữ Tự nhiên (AI/LLM Engineer)",
    description:
      "Nghiên cứu ứng dụng các mô hình ngôn ngữ lớn (LLMs), xây dựng hệ thống Retrieval-Augmented Generation (RAG) và các AI Agents cho đối tác tại Mỹ & Nhật Bản.",
    requirements:
      "Thành thạo Python, PyTorch/TensorFlow, thư viện LangChain/LlamaIndex. Có kinh nghiệm làm việc với Vector Database (Pinecone, pgvector).",
    location: "F-Town 3, Khu Công nghệ Cao, TP. Thủ Đức",
    jobType: "full_time" as const,
    salaryRange: "25.000.000 - 45.000.000 VNĐ",
    applyUrlOrEmail: "fpt-careers@fpt.com",
  },
  {
    companyName: "FPT Software",
    title: "Fresher Cloud DevOps & Site Reliability Engineer",
    description:
      "Được đào tạo bài bản 3 tháng có lương về hạ tầng Cloud (AWS/Azure), containerization với Docker, điều phối Kubernetes và tự động hóa CI/CD pipelines.",
    requirements:
      "Sinh viên mới tốt nghiệp hoặc chuẩn bị tốt nghiệp chuyên ngành CNTT. Có kiến thức cơ bản về Linux OS, Networking, Git và ham học hỏi hạ tầng đám mây.",
    location: "Khu Công nghệ Cao, TP. Thủ Đức",
    jobType: "full_time" as const,
    salaryRange: "12.000.000 - 16.000.000 VNĐ",
    applyUrlOrEmail: "devops-freshers@fpt.com",
  },
  {
    companyName: "MoMo (M_Service)",
    title: "Senior Mobile Engineer (React Native / Native Android/iOS)",
    description:
      "Phát triển các module tiện ích mới trong siêu ứng dụng MoMo, tối ưu hóa kích thước bundle và hiệu năng render nhằm đem lại trải nghiệm mượt mà nhất.",
    requirements:
      "Từ 2 năm kinh nghiệm lập trình React Native hoặc Native iOS/Android. Hiểu sâu về memory management, caching và bảo mật ứng dụng tài chính.",
    location: "Tòa nhà Phú Mỹ Hưng, Quận 7, TP. Hồ Chí Minh",
    jobType: "full_time" as const,
    salaryRange: "30.000.000 - 50.000.000 VNĐ",
    applyUrlOrEmail: "careers@momo.vn",
  },
  {
    companyName: "Viettel Telecom & Digital",
    title: "Kỹ sư Dữ liệu Lớn & Kỹ thuật Dữ liệu (Big Data Engineer)",
    description:
      "Xây dựng data pipelines truyền tải hàng Terabytes dữ liệu viễn thông hàng ngày phục vụ phân tích hành vi người dùng và phòng chống gian lận thời gian thực.",
    requirements:
      "Kinh nghiệm với hệ sinh thái Hadoop/Spark, Kafka, Flink, SQL nâng cao. Tốt nghiệp loại Khá/Giỏi ngành CNTT hoặc Toán tin.",
    location: "Tòa nhà Viettel Complex, Quận 10, TP. Hồ Chí Minh",
    jobType: "full_time" as const,
    salaryRange: "20.000.000 - 40.000.000 VNĐ",
    applyUrlOrEmail: "tuyendung@viettel.com.vn",
  },
];

export const SEED_EVENTS = [
  {
    type: "talkshow" as const,
    title:
      "Talkshow Cựu Sinh Viên: Hành trang phỏng vấn Big Tech & Bí quyết thăng tiến sự nghiệp 2026",
    description:
      "Buổi chia sẻ thân mật cùng các cựu sinh viên tiêu biểu các khóa K16, K17, K18 đang giữ vai trò Tech Lead và Product Manager tại VNG, FPT Software, MoMo. Hướng dẫn chi tiết cách vượt qua vòng Coding Interview và System Design.",
    format: "offline" as const,
    locationOrLink: "Hội trường A, Tòa nhà Điều hành Trung tâm, ĐHQG TP.HCM",
    daysFromNow: 5,
    durationHours: 3,
    capacity: 250,
    coverImageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    speakerEmails: [
      "alumni.le@gmail.com",
      "alumni.mai@gmail.com",
      "alumni.quoc@gmail.com",
    ],
  },
  {
    type: "workshop" as const,
    title:
      "Hands-on Workshop: Xây dựng AI Agents thông minh với Retrieval-Augmented Generation (RAG)",
    description:
      "Thực hành trực tiếp từ số 0 để xây dựng trợ lý AI có khả năng đọc hiểu tài liệu chuyên ngành, sử dụng LangChain, Vector Database và LLMs hiện đại.",
    format: "online" as const,
    locationOrLink: "https://meet.google.com/khoacntt-ai-workshop",
    daysFromNow: 12,
    durationHours: 2.5,
    capacity: 500,
    coverImageUrl:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
    speakerEmails: ["alumni.linh@gmail.com"],
  },
  {
    type: "job_fair" as const,
    title:
      "Ngày hội Việc làm & Kết nối Hợp tác Doanh nghiệp CNTT (IT Career Day 2026)",
    description:
      "Cơ hội phỏng vấn tuyển dụng trực tiếp tại gian hàng với hơn 30 tập đoàn công nghệ hàng đầu (VNG, FPT, MoMo, Viettel,...). Tiếp nhận hàng trăm suất thực tập sinh tiềm năng.",
    format: "offline" as const,
    locationOrLink: "Sảnh lớn Tòa nhà Thư viện Trung tâm Khoa CNTT",
    daysFromNow: 25,
    durationHours: 6,
    capacity: 1000,
    coverImageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800",
    speakerEmails: [],
  },
  {
    type: "talkshow" as const,
    title:
      "Chuyên đề Kỹ thuật: Chuyển dịch Kiến trúc sang Microservices & Cloud-Native trong Hệ thống Tài chính",
    description:
      "Chia sẻ kinh nghiệm thực tế về quản trị dữ liệu phân tán, giải quyết bài toán giao dịch ACID và phân vùng dữ liệu trong siêu ứng dụng tài chính.",
    format: "online" as const,
    locationOrLink: "https://meet.google.com/khoacntt-fintech-microservices",
    daysFromNow: 18,
    durationHours: 2,
    capacity: 300,
    coverImageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
    speakerEmails: ["alumni.quoc@gmail.com", "alumni.khang@techstartup.vn"],
  },
];

export const SEED_EXPERIENCES = [
  {
    authorEmail: "alumni.le@gmail.com",
    title:
      "Lời khuyên từ cựu sinh viên K18: 4 điều sinh viên ngành CNTT cần làm trước khi tốt nghiệp",
    content: `Chào các bạn sinh viên thân mến của Khoa CNTT,

Thấm thoát đã 4 năm kể từ ngày mình nhận bằng tốt nghiệp. Từ vị trí một bạn thực tập sinh bỡ ngỡ bước chân vào doanh nghiệp, đến nay đã làm Tech Lead phụ trách đội ngũ hơn 15 kỹ sư, mình muốn đúc kết 4 bài học quan trọng nhất:

1. **Đừng chỉ học lý thuyết - hãy làm Side Projects có người dùng thật:** Điểm số trên lớp là điều kiện cần, nhưng một profile GitHub với các dự án chỉn chu, có unit test và deploy thực tế chính là thứ giúp CV của bạn vượt trội ngay từ vòng lọc hồ sơ.

2. **Xây dựng Network và giữ kết nối với Thầy Cô, Cựu sinh viên:** Hơn 70% cơ hội việc làm tốt ở cấp độ Mid/Senior đến từ mạng lưới giới thiệu nội bộ (Referral). Hãy chủ động tham gia các buổi chia sẻ của Khoa để mở rộng mối quan hệ.

3. **Ngoại ngữ (đặc biệt là Tiếng Anh) là đòn bẩy thu nhập:** Lập trình giỏi giúp bạn có việc làm, nhưng tiếng Anh lưu loát giúp mức lương của bạn nhân đôi, nhân ba khi làm việc với đối tác quốc tế.

4. **Kỹ năng giao tiếp và làm việc nhóm (Teamwork):** Phần mềm không bao giờ được tạo ra bởi một người đơn lẻ. Hãy học cách lắng nghe, thấu hiểu yêu cầu nghiệp vụ và trình bày ý tưởng kỹ thuật một cách rõ ràng, mạch lạc.

Chúc các bạn sinh viên khóa dưới tự tin và gặt hái thật nhiều thành công!`,
    tags: [
      "Kinh nghiệm",
      "Lộ trình nghề nghiệp",
      "K18",
      "Tech Lead",
      "Fresher",
    ],
    viewCount: 385,
  },
  {
    authorEmail: "alumni.mai@gmail.com",
    title:
      "Hành trình từ Kỹ sư Lập trình chuyển hướng sang Product Manager (PM) tại Big Tech",
    content: `Xuất thân từ dân kỹ thuật Khoa CNTT, mình từng nghĩ cả đời sẽ gắn bó với IDE và những dòng code. Tuy nhiên sau 2 năm làm Software Engineer, mình nhận ra niềm đam mê lớn hơn với việc tìm hiểu hành vi người dùng và định hình sản phẩm.

Một số chia sẻ cho các bạn sinh viên muốn theo đuổi hướng đi Product Management:
- **Lợi thế vượt trội của dân IT làm PM:** Bạn hiểu rõ tính khả thi kỹ thuật, nói chuyện cùng ngôn ngữ với Tech Team và đưa ra estimation chuẩn xác hơn.
- **Rèn luyện tư duy kinh doanh và dữ liệu:** Hãy học cách đọc dữ liệu, phân tích chỉ số người dùng (Retention, Churn rate, Conversion funnel) thay vì chỉ nhìn vào tính năng.
- **Học cách nói "Không":** Một PM giỏi là người biết từ chối các ý tưởng không phù hợp với mục tiêu dài hạn của sản phẩm.`,
    tags: ["Product Management", "Chuyển ngành", "VNG", "K17", "Kỹ năng mềm"],
    viewCount: 260,
  },
  {
    authorEmail: "alumni.quoc@gmail.com",
    title:
      "Bí kíp luyện LeetCode và chuẩn bị phỏng vấn System Design cho sinh viên năm 3, năm 4",
    content: `Rất nhiều bạn sinh viên hỏi mình: 'Anh ơi, công ty lớn phỏng vấn thuật toán khó quá, làm sao để ôn luyện hiệu quả?'

Dưới đây là phương pháp mình đã áp dụng và hướng dẫn cho nhiều bạn đàn em thành công vào các công ty công nghệ hàng đầu:

1. **Đừng giải bừa bãi:** Thay vì làm hàng trăm bài ngẫu nhiên, hãy tập trung vào danh sách 'Blind 75' hoặc 'NeetCode 150'. Nắm vững các pattern chính: Two Pointers, Sliding Window, DFS/BFS, Dynamic Programming.
2. **Luyện tập Mock Interview:** Tìm một người bạn cùng luyện tập, giải thích cách tiếp cận thành tiếng trước khi gõ code. Doanh nghiệp đánh giá cao tư duy logic và cách bạn tiếp nhận gợi ý hơn là code thuộc lòng.
3. **Với System Design:** Đối với sinh viên, các câu hỏi thường xoay quanh thiết kế URL Shortener, Chat System cơ bản hoặc Rate Limiter. Hãy đọc cuốn 'Designing Data-Intensive Applications' và 'System Design Interview' của Alex Xu.`,
    tags: ["LeetCode", "Phỏng vấn", "System Design", "K16", "MoMo"],
    viewCount: 512,
  },
  {
    authorEmail: "alumni.linh@gmail.com",
    title:
      "Lộ trình tự học Trí tuệ Nhân tạo & Machine Learning từ ghế nhà trường",
    content: `Lĩnh vực AI đang bùng nổ mạnh mẽ với sự ra đời của LLMs và Generative AI. Làm thế nào để sinh viên không bị 'ngợp' giữa làn sóng công nghệ này?

- **Củng cố Toán nền tảng:** Đại số tuyến tính, Xác suất thống kê và Giải tích là những môn cực kỳ quan trọng trên giảng đường đại học. Đừng học chống đối!
- **Thực hành với các nền tảng mở:** Tận dụng Google Colab, HuggingFace và Kaggle để rèn luyện kỹ năng xử lý dữ liệu và fine-tuning mô hình.
- **Tham gia Nghiên cứu Khoa học cùng Thầy Cô:** Đây là bước đệm tốt nhất nếu bạn muốn xin học bổng du học Thạc sĩ/Tiến sĩ hoặc ứng tuyển vào các Lab nghiên cứu AI uy tín.`,
    tags: [
      "Trí tuệ nhân tạo",
      "Machine Learning",
      "Viettel AI",
      "K19",
      "Nghiên cứu",
    ],
    viewCount: 420,
  },
];

export const SEED_FORMS = [
  {
    type: "survey" as const,
    title:
      "Khảo sát Tình hình Việc làm & Mức thu nhập Cựu sinh viên Khoa CNTT (K15 - K19)",
    description:
      "Khảo sát định kỳ nhằm thống kê tỷ lệ việc làm, mức thu nhập trung bình và mức độ phù hợp của chương trình đào tạo của Khoa CNTT so với thực tiễn doanh nghiệp.",
    targetBatches: [2015, 2016, 2017, 2018, 2019],
    targetRole: "alumni" as const,
    daysFromNow: 45,
    questions: [
      {
        orderIndex: 0,
        questionType: "single_choice" as const,
        label: "Tình trạng việc làm hiện tại của bạn:",
        options: [
          "Đang có việc làm đúng chuyên ngành đào tạo",
          "Đang có việc làm liên quan đến CNTT",
          "Đang tự khởi nghiệp / Chủ doanh nghiệp",
          "Đang học tập nâng cao (Thạc sĩ, Tiến sĩ)",
          "Đang tìm kiếm cơ hội việc làm mới",
        ],
        isRequired: true,
      },
      {
        orderIndex: 1,
        questionType: "single_choice" as const,
        label: "Mức thu nhập bình quân hàng tháng hiện tại (VNĐ):",
        options: [
          "Dưới 15.000.000 VNĐ",
          "Từ 15.000.000 đến 25.000.000 VNĐ",
          "Từ 25.000.000 đến 40.000.000 VNĐ",
          "Trên 40.000.000 VNĐ",
        ],
        isRequired: true,
      },
      {
        orderIndex: 2,
        questionType: "scale" as const,
        label:
          "Mức độ hài lòng đối với kiến thức nền tảng và chuyên ngành được Khoa đào tạo (1 - 5 sao):",
        isRequired: true,
        config: {
          min: 1,
          max: 5,
          minLabel: "1 - Chưa đáp ứng",
          maxLabel: "5 - Rất tốt, áp dụng cao",
        },
      },
      {
        orderIndex: 3,
        questionType: "long_text" as const,
        label:
          "Góp ý hoặc đề xuất của bạn giúp Khoa cải tiến học phần chuyên ngành và kỹ năng thực tế cho sinh viên khóa sau:",
        isRequired: false,
      },
    ],
  },
  {
    type: "scholarship_application" as const,
    title:
      "Mẫu Đơn Đăng ký Xét duyệt Học bổng Cựu sinh viên & Doanh nghiệp Tài trợ 2026",
    description:
      "Dành cho sinh viên Khoa CNTT có hoàn cảnh khó khăn hoặc có thành tích xuất sắc trong học tập, nghiên cứu khoa học và hoạt động phong trào.",
    targetBatches: [2021, 2022, 2023, 2024],
    targetRole: "student" as const,
    daysFromNow: 60,
    questions: [
      {
        orderIndex: 0,
        questionType: "short_text" as const,
        label: "Điểm trung bình tích lũy hệ 4 (GPA) tính đến học kỳ gần nhất:",
        isRequired: true,
      },
      {
        orderIndex: 1,
        questionType: "long_text" as const,
        label:
          "Trình bày hoàn cảnh gia đình, khó khăn hiện tại và lý do bạn xứng đáng nhận học bổng:",
        isRequired: true,
      },
      {
        orderIndex: 2,
        questionType: "long_text" as const,
        label:
          "Các thành tích học tập, giải thưởng nghiên cứu khoa học hoặc hoạt động Đoàn - Hội tiêu biểu:",
        isRequired: true,
      },
      {
        orderIndex: 3,
        questionType: "file_upload" as const,
        label:
          "Đính kèm bảng điểm có xác nhận và giấy tờ minh chứng hoàn cảnh (file PDF):",
        isRequired: false,
        config: { allowedFileTypes: ["pdf", "jpg", "png"], maxFileSizeMb: 10 },
      },
    ],
  },
];

export const SEED_SCHOLARSHIPS = [
  {
    title: "Quỹ Học bổng Thắp sáng Tài năng Trẻ Khoa CNTT - Học kỳ 1 (2026)",
    description:
      "Quỹ học bổng thường niên do Mạng lưới Cựu sinh viên kết hợp cùng các Doanh nghiệp Công nghệ đồng hành tài trợ. Hỗ trợ toàn bộ hoặc một phần học phí cho sinh viên vượt khó hiếu học và nuôi dưỡng các tài năng công nghệ tương lai.",
    targetAmount: "120000000",
    currentAmount: "70000000",
    daysFromNow: 45,
    status: "open" as const,
    pledges: [
      {
        donorEmail: "hr@vng.com.vn",
        donorDisplayName: "Tập đoàn VNG",
        amount: "25000000",
        isAnonymous: false,
        status: "fulfilled" as const,
        note: "Tài trợ 5 suất học bổng toàn phần dành cho sinh viên xuất sắc đam mê Kỹ thuật Phần mềm",
      },
      {
        donorEmail: "hr@fpt.com.vn",
        donorDisplayName: "FPT Software Global",
        amount: "20000000",
        isAnonymous: false,
        status: "fulfilled" as const,
        note: "Đồng hành cùng Khoa CNTT trong công tác ươm mầm tài năng trẻ",
      },
      {
        donorEmail: "alumni.le@gmail.com",
        donorDisplayName: "Lê Hoàng Nam (Cựu SV K18)",
        amount: "15000000",
        isAnonymous: false,
        status: "fulfilled" as const,
        note: "Trích từ lương và dự án, tiếp sức cho các em khóa dưới an tâm học tập",
      },
      {
        donorEmail: "alumni.quoc@gmail.com",
        donorDisplayName: "Trần Bảo Quốc (Cựu SV K16)",
        amount: "10000000",
        isAnonymous: false,
        status: "fulfilled" as const,
        note: "Ủng hộ quỹ khuyến học Khoa CNTT thân yêu",
      },
      {
        donorEmail: "alumni.mai@gmail.com",
        donorDisplayName: "Cựu sinh viên K17 (Ẩn danh)",
        amount: "10000000",
        isAnonymous: true,
        status: "pledged" as const,
        note: "Cam kết chuyển khoản trực tiếp vào tài khoản ngân hàng của Khoa trong tháng tới",
      },
    ],
    applications: [
      {
        studentEmail: "student.hoa@khoacntt.edu.vn",
        status: "reviewing" as const,
        score: "92.5",
        reviewNote:
          "Hoàn cảnh gia đình khó khăn, GPA 3.65/4.0 xuất sắc, tích cực tham gia các dự án mã nguồn mở và hỗ trợ đàn em khóa dưới.",
      },
      {
        studentEmail: "student.tuan@khoacntt.edu.vn",
        status: "approved" as const,
        score: "89.0",
        reviewNote:
          "Thành tích Nghiên cứu Khoa học đạt giải Nhì cấp Trường, hoàn cảnh gia đình vùng sâu vùng xa, tinh thần học tập gương mẫu.",
      },
    ],
  },
  {
    title:
      "Học bổng Doanh nghiệp Đồng hành: Hỗ trợ Khóa luận & Đề tài Tốt nghiệp Xuất sắc 2026",
    description:
      "Học bổng do MoMo và Viettel Telecom tài trợ nhằm khuyến khích sinh viên năm cuối thực hiện các đề tài tốt nghiệp có tính ứng dụng thực tiễn cao vào các bài toán lớn của xã hội.",
    targetAmount: "80000000",
    currentAmount: "35000000",
    daysFromNow: 60,
    status: "open" as const,
    pledges: [
      {
        donorEmail: "hr@momo.vn",
        donorDisplayName: "Siêu ứng dụng MoMo",
        amount: "20000000",
        isAnonymous: false,
        status: "fulfilled" as const,
        note: "Tài trợ kinh phí nghiên cứu cho các đề tài Hệ thống phân tán và Bảo mật",
      },
      {
        donorEmail: "hr@viettel.vn",
        donorDisplayName: "Tập đoàn Viettel",
        amount: "15000000",
        isAnonymous: false,
        status: "fulfilled" as const,
        note: "Hỗ trợ đề tài AI và Xử lý dữ liệu lớn",
      },
    ],
    applications: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SEED EXECUTION LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log(
    "🌱 Bắt đầu khởi tạo dữ liệu mẫu phong phú cho Hệ thống Connect Alumni...",
  );

  // 1. Tạo Tài khoản & Hồ sơ người dùng
  console.log("👤 Đang khởi tạo tài khoản và hồ sơ người dùng...");
  const userMap: Record<string, string> = {};

  for (const u of SEED_USERS) {
    try {
      const [existing] = await db
        .select()
        .from(user)
        .where(eq(user.email, u.email))
        .limit(1);

      let userId = existing?.id;

      if (!userId) {
        const authRes = await auth.api.signUpEmail({
          body: {
            email: u.email,
            password: u.password,
            name: u.name,
          },
        });
        userId = authRes.user.id;
        console.log(`   + Tạo mới tài khoản: ${u.email} [${u.role}]`);
      } else {
        console.log(`   * Đã có tài khoản: ${u.email}`);
      }

      userMap[u.email] = userId;

      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      if (!existingProfile) {
        await db.insert(profiles).values({
          userId,
          role: u.role,
          fullName: u.name,
          studentCode: (u as any).studentCode || null,
          faculty: (u as any).faculty || "Công nghệ Thông tin",
          batchYear: (u as any).batchYear || null,
          graduationYear: (u as any).graduationYear || null,
          phone: u.phone || null,
          avatarUrl: u.avatarUrl || null,
          bio: u.bio || null,
          status: "active",
        });
      }
    } catch (err: any) {
      console.warn(`   ! Lưu ý khi tạo ${u.email}:`, err.message);
    }
  }

  const staffId = userMap["staff@khoacntt.edu.vn"];
  const adminId = userMap["admin@khoacntt.edu.vn"];

  // 2. Tạo Doanh nghiệp Đối tác
  console.log("🏢 Đang khởi tạo hồ sơ doanh nghiệp công nghệ đối tác...");
  const companyMap: Record<string, string> = {};

  for (const c of SEED_COMPANIES) {
    const ownerId = userMap[c.ownerEmail];
    let [comp] = await db
      .select()
      .from(companies)
      .where(eq(companies.name, c.name))
      .limit(1);

    if (!comp && ownerId) {
      const [newComp] = await db
        .insert(companies)
        .values({
          name: c.name,
          description: c.description,
          industry: c.industry,
          website: c.website,
          logoUrl: c.logoUrl,
          verificationStatus: "verified",
          createdBy: ownerId,
          verifiedBy: staffId || adminId,
          verifiedAt: new Date(),
        })
        .returning();
      comp = newComp;
      console.log(`   + Doanh nghiệp: ${c.name}`);

      await db.insert(companyMembers).values({
        companyId: newComp.id,
        userId: ownerId,
        roleInCompany: c.roleInCompany,
        isActiveContext: true,
      });
    }
    if (comp) {
      companyMap[c.name] = comp.id;
    }
  }

  // 3. Tạo Tin tuyển dụng
  console.log(
    "💼 Đang khởi tạo các cơ hội việc làm & thực tập sinh chất lượng...",
  );
  for (const j of SEED_JOBS) {
    const companyId = companyMap[j.companyName];
    if (!companyId) continue;

    const [existingJob] = await db
      .select()
      .from(jobPosts)
      .where(eq(jobPosts.title, j.title))
      .limit(1);

    if (!existingJob) {
      const in45Days = new Date();
      in45Days.setDate(in45Days.getDate() + 45);

      await db.insert(jobPosts).values({
        companyId,
        title: j.title,
        description: j.description,
        requirements: j.requirements,
        location: j.location,
        jobType: j.jobType,
        salaryRange: j.salaryRange,
        applyUrlOrEmail: j.applyUrlOrEmail,
        status: "approved",
        reviewedBy: staffId || adminId,
        reviewedAt: new Date(),
        expiresAt: in45Days,
      });
      console.log(`   + Tin tuyển dụng: ${j.title}`);
    }
  }

  // 4. Tạo Sự kiện & Mời Diễn giả Cựu sinh viên
  console.log("🎤 Đang khởi tạo Sự kiện, Talkshow & Diễn giả cựu sinh viên...");
  for (const ev of SEED_EVENTS) {
    const [existingEvent] = await db
      .select()
      .from(events)
      .where(eq(events.title, ev.title))
      .limit(1);

    if (!existingEvent && staffId) {
      const startTime = new Date();
      startTime.setDate(startTime.getDate() + ev.daysFromNow);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + ev.durationHours);

      const [newEvent] = await db
        .insert(events)
        .values({
          type: ev.type,
          title: ev.title,
          description: ev.description,
          format: ev.format,
          locationOrLink: ev.locationOrLink,
          startTime,
          endTime,
          capacity: ev.capacity,
          status: "published",
          coverImageUrl: ev.coverImageUrl,
          createdBy: staffId,
        })
        .returning();

      console.log(`   + Sự kiện: ${ev.title}`);

      // Gán diễn giả
      for (const spkEmail of ev.speakerEmails) {
        const alumniUserId = userMap[spkEmail];
        if (alumniUserId) {
          await db.insert(eventSpeakers).values({
            eventId: newEvent.id,
            alumniUserId,
            invitationStatus: "accepted",
            note: "Nhận lời chia sẻ cùng các bạn sinh viên Khoa CNTT",
          });
        }
      }

      // Đăng ký mẫu cho sinh viên
      const studentId = userMap["student.hoa@khoacntt.edu.vn"];
      if (studentId) {
        await db.insert(eventRegistrations).values({
          eventId: newEvent.id,
          userId: studentId,
          attendanceStatus: "registered",
        });
      }
    }
  }

  // 5. Tạo Bài viết Chia sẻ Kinh nghiệm
  console.log(
    "📝 Đang khởi tạo các bài viết chia sẻ kinh nghiệm tâm huyết từ Alumni...",
  );
  for (const exp of SEED_EXPERIENCES) {
    const authorId = userMap[exp.authorEmail];
    if (!authorId) continue;

    const [existingExp] = await db
      .select()
      .from(experiencePosts)
      .where(eq(experiencePosts.title, exp.title))
      .limit(1);

    if (!existingExp) {
      await db.insert(experiencePosts).values({
        authorId,
        title: exp.title,
        content: exp.content,
        tags: exp.tags,
        status: "published",
        viewCount: exp.viewCount,
        publishedAt: new Date(),
      });
      console.log(`   + Bài viết: ${exp.title.slice(0, 45)}...`);
    }
  }

  // 6. Tạo Khảo sát & Biểu mẫu trực tuyến
  console.log("📋 Đang khởi tạo các khảo sát & form đăng ký học bổng...");
  const formMap: Record<string, string> = {};

  for (const f of SEED_FORMS) {
    const [existingForm] = await db
      .select()
      .from(forms)
      .where(eq(forms.title, f.title))
      .limit(1);

    if (!existingForm && staffId) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + f.daysFromNow);

      const [newForm] = await db
        .insert(forms)
        .values({
          type: f.type,
          title: f.title,
          description: f.description,
          targetBatches: f.targetBatches,
          targetRole: f.targetRole,
          deadline,
          status: "open",
          createdBy: staffId,
        })
        .returning();

      formMap[f.title] = newForm.id;
      console.log(`   + Biểu mẫu: ${f.title.slice(0, 45)}...`);

      for (const q of f.questions) {
        await db.insert(formQuestions).values({
          formId: newForm.id,
          orderIndex: q.orderIndex,
          questionType: q.questionType,
          label: q.label,
          options: (q as any).options || null,
          isRequired: q.isRequired,
          config: (q as any).config || null,
        });
      }
    } else if (existingForm) {
      formMap[f.title] = existingForm.id;
    }
  }

  // 7. Tạo Chiến dịch Học bổng & Các khoản Đóng góp Tài trợ
  console.log(
    "🎓 Đang khởi tạo các Quỹ Học bổng & Danh sách tài trợ của cựu sinh viên, doanh nghiệp...",
  );
  for (const sc of SEED_SCHOLARSHIPS) {
    let [campaign] = await db
      .select()
      .from(scholarshipCampaigns)
      .where(eq(scholarshipCampaigns.title, sc.title))
      .limit(1);

    if (!campaign && staffId) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + sc.daysFromNow);

      const [newCampaign] = await db
        .insert(scholarshipCampaigns)
        .values({
          title: sc.title,
          description: sc.description,
          targetAmount: sc.targetAmount,
          currentAmount: sc.currentAmount,
          applicationDeadline: deadline,
          status: sc.status,
          createdBy: staffId,
        })
        .returning();
      campaign = newCampaign;
      console.log(`   + Chiến dịch học bổng: ${sc.title.slice(0, 45)}...`);

      // Các khoản ủng hộ
      for (const p of sc.pledges) {
        const donorId = userMap[p.donorEmail];
        await db.insert(donationPledges).values({
          campaignId: newCampaign.id,
          donorId: donorId || null,
          donorDisplayName: p.donorDisplayName,
          isAnonymous: p.isAnonymous,
          amount: p.amount,
          status: p.status,
          note: p.note,
          createdBy: donorId || staffId,
        });
      }

      // Đơn xin học bổng mẫu
      for (const app of sc.applications) {
        const studentId = userMap[app.studentEmail];
        if (studentId) {
          await db.insert(scholarshipApplications).values({
            campaignId: newCampaign.id,
            studentId,
            status: app.status,
            score: app.score,
            reviewNote: app.reviewNote,
            reviewedBy: staffId,
          });
        }
      }
    }
  }

  // 8. Khởi tạo Nhật ký Kiểm toán (Audit Logs) & Thông báo mẫu
  if (adminId) {
    await db.insert(auditLogs).values({
      actorId: adminId,
      action: "system_comprehensive_seed",
      entityType: "system",
      entityId: adminId,
      metadata: {
        message:
          "Hệ thống đã nạp đầy đủ dữ liệu mẫu phong phú phục vụ đồ án tốt nghiệp",
        version: "2.0.0",
        timestamp: new Date().toISOString(),
      },
    });

    const studentId = userMap["student.hoa@khoacntt.edu.vn"];
    if (studentId) {
      await db.insert(notifications).values([
        {
          userId: studentId,
          type: "event_reminder",
          title: "Nhắc nhở sự kiện sắp diễn ra",
          body: "Bạn đã đăng ký tham gia Talkshow Cựu Sinh Viên K16, K17, K18 vào cuối tuần này. Nhớ đến đúng giờ nhé!",
          linkUrl: "/student/events/my-registrations",
          isRead: false,
        },
        {
          userId: studentId,
          type: "scholarship_update",
          title: "Hồ sơ học bổng đang được xét duyệt",
          body: "Ban Xét duyệt Học bổng Khoa CNTT đã tiếp nhận và đang tiến hành thẩm định hồ sơ của bạn.",
          linkUrl: "/student/scholarships",
          isRead: false,
        },
      ]);
    }
  }

  console.log("\n✨ DỮ LIỆU ĐÃ ĐƯỢC NẠP THÀNH CÔNG VỚI ĐỘ HOÀN THIỆN CAO!");
  console.log(
    "══════════════════════════════════════════════════════════════════════",
  );
  console.log(
    "🔑 DANH SÁCH TÀI KHOẢN DEMO SẴN DÙNG (MẬT KHẨU CHUNG: Password123!):",
  );
  console.log("   1. Quản trị viên (Admin):    admin@khoacntt.edu.vn");
  console.log("   2. Giáo vụ Khoa:             staff@khoacntt.edu.vn");
  console.log("   3. Cựu SV K18 (FPT Lead):    alumni.le@gmail.com");
  console.log("   4. Cựu SV K17 (VNG PM):      alumni.mai@gmail.com");
  console.log("   5. Cựu SV K16 (MoMo Lead):   alumni.quoc@gmail.com");
  console.log("   6. Cựu SV K19 (Viettel AI):  alumni.linh@gmail.com");
  console.log("   7. Sinh viên K21 (Năm cuối): student.hoa@khoacntt.edu.vn");
  console.log("   8. Nhà tuyển dụng VNG:       hr@vng.com.vn");
  console.log("   9. Nhà tuyển dụng FPT:       hr@fpt.com.vn");
  console.log("   10. Nhà tuyển dụng MoMo:     hr@momo.vn");
  console.log("   11. Nhà tuyển dụng Viettel:  hr@viettel.vn");
  console.log(
    "══════════════════════════════════════════════════════════════════════\n",
  );

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed with error:", err);
  process.exit(1);
});
