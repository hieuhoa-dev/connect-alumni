import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { companyMembers, profiles } from "@/db/schema";
import { auth } from "@/lib/auth";

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
};

/**
 * Hard Guard: enforce that the caller is logged in and has one of the allowed roles
 */
export const requireRole = async (allowedRoles: UserRole | UserRole[]) => {
  const current = await getCurrentUser();

  if (!current?.user) {
    throw new UnauthorizedError();
  }

  if (!current.profile) {
    throw new ForbiddenError(
      "Tài khoản chưa có hồ sơ. Vui lòng liên hệ quản trị viên.",
    );
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
 * Dùng trong layout / page (Server Component): chưa đăng nhập thì chuyển về /login,
 * sai vai trò thì chuyển về trang chủ, thay vì ném lỗi 500.
 * Server Action vẫn dùng requireRole.
 */
export const requireRoleOrRedirect = async (
  allowedRoles: UserRole | UserRole[],
) => {
  try {
    return await requireRole(allowedRoles);
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/login");
    if (error instanceof ForbiddenError) redirect("/");
    throw error;
  }
};

/**
 * Cần đăng nhập và tài khoản không bị khóa (không giới hạn vai trò).
 * Dùng thay cho getCurrentUser ở các action ghi dữ liệu.
 */
export const requireActiveUser = async () => {
  const current = await getCurrentUser();

  if (!current?.user) {
    throw new UnauthorizedError();
  }

  if (!current.profile) {
    throw new ForbiddenError(
      "Tài khoản chưa có hồ sơ. Vui lòng liên hệ quản trị viên.",
    );
  }

  if (current.profile?.status === "locked") {
    throw new ForbiddenError(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
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

  // Find membership
  const memberships = await db
    .select()
    .from(companyMembers)
    .where(eq(companyMembers.userId, current.user.id));

  if (!memberships || memberships.length === 0) {
    throw new ForbiddenError(
      "Bạn chưa thuộc công ty nào. Vui lòng hoàn tất đăng ký hồ sơ doanh nghiệp.",
    );
  }

  const activeMembership = companyId
    ? memberships.find((m) => m.companyId === companyId)
    : memberships.find((m) => m.isActiveContext) || memberships[0];

  if (!activeMembership) {
    throw new ForbiddenError("Bạn không có quyền thao tác trên công ty này.");
  }

  return {
    ...current,
    activeMembership,
    companyId: activeMembership.companyId,
    allMemberships: memberships,
  };
};
