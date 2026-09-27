"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { companies, companyMembers } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import { companyCreateSchema, companyReviewSchema, CompanyCreateInput } from "@/validators/company-schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

/**
 * Register a new company profile (pending review by faculty)
 */
export const registerCompany = async (input: CompanyCreateInput) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Vui lòng đăng nhập để đăng ký hồ sơ công ty");
  }

  const validated = companyCreateSchema.parse(input);

  // 1. Create company
  const [newCompany] = await db
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
  await db
    .update(companyMembers)
    .set({ isActiveContext: false })
    .where(eq(companyMembers.userId, current.user.id));

  // 3. Add user as active member of new company
  await db.insert(companyMembers).values({
    companyId: newCompany.id,
    userId: current.user.id,
    roleInCompany: validated.roleInCompany,
    isActiveContext: true,
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: "register_company",
    entityType: "company",
    entityId: newCompany.id,
    metadata: { name: newCompany.name },
  });

  return newCompany;
};

/**
 * Switch the active company context for the current user
 */
export const switchActiveCompany = async (companyId: string) => {
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Chưa đăng nhập");
  }

  // Verify membership
  const membership = await db.query.companyMembers.findFirst({
    where: {
      userId: current.user.id,
      companyId: companyId,
    },
  });

  if (!membership) {
    throw new Error("Bạn không thuộc doanh nghiệp này");
  }

  // Deactivate others
  await db
    .update(companyMembers)
    .set({ isActiveContext: false })
    .where(eq(companyMembers.userId, current.user.id));

  // Activate selected
  await db
    .update(companyMembers)
    .set({ isActiveContext: true })
    .where(
      and(
        eq(companyMembers.userId, current.user.id),
        eq(companyMembers.companyId, companyId),
      ),
    );

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
        : `Lý do: ${validated.rejectedReason || "Chưa đạt tiêu chuẩn kết nối của Khoa."}`,
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
export const getCompaniesForFaculty = async (status?: "pending" | "verified" | "rejected") => {
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
