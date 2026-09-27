import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";

const DashboardDispatcherPage = async () => {
  const current = await getCurrentUser();

  if (!current?.user) {
    redirect("/login");
  }

  const role = current.role;

  if (role === "admin" || role === "faculty_staff") {
    redirect("/faculty-admin/dashboard");
  }

  if (role === "employer") {
    redirect("/employer/dashboard");
  }

  // Default: student or alumni
  redirect("/student/dashboard");
};

export default DashboardDispatcherPage;
