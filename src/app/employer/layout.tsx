import * as React from "react";
import { redirect } from "next/navigation";
import { requireRole, UnauthorizedError, ForbiddenError } from "@/lib/permissions";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMyCompanies } from "@/actions/company-actions";
import { Sidebar } from "@/components/shared/sidebar";

export const dynamic = "force-dynamic";

const EmployerLayout = async ({ children }: { children: React.ReactNode }) => {
  let current;
  try {
    current = await requireRole(["employer", "admin"]);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      redirect("/login?next=/employer/dashboard");
    }
    if (err instanceof ForbiddenError) {
      redirect("/403");
    }
    throw err;
  }

  if (current.profile?.status === "locked") {
    redirect("/403");
  }

  let companiesList: any[] = [];
  let userNotifications: any[] = [];

  try {
    companiesList = await getMyCompanies();
  } catch (err) {
    console.error("Error fetching employer companies:", err);
    companiesList = [];
  }

  try {
    userNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, current.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(10);
  } catch (err) {
    console.error("Error fetching employer notifications:", err);
    userNotifications = [];
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
