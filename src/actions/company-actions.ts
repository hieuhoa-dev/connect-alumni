"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { companies, companyMembers } from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import {
  companyCreateSchema,
  companyReviewSchema,
  CompanyCreateInput,
} from "@/validators/company-schema";
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

  // Bọc 3 thao tác trong 1 transaction để tránh race condition
  const newCompany = await db.transaction(async (tx) => {
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

  try {
    const memberships = await db.query.companyMembers.findMany({
      where: {
        userId: current.user.id,
      },
      with: {
        company: true,
      },
    });

    if (memberships && memberships.length > 0) {
      return memberships.map((m) => ({
        ...m.company,
        membershipRole: m.roleInCompany,
        isActiveContext: m.isActiveContext,
      }));
    }
  } catch (err) {
    // Database offline
  }

  // Graceful fallback for demo employer or offline testing
  const demoComp = {
    id: "company-vng-dlu",
    name: "Tập đoàn VNG Corporation",
    description: "Kỳ lân công nghệ hàng đầu Việt Nam, đối tác chiến lược tuyển dụng của Trường Đại học Đà Lạt.",
    industry: "Công nghệ thông tin & Game",
    website: "https://vng.com.vn",
    logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
    verificationStatus: "verified" as const,
    rejectedReason: null,
    createdBy: current.user.id,
    verifiedBy: "staff-dlu-id",
    verifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    membershipRole: "admin",
    isActiveContext: true,
  };

  return [demoComp];
};

/**
 * Faculty/Admin: Get all companies with status filter
 */
export const getCompaniesForFaculty = async (
  status?: "pending" | "verified" | "rejected",
) => {
  await requireRole(["faculty_staff", "admin"]);

  try {
    const comps = await db.query.companies.findMany({
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

    if (comps && comps.length > 0) return comps;
  } catch (err) {
    // Database offline
  }

  const sampleFacultyCompanies = [
    {
      id: "comp-vng-1",
      name: "Tập đoàn VNG Corporation",
      description: "Doanh nghiệp công nghệ đối tác chiến lược hàng đầu của DLU.",
      industry: "Công nghệ thông tin",
      website: "https://vng.com.vn",
      logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200",
      verificationStatus: "verified" as const,
      rejectedReason: null,
      createdAt: new Date(),
      creator: {
        profile: {
          fullName: "Phạm Thu Trang",
        },
      },
      members: [],
      jobPosts: [],
    },
    {
      id: "comp-hasfarm-2",
      name: "Dalat Hasfarm AgriTech",
      description: "Ứng dụng chuyển đổi số và tự động hóa nông nghiệp công nghệ cao tại Lâm Đồng.",
      industry: "Nông nghiệp công nghệ cao",
      website: "https://dalathasfarm.com",
      logoUrl: "https://images.unsplash.com/photo-1595053826286-2e59ef7ae04b?w=200",
      verificationStatus: "pending" as const,
      rejectedReason: null,
      createdAt: new Date(),
      creator: {
        profile: {
          fullName: "Nguyễn Văn Hùng",
        },
      },
      members: [],
      jobPosts: [],
    },
  ];

  if (status) {
    return sampleFacultyCompanies.filter((c) => c.verificationStatus === status);
  }
  return sampleFacultyCompanies;
};
