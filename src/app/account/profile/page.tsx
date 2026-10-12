import type { Metadata } from "next";
import { Tag } from "@/components/landing/landing-parts";
import { requireRoleOrRedirect } from "@/lib/permissions";
import { formatDateVi, getInitials, ROLE_LABEL } from "@/lib/text";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân",
};

const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-5 rounded-xl border border-border-strong bg-card p-6">
    <header className="flex flex-col gap-1 border-b border-border-strong pb-4">
      <h2 className="font-serif text-xl font-medium text-foreground">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </header>
    {children}
  </section>
);

const ProfilePage = async () => {
  const current = await requireRoleOrRedirect([
    "student",
    "alumni",
    "employer",
    "faculty_staff",
    "admin",
  ]);
  const profile = current.profile;
  const displayName = profile?.fullName || current.user.name;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-foreground font-serif text-lg text-background">
          {getInitials(displayName)}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-serif text-3xl font-normal tracking-tight text-foreground">
            {displayName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Tag tone="blue">{ROLE_LABEL[current.role] ?? current.role}</Tag>
            <span className="font-mono text-xs">{current.user.email}</span>
            {profile?.createdAt && (
              <span className="text-xs">
                Tham gia {formatDateVi(profile.createdAt)}
              </span>
            )}
          </div>
        </div>
      </header>

      {!profile ? (
        <SectionCard
          title="Chưa có hồ sơ"
          description="Tài khoản của bạn chưa có hồ sơ chi tiết. Vui lòng liên hệ Ban Chủ nhiệm Khoa để được hỗ trợ."
        >
          <p className="text-sm text-muted-foreground">
            Bạn vẫn có thể đổi mật khẩu ở phần bên dưới.
          </p>
        </SectionCard>
      ) : (
        <SectionCard
          title="Thông tin cá nhân"
          description="Email và vai trò do hệ thống quản lý, không thể tự thay đổi."
        >
          <ProfileForm
            role={current.role}
            initial={{
              fullName: profile.fullName,
              phone: profile.phone ?? "",
              bio: profile.bio ?? "",
              avatarUrl: profile.avatarUrl ?? "",
              studentCode: profile.studentCode ?? "",
              batchYear: profile.batchYear ? String(profile.batchYear) : "",
              graduationYear: profile.graduationYear
                ? String(profile.graduationYear)
                : "",
            }}
          />
        </SectionCard>
      )}

      <SectionCard
        title="Đổi mật khẩu"
        description="Sau khi đổi, các thiết bị khác đang đăng nhập sẽ bị đăng xuất."
      >
        <PasswordForm />
      </SectionCard>
    </div>
  );
};

export default ProfilePage;
