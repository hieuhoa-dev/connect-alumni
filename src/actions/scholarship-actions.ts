"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  scholarshipCampaigns,
  donationPledges,
  scholarshipApplications,
} from "@/db/schema";
import { getCurrentUser, requireRole } from "@/lib/permissions";
import {
  campaignCreateSchema,
  donationPledgeSchema,
  scholarshipApplicationReviewSchema,
  CampaignCreateInput,
  DonationPledgeInput,
  ScholarshipApplicationReviewInput,
} from "@/validators/scholarship-schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

/**
 * Public: Get active scholarship campaigns
 */
export const getScholarshipCampaigns = async () => {
  return await db.query.scholarshipCampaigns.findMany({
    where: {
      status: "open", // hoặc { status: { eq: "open" } }
    },
    with: {
      pledges: true,
      applications: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
/**
 * Get campaign by ID
 */
export const getCampaignById = async (id: string) => {
  return await db.query.scholarshipCampaigns.findFirst({
    where: {
      id: id, // hoặc { id: { eq: id } }
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
        orderBy: {
          createdAt: "desc",
        },
      },
      applications: {
        with: {
          student: {
            with: {
              profile: true,
            },
          },
        },
      },
    },
  });
};

/**
 * Faculty/Admin: Create a scholarship campaign
 */
export const createScholarshipCampaign = async (input: CampaignCreateInput) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = campaignCreateSchema.parse(input);

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
  const current = await getCurrentUser();
  if (!current?.user) {
    throw new Error("Vui lòng đăng nhập để cam kết tài trợ hoặc nhập ghi nhận");
  }

  const validated = donationPledgeSchema.parse(input);

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

  // Pre-fetch và validate ngoài transaction để giảm thời gian giữ lock
  const pledge = await db.query.donationPledges.findFirst({
    where: {
      id: pledgeId,
    },
  });
  if (!pledge) {
    throw new Error("Không tìm thấy cam kết tài trợ");
  }
  if (pledge.status !== "pledged") {
    throw new Error(
      `Cam kết đang ở trạng thái "${pledge.status}", không thể xác nhận nhận tiền.`,
    );
  }

  // Transaction chỉ bao gồm 2 UPDATE nguyên tử — không có side effects
  const updatedPledge = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(donationPledges)
      .set({ status: "fulfilled" })
      .where(eq(donationPledges.id, pledgeId))
      .returning();

    await tx
      .update(scholarshipCampaigns)
      .set({
        currentAmount: sql`${scholarshipCampaigns.currentAmount} + ${pledge.amount}`,
      })
      .where(eq(scholarshipCampaigns.id, pledge.campaignId));

    return updated;
  });

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
      body: `Khoa đã nhận được số tiền ${Number(pledge.amount).toLocaleString("vi-VN")} VNĐ từ bạn. Trân trọng cảm ơn tấm lòng hảo tâm!`,
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

  const pledge = await db.query.donationPledges.findFirst({
    where: {
      id: pledgeId,
    },
  });

  if (!pledge) throw new Error("Không tìm thấy cam kết");
  if (pledge.status !== "pledged") {
    throw new Error(
      "Chỉ có thể hủy cam kết khi còn ở trạng thái đang cam kết (pledged).",
    );
  }

  const [updated] = await db
    .update(donationPledges)
    .set({ status: "cancelled" })
    .where(eq(donationPledges.id, pledgeId))
    .returning();

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

  const campaign = await db.query.scholarshipCampaigns.findFirst({
    where: {
      id: campaignId,
    },
  });

  if (!campaign || campaign.status !== "open") {
    throw new Error("Chiến dịch học bổng đã đóng hoặc không hợp lệ");
  }

  if (new Date() > new Date(campaign.applicationDeadline)) {
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

  const [application] = await db
    .insert(scholarshipApplications)
    .values({
      campaignId,
      studentId: current.user.id,
      formResponseId: formResponseId || null,
      status: "pending",
    })
    .returning();

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
      decidedAt: new Date(),
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
        : `Kết quả xét duyệt hồ sơ học bổng: ${validated.status}`,
    body:
      validated.status === "approved"
        ? `Điểm đánh giá: ${validated.score || "Đạt"}. Ghi chú: ${validated.reviewNote || "Chúc mừng bạn!"}`
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
  if (!current?.user) return [];

  return await db.query.scholarshipApplications.findMany({
    where: {
      studentId: current.user.id, // hoặc { studentId: { eq: current.user.id } }
    },
    with: {
      campaign: true,
      reviewer: {
        with: { profile: true },
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
              answers: true,
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
          answers: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });
};
