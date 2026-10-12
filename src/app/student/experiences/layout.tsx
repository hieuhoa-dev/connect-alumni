import type { ReactNode } from "react";
import { requireRoleOrRedirect } from "@/lib/permissions";

const ExperienceAuthorLayout = async ({ children }: { children: ReactNode }) => {
  await requireRoleOrRedirect(["alumni"]);
  return children;
};

export default ExperienceAuthorLayout;
