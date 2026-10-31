import { requireRole } from "@/lib/permissions";
import { getAdminTakedownRequests } from "@/server/dal/gallery";
import { TakedownAdminClient } from "./takedown-admin-client";

export const dynamic = "force-dynamic";

const FacultyAdminTakedownPage = async () => {
  await requireRole(["faculty_staff", "admin"]);

  const requests = await getAdminTakedownRequests();

  return <TakedownAdminClient initialRequests={requests} />;
};

export default FacultyAdminTakedownPage;
