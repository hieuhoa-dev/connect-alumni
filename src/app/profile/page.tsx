import * as React from "react";
import { getCurrentUser } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { ProfileEditor } from "./profile-editor";
import { getMyWorkExperiences, getMyProfileRevisions } from "@/actions/profile-actions";
import { UserCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const ProfilePage = async () => {
  const current = await getCurrentUser();
  if (!current?.user) {
    redirect("/login?next=/profile");
  }

  const [experiences, revisions] = await Promise.all([
    getMyWorkExperiences(),
    getMyProfileRevisions(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#1B7A3E] text-xs font-semibold mb-2">
            <Sparkles className="h-3 w-3" />
            Hồ sơ cá nhân & Nghề nghiệp
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Quản lý hồ sơ
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Cập nhật thông tin công tác, học vấn và kiểm soát quyền riêng tư kết nối của bạn
          </p>
        </div>
      </div>

      <ProfileEditor
        initialProfile={current.profile}
        initialExperiences={experiences}
        initialRevisions={revisions}
        userEmail={current.user.email}
      />
    </div>
  );
};

export default ProfilePage;
