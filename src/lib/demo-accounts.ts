import crypto from "node:crypto";

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
    avatarUrl: "/placeholder-avatar.svg",
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
    avatarUrl: "/placeholder-avatar.svg",
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
    avatarUrl: "/placeholder-avatar.svg",
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
    avatarUrl: "/placeholder-avatar.svg",
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
    avatarUrl: "/placeholder-avatar.svg",
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

export const isDemoEnabled = (): boolean => {
  return (
    process.env.ENABLE_DEMO_LOGIN === "true" &&
    process.env.NODE_ENV !== "production"
  );
};

const getDemoSecret = (): string => {
  return (
    process.env.BETTER_AUTH_SECRET || "dlu-connect-alumni-demo-secret-key-32b"
  );
};

export const signDemoCookie = (email: string): string => {
  const hmac = crypto.createHmac("sha256", getDemoSecret());
  hmac.update(email);
  const signature = hmac.digest("hex");
  return `${email}.${signature}`;
};

export const verifyDemoCookie = (
  cookieValue: string | undefined | null,
): string | null => {
  if (!cookieValue || !isDemoEnabled()) return null;
  const lastDot = cookieValue.lastIndexOf(".");
  if (lastDot === -1) return null;
  const email = cookieValue.substring(0, lastDot);
  const signature = cookieValue.substring(lastDot + 1);

  const hmac = crypto.createHmac("sha256", getDemoSecret());
  hmac.update(email);
  const expectedSignature = hmac.digest("hex");

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return email;
    }
  } catch {
    return null;
  }
  return null;
};
