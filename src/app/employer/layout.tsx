import * as React from "react";
import { requireRole } from "@/lib/permissions";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMyCompanies } from "@/actions/company-actions";
import { Sidebar } from "@/components/shared/sidebar";

const EmployerLayout = async ({ children }: { children: React.ReactNode }) => {
  const current = await requireRole(["employer", "admin"]);
  const [companiesList, userNotifications] = await Promise.all([
    getMyCompanies(),
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, current.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(10),
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
        {children}
      </main>
    </div>
  );
};

export default EmployerLayout;
