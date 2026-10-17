import { headers, cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles, companyMembers } from "@/db/schema";
import { getDemoAccount, DEMO_COOKIE_NAME, sampleDemoCompanies } from "@/lib/demo-accounts";

export type UserRole =
  | "student"
  | "alumni"
  | "employer"
  | "faculty_staff"
  | "admin";

export class UnauthorizedError extends Error {
  constructor(message = "Bạn cần đăng nhập để thực hiện thao tác này") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Bạn không có quyền thực hiện thao tác này") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Get current session and profile on the server
 */
export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const demoUserEmail = cookieStore.get(DEMO_COOKIE_NAME)?.value;

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
            currentCompany:
              demo.role === "employer" ? "Tập đoàn VNG Corporation" : null,
            currentPosition: demo.role === "alumni" ? "Tech Lead" : null,
            isPublic: true,
            linkedinUrl: null,
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
      role: (profile?.role || "student") as UserRole,
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

  if (current.profile?.status === "locked") {
    throw new ForbiddenError(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
    );
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  // Admin always has bypass permission
  if (current.role === "admin") {
    return current;
  }

  if (!roles.includes(current.role)) {
    throw new ForbiddenError(
      `Yêu cầu quyền: ${roles.join(" hoặc ")}, vai trò hiện tại: ${current.role}`,
    );
  }

  return current;
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

  try {
    // Find membership in database
    const memberships = await db
      .select()
      .from(companyMembers)
      .where(eq(companyMembers.userId, current.user.id));

    if (memberships && memberships.length > 0) {
      const activeMembership = companyId
        ? memberships.find((m) => m.companyId === companyId)
        : memberships.find((m) => m.isActiveContext) || memberships[0];

      if (activeMembership) {
        return {
          ...current,
          activeMembership,
          companyId: activeMembership.companyId,
          allMemberships: memberships,
        };
      }
    }
  } catch (err) {
    // Fallback if DB is offline or table empty
  }

  // Graceful fallback for demo employer
  const demoComp = sampleDemoCompanies[0];
  const fallbackMembership = {
    companyId: demoComp.id,
    userId: current.user.id,
    roleInCompany: "admin",
    isActiveContext: true,
  };

  return {
    ...current,
    activeMembership: fallbackMembership,
    companyId: demoComp.id,
    allMemberships: [fallbackMembership],
  };
};

