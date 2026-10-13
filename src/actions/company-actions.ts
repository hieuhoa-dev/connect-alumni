"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { companies, companyMembers, user } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { isEntityId } from "@/lib/query-input";
import {
  type CompanyCreateInput,
  companyCreateSchema,
  companyReviewSchema,
} from "@/validators/company-schema";

/**
 * Register a new company profile (pending review by faculty)
 */
export const registerCompany = async (input: CompanyCreateInput) => {
  const current = await requireRole(["employer"]);

  const validated = companyCreateSchema.parse(input);

  // Bọc 3 thao tác trong 1 transaction để tránh race condition
  const newCompany = await db.transaction(async (tx) => {
    // Cùng khóa với switchActiveCompany, kể cả khi chưa có thành viên doanh nghiệp.
    await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, current.user.id))
      .for("update");
    // 1. Create company
    const [company] = await tx
      .insert(companies)
      .values({
        name: validated.name,
        description: validated.description,
        industry: validated.industry,
        website: validated.website || null,
        logoUrl: validated.logoUrl || null,
        verificationStatus: "pending",
        createdBy: current.user.id,
      })
      .returning();

    // 2. Set previous companies isActiveContext to false for this user
    await tx
      .update(companyMembers)
      .set({ isActiveContext: false })
      .where(eq(companyMembers.userId, current.user.id));

    // 3. Add user as active member of new company
    await tx.insert(companyMembers).values({
      companyId: company.id,
      userId: current.user.id,
      roleInCompany: validated.roleInCompany,
      isActiveContext: true,
    });

    return company;
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "register_company",
    entityType: "company",
    entityId: newCompany.id,
    metadata: { name: newCompany.name },
  });

  revalidatePath("/employer", "layout");
  revalidatePath("/faculty-admin/companies/review");
  return newCompany;
};

/**
 * Switch the active company context for the current user
 */
export const switchActiveCompany = async (companyId: string) => {
  const current = await requireRole(["employer"]);
  if (!isEntityId(companyId)) throw new Error("ID doanh nghiệp không hợp lệ");

  await db.transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, current.user.id))
      .for("update");

    const membership = await tx.query.companyMembers.findFirst({
      where: { userId: current.user.id, companyId },
    });
    if (!membership) throw new Error("Bạn không thuộc doanh nghiệp này");

    await tx
      .update(companyMembers)
      .set({ isActiveContext: false })
      .where(eq(companyMembers.userId, current.user.id));
    await tx
      .update(companyMembers)
      .set({ isActiveContext: true })
      .where(
        and(
          eq(companyMembers.userId, current.user.id),
          eq(companyMembers.companyId, companyId),
        ),
      );
  });

  revalidatePath("/employer", "layout");
  return { success: true, companyId };
};

/**
 * Faculty/Admin: Review company verification
 */
export const reviewCompany = async (data: {
  companyId: string;
  status: "verified" | "rejected";
  rejectedReason?: string;
}) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(data.companyId))
    throw new Error("ID doanh nghiệp không hợp lệ");
  const validated = companyReviewSchema.parse({
    status: data.status,
    rejectedReason: data.rejectedReason,
  });

  const [company] = await db
    .update(companies)
    .set({
      verificationStatus: validated.status,
      rejectedReason: validated.rejectedReason || null,
      verifiedBy: current.user.id,
      verifiedAt: new Date(),
    })
    .where(eq(companies.id, data.companyId))
    .returning();

  if (!company) {
    throw new Error("Không tìm thấy doanh nghiệp");
  }

  // Notify company creator
  await sendNotification({
    userId: company.createdBy,
    type: "company_verified",
    title:
      validated.status === "verified"
        ? `Hồ sơ công ty ${company.name} đã được phê duyệt!`
        : `Hồ sơ công ty ${company.name} bị từ chối`,
    body:
      validated.status === "verified"
        ? "Doanh nghiệp của bạn hiện có thể đăng tin tuyển dụng và tham gia các hoạt động kết nối."
        : `Lý do: ${validated.rejectedReason || "Chưa đạt tiêu chuẩn kết nối của dự án."}`,
    linkUrl: "/employer/dashboard",
    sendEmail: true,
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: `review_company_${validated.status}`,
    entityType: "company",
    entityId: company.id,
    metadata: { status: validated.status, reason: validated.rejectedReason },
  });

  revalidatePath("/employer", "layout");
  revalidatePath("/faculty-admin/companies/review");
  revalidatePath("/jobs");
  revalidatePath("/jobs/[id]", "page");
  revalidatePath("/");
  return company;
};

/**
 * Get all companies belonging to current user
 */
export const getMyCompanies = async () => {
  const current = await getCurrentUser();
  if (!current?.user) return [];

  const memberships = await db.query.companyMembers.findMany({
    where: {
      userId: current.user.id,
    },
    with: {
      company: true,
    },
  });

  return memberships.map((m) => ({
    ...m.company,
    membershipRole: m.roleInCompany,
    isActiveContext: m.isActiveContext,
  }));
};

/**
 * Faculty/Admin: Get all companies with status filter
 */
export const getCompaniesForFaculty = async (
  status?: "pending" | "verified" | "rejected",
) => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.companies.findMany({
    where: status ? { verificationStatus: status } : undefined,
    with: {
      creator: {
        with: {
          profile: true,
        },
      },
      members: {
        with: {
          user: {
            with: {
              profile: true,
            },
          },
        },
      },
      jobPosts: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
