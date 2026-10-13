"use server";

import { and, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  donationPledges,
  scholarshipApplications,
  scholarshipCampaigns,
} from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import {
  getCurrentUser,
  requireActiveUser,
  requireRole,
} from "@/lib/permissions";
import { isEntityId } from "@/lib/query-input";
import {
  type CampaignCreateInput,
  campaignCreateSchema,
  type DonationPledgeInput,
  donationPledgeSchema,
  type ScholarshipApplicationReviewInput,
  scholarshipApplicationReviewSchema,
  scholarshipApplicationSchema,
} from "@/validators/scholarship-schema";

/**
 * Public: Get active scholarship campaigns
 * Chỉ trả số lượng (pledgeCount, applicationCount), không trả danh sách nhà tài trợ
 * hay hồ sơ của sinh viên.
 */
export const getScholarshipCampaigns = async () => {
  const campaigns = await db.query.scholarshipCampaigns.findMany({
    where: {
      status: "open",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (campaigns.length === 0) return [];

  const ids = campaigns.map((c) => c.id);
  const [pledgeCounts, applicationCounts] = await Promise.all([
    db
      .select({ campaignId: donationPledges.campaignId, total: count() })
      .from(donationPledges)
      .where(
        and(
          inArray(donationPledges.campaignId, ids),
          eq(donationPledges.status, "fulfilled"),
        ),
      )
      .groupBy(donationPledges.campaignId),
    db
      .select({
        campaignId: scholarshipApplications.campaignId,
        total: count(),
      })
      .from(scholarshipApplications)
      .where(inArray(scholarshipApplications.campaignId, ids))
      .groupBy(scholarshipApplications.campaignId),
  ]);

  const pledgeMap = new Map(
    pledgeCounts.map((r) => [r.campaignId, Number(r.total)]),
  );
  const applicationMap = new Map(
    applicationCounts.map((r) => [r.campaignId, Number(r.total)]),
  );

  return campaigns.map((campaign) => ({
    ...campaign,
    pledgeCount: pledgeMap.get(campaign.id) ?? 0,
    applicationCount: applicationMap.get(campaign.id) ?? 0,
  }));
};

/**
 * Get campaign by ID (dữ liệu công khai)
 * - Chiến dịch nháp chỉ nhân sự quản trị xem được.
 * - Chỉ trả các khoản đã nhận tiền, nhà tài trợ ẩn danh bị che tên ngay trên server.
 * - Không trả hồ sơ của sinh viên.
 */
export const getCampaignById = async (id: string) => {
  if (!isEntityId(id)) return null;
  const [campaign, current] = await Promise.all([
    db.query.scholarshipCampaigns.findFirst({
      where: {
        id: id,
      },
      with: {
        applicationForm: {
          with: {
            questions: {
              orderBy: {
                orderIndex: "asc",
              },
            },
          },
        },
        pledges: {
          where: { status: "fulfilled" },
          columns: {
            id: true,
            amount: true,
            note: true,
            status: true,
            isAnonymous: true,
            donorDisplayName: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!campaign) return null;

  const isStaff =
    current?.profile?.status === "active" &&
    (current.role === "faculty_staff" || current.role === "admin");
  if (campaign.status === "draft" && !isStaff) return null;

  const [applicationTotal] = await db
    .select({ total: count() })
    .from(scholarshipApplications)
    .where(eq(scholarshipApplications.campaignId, id));

  return {
    ...campaign,
    pledges: campaign.pledges.map((p) => ({
      ...p,
      donorDisplayName: p.isAnonymous
        ? "Nhà hảo tâm ẩn danh"
        : p.donorDisplayName,
    })),
    applicationCount: Number(applicationTotal?.total ?? 0),
  };
};

/**
 * Faculty/Admin: Create a scholarship campaign
 */
export const createScholarshipCampaign = async (input: CampaignCreateInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = campaignCreateSchema.parse(input);

  if (validated.applicationFormId) {
    const form = await db.query.forms.findFirst({
      where: { id: validated.applicationFormId },
      columns: { targetRole: true, status: true, deadline: true },
    });
    if (!form || (form.targetRole !== "student" && form.targetRole !== "all")) {
      throw new Error("Biểu mẫu học bổng phải dành cho sinh viên");
    }
    if (
      validated.status === "open" &&
      (form.status !== "open" || (form.deadline && form.deadline <= new Date()))
    ) {
      throw new Error("Biểu mẫu học bổng phải đang mở và chưa hết hạn");
    }
  }

  const [newCampaign] = await db
    .insert(scholarshipCampaigns)
    .values({
      title: validated.title,
      description: validated.description,
      targetAmount: validated.targetAmount.toString(),
      currentAmount: "0",
      applicationDeadline: validated.applicationDeadline,
      applicationFormId: validated.applicationFormId || null,
      status: validated.status,
      createdBy: current.user.id,
    })
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_scholarship_campaign",
    entityType: "scholarship_campaign",
    entityId: newCampaign.id,
    metadata: {
      title: newCampaign.title,
      targetAmount: newCampaign.targetAmount,
    },
  });

  return newCampaign;
};

/**
 * Donor or Faculty: Pledge or record a donation
 */
export const createDonationPledge = async (input: DonationPledgeInput) => {
  // Người dùng bị khóa không được cam kết tài trợ
  const current = await requireActiveUser();

  const validated = donationPledgeSchema.parse(input);

  const targetCampaign = await db.query.scholarshipCampaigns.findFirst({
    where: { id: validated.campaignId },
    columns: { id: true, status: true },
  });
  if (!targetCampaign || targetCampaign.status !== "open") {
    throw new Error("Chiến dịch không tồn tại hoặc không còn nhận tài trợ");
  }

  const isStaff = current.role === "faculty_staff" || current.role === "admin";
  // If staff is entering on behalf of external donor, donorId can be null
  const donorId =
    isStaff && input.donorDisplayName !== current.profile?.fullName
      ? null
      : current.user.id;

  const [pledge] = await db
    .insert(donationPledges)
    .values({
      campaignId: validated.campaignId,
      donorId,
      donorDisplayName: validated.donorDisplayName,
      isAnonymous: validated.isAnonymous,
      amount: validated.amount.toString(),
      status: "pledged",
      note: validated.note || null,
      createdBy: current.user.id,
    })
    .returning();

  await logAuditEvent({
    actorId: current.user.id,
    action: "create_donation_pledge",
    entityType: "donation_pledge",
    entityId: pledge.id,
    metadata: {
      campaignId: validated.campaignId,
      amount: validated.amount,
      donorDisplayName: validated.donorDisplayName,
    },
  });

  return pledge;
};

/**
 * Faculty/Admin: Confirm payment fulfilled
 * MANDATED: Explicit Transaction updating donation_pledges + scholarship_campaigns.currentAmount
 * State machine constraint: ONLY pledged -> fulfilled (cannot un-fulfill)
 */
export const confirmFulfillPledge = async (pledgeId: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(pledgeId)) {
    throw new Error(
      "Mã cam kết không hợp lệ. Vui lòng tải lại trang và chọn cam kết cần xác nhận.",
    );
  }

  // Trạng thái được kiểm tra ngay trong câu UPDATE (pledged -> fulfilled) và nằm
  // trong cùng transaction với việc cộng tiền, nên bấm hai lần cũng chỉ cộng một lần.
  const pledge = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(donationPledges)
      .set({ status: "fulfilled" })
      .where(
        and(
          eq(donationPledges.id, pledgeId),
          eq(donationPledges.status, "pledged"),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error(
        "Cam kết không tồn tại hoặc đã được xử lý trước đó, không thể xác nhận lại.",
      );
    }

    await tx
      .update(scholarshipCampaigns)
      .set({
        currentAmount: sql`${scholarshipCampaigns.currentAmount} + ${updated.amount}`,
      })
      .where(eq(scholarshipCampaigns.id, updated.campaignId));

    return updated;
  });
  const updatedPledge = pledge;

  // Side effects sau khi transaction commit thành công
  await logAuditEvent({
    actorId: current.user.id,
    action: "fulfill_donation_pledge",
    entityType: "donation_pledge",
    entityId: pledge.id,
    metadata: { amount: pledge.amount, campaignId: pledge.campaignId },
  });

  if (pledge.donorId) {
    await sendNotification({
      userId: pledge.donorId,
      type: "donation_fulfilled",
      title: "Xác nhận nhận tiền tài trợ Quỹ Khuyến học",
      body: `Ban quản trị đã nhận được số tiền ${Number(pledge.amount).toLocaleString("vi-VN")} VNĐ từ bạn. Trân trọng cảm ơn tấm lòng hảo tâm!`,
      linkUrl: "/scholarships",
      sendEmail: true,
    });
  }

  return updatedPledge;
};

/**
 * Faculty/Admin: Cancel pledge (pledged -> cancelled only)
 */
export const cancelPledge = async (pledgeId: string) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(pledgeId)) {
    throw new Error(
      "Mã cam kết không hợp lệ. Vui lòng tải lại trang và chọn cam kết cần hủy.",
    );
  }

  const [updated] = await db
    .update(donationPledges)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(donationPledges.id, pledgeId),
        eq(donationPledges.status, "pledged"),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error(
      "Chỉ có thể hủy cam kết khi còn ở trạng thái đang cam kết (pledged).",
    );
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "cancel_donation_pledge",
    entityType: "donation_pledge",
    entityId: updated.id,
    metadata: { campaignId: updated.campaignId },
  });

  return updated;
};

/**
 * Student: Apply for a scholarship
 */
export const applyForScholarship = async (
  campaignId: string,
  formResponseId?: string,
) => {
  const current = await requireRole(["student"]);
  const validated = scholarshipApplicationSchema.parse({
    campaignId,
    formResponseId,
  });

  const campaign = await db.query.scholarshipCampaigns.findFirst({
    where: {
      id: campaignId,
    },
  });

  if (!campaign || campaign.status !== "open") {
    throw new Error("Chiến dịch học bổng đã đóng hoặc không hợp lệ");
  }

  if (new Date() >= new Date(campaign.applicationDeadline)) {
    throw new Error("Đã hết hạn nộp hồ sơ xin học bổng");
  }

  // Kiểm tra trùng lặp: mỗi sinh viên chỉ được nộp 1 hồ sơ cho 1 chiến dịch
  const existing = await db.query.scholarshipApplications.findFirst({
    where: {
      campaignId: campaignId,
      studentId: current.user.id,
    },
  });
  if (existing) {
    throw new Error(
      "Bạn đã nộp hồ sơ cho chiến dịch học bổng này rồi. Vui lòng chờ kết quả xét duyệt.",
    );
  }

  let applicationFormResponseId: string | null = null;
  // Chiến dịch có biểu mẫu bắt buộc phải gắn phản hồi của đúng sinh viên và đúng biểu mẫu.
  if (campaign.applicationFormId) {
    const response = await db.query.formResponses.findFirst({
      where: {
        ...(validated.formResponseId ? { id: validated.formResponseId } : {}),
        respondentId: current.user.id,
        formId: campaign.applicationFormId,
      },
      columns: { id: true, formId: true },
    });
    if (!response) {
      throw new Error(
        "Vui lòng hoàn thành biểu mẫu của chiến dịch trước khi nộp hồ sơ",
      );
    }
    applicationFormResponseId = response.id;
  } else if (validated.formResponseId) {
    throw new Error("Chiến dịch này không sử dụng biểu mẫu ứng tuyển");
  }

  // Ràng buộc duy nhất (campaignId, studentId) ở DB chặn trường hợp bấm đúp
  const [application] = await db
    .insert(scholarshipApplications)
    .values({
      campaignId,
      studentId: current.user.id,
      formResponseId: applicationFormResponseId,
      status: "pending",
    })
    .onConflictDoNothing()
    .returning();

  if (!application) {
    throw new Error(
      "Bạn đã nộp hồ sơ cho chiến dịch học bổng này rồi. Vui lòng chờ kết quả xét duyệt.",
    );
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: "submit_scholarship_application",
    entityType: "scholarship_application",
    entityId: application.id,
    metadata: { campaignId },
  });

  return application;
};

