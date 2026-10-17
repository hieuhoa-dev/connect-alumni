export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "faculty_staff" | "student" | "alumni" | "employer";
  faculty: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  studentCode?: string;
  batchYear?: number;
  graduationYear?: number;
  redirectUrl: string;
  roleLabel: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

export const DEMO_ACCOUNTS: Record<string, DemoUser> = {
  "staff@khoacntt.edu.vn": {
    id: "demo-user-staff",
    email: "staff@khoacntt.edu.vn",
    name: "ThS. Trần Thị Giáo Vụ",
    role: "faculty_staff",
    faculty: "Công nghệ Thông tin",
    phone: "0902345678",
    bio: "Phó Trưởng Bộ môn - Phụ trách Quan hệ Doanh nghiệp & Hoạt động Cựu sinh viên",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
    redirectUrl: "/faculty-admin/dashboard",
    roleLabel: "Giáo vụ Khoa",
    badgeVariant: "default",
  },
  "admin@khoacntt.edu.vn": {
    id: "demo-user-admin",
    email: "admin@khoacntt.edu.vn",
    name: "TS. Nguyễn Văn Quản Trị",
    role: "admin",
    faculty: "Công nghệ Thông tin",
    phone: "0901234567",
    bio: "Trưởng Khoa kiêm Quản trị viên hệ thống Mạng lưới Cựu sinh viên Khoa CNTT",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    redirectUrl: "/faculty-admin/dashboard",
    roleLabel: "Quản trị Khoa",
    badgeVariant: "destructive",
  },
  "student.hoa@khoacntt.edu.vn": {
    id: "demo-user-student",
    email: "student.hoa@khoacntt.edu.vn",
    name: "Nguyễn Tiến Hoa (Sinh viên K21)",
    role: "student",
    studentCode: "21110045",
    batchYear: 2021,
    faculty: "Công nghệ Thông tin",
    phone: "0905678901",
    bio: "Sinh viên năm cuối ngành Kỹ thuật Phần mềm (K21), GPA 3.65/4.0, đam mê Fullstack Web & AI Agent",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
    redirectUrl: "/student/dashboard",
    roleLabel: "Sinh viên",
    badgeVariant: "secondary",
  },
  "alumni.le@gmail.com": {
    id: "demo-user-alumni",
    email: "alumni.le@gmail.com",
    name: "Lê Hoàng Nam (Cựu SV K18)",
    role: "alumni",
    batchYear: 2018,
    graduationYear: 2022,
    faculty: "Công nghệ Thông tin",
    phone: "0903456789",
    bio: "Tech Lead tại FPT Software | Cựu sinh viên K18 | Chuyên môn Cloud & Kiến trúc Microservices",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    redirectUrl: "/student/dashboard",
    roleLabel: "Cựu sinh viên",
    badgeVariant: "default",
  },
  "hr@vng.com.vn": {
    id: "demo-user-employer",
    email: "hr@vng.com.vn",
    name: "Phạm Thu Trang (HR VNG)",
    role: "employer",
    faculty: "Đối tác Doanh nghiệp",
    phone: "0906789012",
    bio: "Lead Talent Acquisition - VNG Corporation",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200",
    redirectUrl: "/employer/dashboard",
    roleLabel: "Doanh nghiệp",
    badgeVariant: "outline",
  },
};

export const getDemoAccount = (email: string): DemoUser | null => {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS[normalized] || null;
};

export const DEMO_COOKIE_NAME = "dlu_demo_user";

export const sampleDemoNotifications = [
  {
    id: "notif-1",
    userId: "demo-user",
    title: "Chào mừng bạn đến với Mạng lưới Cựu sinh viên Đại học Đà Lạt!",
    content: "Tài khoản của bạn đã được kết nối vào hệ thống. Chúc bạn có trải nghiệm tuyệt vời.",
    type: "system",
    read: false,
    createdAt: new Date(),
  },
  {
    id: "notif-2",
    userId: "demo-user",
    title: "Sự kiện sắp diễn ra: DLU Reunion 2026",
    content: "Hội ngộ cựu sinh viên các thế hệ tại Hội trường Thư viện DLU. Hãy xem chi tiết sự kiện.",
    type: "event",
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 24),
  },
];

export const sampleDemoCompanies = [
  {
    id: "company-vng-dlu",
    name: "Tập đoàn VNG Corporation",
    description: "Kỳ lân công nghệ hàng đầu Việt Nam, đối tác chiến lược đào tạo và tuyển dụng chính thức của Trường Đại học Đà Lạt.",
    industry: "Công nghệ thông tin & Game",
    website: "https://vng.com.vn",
    logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
    verificationStatus: "verified" as const,
    isActiveContext: true,
    membershipRole: "admin",
  },
];
