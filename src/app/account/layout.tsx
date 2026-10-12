import { desc, eq } from "drizzle-orm";
import type * as React from "react";
import { getMyCompanies } from "@/actions/company-actions";
import { Sidebar } from "@/components/shared/sidebar";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireRoleOrRedirect } from "@/lib/permissions";

/**
 * Khu vực tài khoản dùng chung cho mọi vai trò (hồ sơ, đổi mật khẩu, thông báo).
 * Dùng cùng thanh bên với các khu vực khác để người dùng không bị "lạc" giao diện.
 */
const AccountLayout = async ({ children }: { children: React.ReactNode }) => {
  const current = await requireRoleOrRedirect([
    "student",
    "alumni",
    "employer",
    "faculty_staff",
    "admin",
  ]);

  const [userNotifications, companiesList] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, current.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(10),
    current.role === "employer" ? getMyCompanies() : Promise.resolve([]),
  ]);

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
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
    </div>
  );
};

export default AccountLayout;