/**
 * Faculty/Admin: Review scholarship application with scoring
 */
export const reviewScholarshipApplication = async (
  applicationId: string,
  input: ScholarshipApplicationReviewInput,
) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(applicationId)) {
    throw new Error(
      "Mã hồ sơ học bổng không hợp lệ. Vui lòng tải lại trang và chọn hồ sơ cần xét duyệt.",
    );
  }
  const validated = scholarshipApplicationReviewSchema.parse(input);

  const [updated] = await db
    .update(scholarshipApplications)
    .set({
      status: validated.status,
      score:
        validated.score !== undefined && validated.score !== null
          ? validated.score.toString()
          : null,
      reviewNote: validated.reviewNote || null,
      reviewedBy: current.user.id,
      decidedAt: validated.status === "reviewing" ? null : new Date(),
    })
    .where(eq(scholarshipApplications.id, applicationId))
    .returning();

  if (!updated) throw new Error("Không tìm thấy hồ sơ");

  // Notify student
  await sendNotification({
    userId: updated.studentId,
    type: "scholarship_application_reviewed",
    title:
      validated.status === "approved"
        ? "Chúc mừng! Hồ sơ học bổng của bạn đã được phê duyệt"
        : validated.status === "reviewing"
          ? "Hồ sơ học bổng của bạn đang được xét duyệt"
          : "Kết quả xét duyệt hồ sơ học bổng: chưa được phê duyệt",
    body:
      validated.status === "approved"
        ? `Điểm đánh giá: ${validated.score ?? "Đạt"}. Ghi chú: ${validated.reviewNote || "Chúc mừng bạn!"}`
        : validated.status === "reviewing"
          ? `Hội đồng đang xem xét hồ sơ của bạn. ${validated.reviewNote || "Vui lòng theo dõi thông báo kết quả."}`
          : `Nhận xét: ${validated.reviewNote || "Chưa đạt điều kiện đợt này."}`,
    linkUrl: "/student/scholarships",
    sendEmail: true,
  });

  await logAuditEvent({
    actorId: current.user.id,
    action: `review_scholarship_application_${validated.status}`,
    entityType: "scholarship_application",
    entityId: updated.id,
    metadata: { score: validated.score, status: validated.status },
  });

  return updated;
};

