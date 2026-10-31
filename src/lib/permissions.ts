import { headers, cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles, companyMembers } from "@/db/schema";
import {
  getDemoAccount,
  DEMO_COOKIE_NAME,
  isDemoEnabled,
  verifyDemoCookie,
} from "@/lib/demo-accounts";

export type UserRole =
  | "student"
  | "alumni"
  | "employer"
  | "faculty_staff"
  | "admin";

import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
export { UnauthorizedError, ForbiddenError };

/**
 * Get current session and profile on the server
 */
export const getCurrentUser = async () => {
  if (isDemoEnabled()) {
    try {
      const cookieStore = await cookies();
      const rawCookie = cookieStore.get(DEMO_COOKIE_NAME)?.value;
      const demoUserEmail = verifyDemoCookie(rawCookie);

      if (demoUserEmail) {
        const demo = getDemoAccount(demoUserEmail);
        if (demo) {
          return {
            user: {
              id: demo.id,
              name: demo.name,
              email: demo.email,
              emailVerified: true,
              image: demo.avatarUrl,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            session: {
              id: `session-${demo.id}`,
              userId: demo.id,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              token: `token-${demo.id}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            profile: {
              id: `profile-${demo.id}`,
              userId: demo.id,
              fullName: demo.name,
              role: demo.role,
              status: "active" as const,
              faculty: demo.faculty,
              phone: demo.phone,
              bio: demo.bio,
              avatarUrl: demo.avatarUrl,
              studentCode: demo.studentCode || null,
              batchYear: demo.batchYear || null,
              graduationYear: demo.graduationYear || null,
              alumniVerifiedAt: demo.role === "alumni" ? new Date() : null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            role: demo.role as UserRole,
          };
        }
      }
    } catch (err) {
      // Cookie read failed, continue to standard auth
    }
  }

  try {
    const reqHeaders = await headers();
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (!session?.user) {
      return null;
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id));

    return {
      user: session.user,
      session: session.session,
      profile: profile || null,
      role: (profile?.role || null) as UserRole | null,
    };
  } catch (err) {
    // If DB is offline and no demo user, return null
    return null;
  }
};

/**
 * Hard Guard: enforce that the caller is logged in and has one of the allowed roles
 */
export const requireRole = async (allowedRoles: UserRole | UserRole[]) => {
  const current = await getCurrentUser();

  if (!current?.user) {
    throw new UnauthorizedError();
  }

  if (!current.profile || !current.role) {
    throw new ForbiddenError(
      "PROFILE_REQUIRED: Tài khoản của bạn chưa hoàn tất hồ sơ cá nhân. Vui lòng cập nhật hồ sơ để tiếp tục.",
    );
  }

  if (current.profile.status === "locked") {
    throw new ForbiddenError(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
    );
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Admin always has bypass permission
  if (current.role === "admin") {
    return current as typeof current & { role: UserRole };
  }

  if (!roles.includes(current.role)) {
    throw new ForbiddenError(
      `Yêu cầu quyền: ${roles.join(" hoặc ")}, vai trò hiện tại: ${current.role}`,
    );
  }

  return current as typeof current & { role: UserRole };
};

/**
 * Hard Guard for Employer: verify membership and optionally active context
 */
export const requireCompanyContext = async (companyId?: string) => {
  const current = await requireRole(["employer", "admin"]);

  // Admin can manage any company
  if (current.role === "admin") {
    return {
      ...current,
      activeMembership: null,
      companyId: companyId || null,
    };
  }

  // Find membership in database
  const memberships = await db
    .select()
    .from(companyMembers)
    .where(eq(companyMembers.userId, current.user.id));

  if (memberships && memberships.length > 0) {
    let activeMembership = companyId
      ? memberships.find((m) => m.companyId === companyId)
      : memberships.find((m) => m.isActiveContext);

    // If only one membership exists and none is marked active, activate it
    if (!activeMembership && memberships.length === 1) {
      activeMembership = memberships[0];
      await db
        .update(companyMembers)
        .set({ isActiveContext: true })
        .where(
          and(
            eq(companyMembers.userId, current.user.id),
            eq(companyMembers.companyId, activeMembership.companyId),
          ),
        );
    }

    if (activeMembership) {
      return {
        ...current,
        activeMembership,
        companyId: activeMembership.companyId,
        allMemberships: memberships,
      };
    }
  }

  throw new ForbiddenError(
    "Bạn chưa tham gia hoặc chưa kích hoạt công ty nào. Vui lòng truy cập trang thiết lập doanh nghiệp.",
  );
};
