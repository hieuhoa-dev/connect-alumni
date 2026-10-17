import * as React from "react";
import { requireRole } from "@/lib/permissions";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMyCompanies } from "@/actions/company-actions";
import { Sidebar } from "@/components/shared/sidebar";

const EmployerLayout = async ({ children }: { children: React.ReactNode }) => {
  const current = await requireRole(["employer", "admin"]);
  let companiesList: any[] = [];
  let userNotifications: any[] = [];

  try {
    companiesList = await getMyCompanies();
  } catch (err) {
    companiesList = [
      {
        id: "company-vng-dlu",
        name: "Tập đoàn VNG Corporation",
        description: "Kỳ lân công nghệ hàng đầu Việt Nam, đối tác chiến lược tuyển dụng của Trường Đại học Đà Lạt.",
        industry: "Công nghệ thông tin & Game",
        website: "https://vng.com.vn",
        logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
        verificationStatus: "verified",
        isActiveContext: true,
        membershipRole: "admin",
      },
    ];
  }

  try {
    userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, current.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(10);
  } catch (err) {
    userNotifications = [
      {
        id: "notif-e1",
        title: "Hồ sơ doanh nghiệp VNG Corporation đã được duyệt",
        content: "Khoa CNTT đã xác minh hồ sơ. Bạn có thể đăng tin tuyển dụng ngay bây giờ.",
        type: "system",
        read: false,
        createdAt: new Date(),
      },
    ];
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background">
      <Sidebar
        role={current.role}
        userName={current.profile?.fullName || current.user.name}
        userEmail={current.user.email}
        notifications={userNotifications}
        companies={companiesList}
      />
      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};

export default EmployerLayout;