/**
 * Student: Get my scholarship applications
 */
export const getMyScholarshipApplications = async () => {
  const current = await getCurrentUser();
  if (!current?.user || current.profile?.status !== "active") return [];

  return await db.query.scholarshipApplications.findMany({
    where: {
      studentId: current.user.id, // hoặc { studentId: { eq: current.user.id } }
    },
    with: {
      campaign: true,
      reviewer: {
        columns: { id: true, name: true },
        with: { profile: { columns: { fullName: true } } },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
};

/**
 * Faculty/Admin: Get all campaigns with pledges and application counts
 */
export const getAllCampaignsForFaculty = async () => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.scholarshipCampaigns.findMany({
    with: {
      pledges: true,
      applications: true,
      creator: {
        with: { profile: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Faculty/Admin: Get campaign details with all pledges and applications
 */
export const getCampaignDetailsForFaculty = async (campaignId: string) => {
  await requireRole(["faculty_staff", "admin"]);
  if (!isEntityId(campaignId)) return undefined;

  return await db.query.scholarshipCampaigns.findFirst({
    where: {
      id: campaignId,
    },
    with: {
      pledges: {
        orderBy: {
          createdAt: "desc",
        },
        with: {
          donor: {
            with: { profile: true },
          },
        },
      },
      applications: {
        with: {
          student: {
            with: { profile: true },
          },
          reviewer: {
            with: { profile: true },
          },
          formResponse: {
            with: {
              answers: { with: { question: true } },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      },
    },
  });
};

/**
 * Faculty/Admin: Get all applications for review
 */
export const getAllApplicationsForReview = async (campaignId?: string) => {
  await requireRole(["faculty_staff", "admin"]);
  if (campaignId !== undefined && !isEntityId(campaignId)) return [];

  return await db.query.scholarshipApplications.findMany({
    where: campaignId ? { campaignId: campaignId } : undefined,
    with: {
      campaign: true,
      student: {
        with: { profile: true },
      },
      reviewer: {
        with: { profile: true },
      },
      formResponse: {
        with: {
          answers: { with: { question: true } },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
};
