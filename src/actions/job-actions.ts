"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobPosts, companies, companyMembers } from "@/db/schema";
import { requireRole, requireCompanyContext, getCurrentUser } from "@/lib/permissions";
import { jobPostSchema, jobReviewSchema, JobPostInput, JobReviewInput } from "@/validators/job-schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";

/**
 * Public & Student: Get active approved job posts with filtering
 */
export const getActiveJobPosts = async (params?: {
  search?: string;
  industry?: string;
  jobType?: "full_time" | "part_time" | "internship";
  location?: string;
  limit?: number;
  offset?: number;
}) => {
  const now = new Date();
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  const whereConditions: Record<string, any> = {
    status: "approved",
    expiresAt: { gt: now },
  };

  if (params?.jobType) {
    whereConditions.jobType = params.jobType;
  }

  if (params?.location) {
    whereConditions.location = { ilike: `%${params.location}%` };
  }

  if (params?.search) {
    whereConditions.OR = [
      { title: { ilike: `%${params.search}%` } },
      { description: { ilike: `%${params.search}%` } },
      { requirements: { ilike: `%${params.search}%` } },
    ];
  }

  const posts = await db.query.jobPosts.findMany({
    where: whereConditions,
    with: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    limit,
    offset,
  });

  // Post-filter theo industry (industry nằm trên companies, không thể filter trực tiếp trong where của jobPosts)
  if (params?.industry) {
    const industryLower = params.industry.toLowerCase();
    return posts.filter(
      (p) => p.company?.industry?.toLowerCase().includes(industryLower),
    );
  }

  return posts;
};

/**
 * Get job post by ID
 */
export const getJobPostById = async (id: string) => {
  const post = await db.query.jobPosts.findFirst({
    where: {
      id: id,
    },
    with: {
      company: true,
      reviewer: {
        with: {
          profile: true,
        },
      },
    },
  });

  return post;
};

/**
 * Employer: Create a job post
 * Enforces company membership and active context
 */
export const createJobPost = async (input: JobPostInput) => {
  const validated = jobPostSchema.parse(input);
  const context = await requireCompanyContext(validated.companyId);

  // Check if company is verified by faculty
  const company = await db.query.companies.findFirst({
    where: {
      id: validated.companyId,
    },
  });

  if (!company || company.verificationStatus !== "verified") {
    throw new Error(
      "Doanh nghiệp của bạn đang chờ Khoa phê duyệt hoặc chưa được xác minh. Chưa thể đăng tin.",
    );
  }

  const [newPost] = await db
    .insert(jobPosts)
    .values({
      companyId: validated.companyId,
      title: validated.title,
      description: validated.description,
      requirements: validated.requirements,
      location: validated.location,
      jobType: validated.jobType,
      salaryRange: validated.salaryRange || null,
      applyUrlOrEmail: validated.applyUrlOrEmail,
      expiresAt: validated.expiresAt,
      status: "pending",
    })
    .returning();

  await logAuditEvent({
    actorId: context.user.id,
    action: "create_job_post",
    entityType: "job_post",
    entityId: newPost.id,
    metadata: { title: newPost.title, companyId: validated.companyId },
  });

  return newPost;
};

/**
 * Employer: Get all job posts for current active company
 */
export const getEmployerJobs = async (companyId?: string) => {
  const context = await requireCompanyContext(companyId);

  return await db.query.jobPosts.findMany({
    where: {
      companyId: context.companyId!,
    },
    with: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Faculty/Admin: Review job post (Approve / Reject)
 */
export const reviewJobPost = async (data: {
  jobId: string;
  status: "approved" | "rejected";
  rejectedReason?: string;
}) => {
  const current = await requireRole(["faculty_staff", "admin"]);
  const validated = jobReviewSchema.parse({
    status: data.status,
    rejectedReason: data.rejectedReason,
  });

  const [updated] = await db
    .update(jobPosts)
    .set({
      status: validated.status,
      rejectedReason: validated.rejectedReason || null,
      reviewedBy: current.user.id,
      reviewedAt: new Date(),
    })
    .where(eq(jobPosts.id, data.jobId))
    .returning();

  if (!updated) {
    throw new Error("Không tìm thấy tin tuyển dụng");
  }

  // Get company members to notify
  const members = await db.query.companyMembers.findMany({
    where: {
      companyId: updated.companyId,
    },
  });

  for (const m of members) {
    await sendNotification({
      userId: m.userId,
      type: "job_reviewed",
      title:
        validated.status === "approved"
          ? `Tin tuyển dụng "${updated.title}" đã được duyệt!`
          : `Tin tuyển dụng "${updated.title}" bị từ chối`,
      body:
        validated.status === "approved"
          ? "Tin hiện đã hiển thị công khai cho toàn thể sinh viên và cựu sinh viên."
          : `Lý do: ${validated.rejectedReason || "Nội dung chưa phù hợp tiêu chí."}`,
      linkUrl: `/employer/jobs`,
      sendEmail: true,
    });
  }

  await logAuditEvent({
    actorId: current.user.id,
    action: `review_job_post_${validated.status}`,
    entityType: "job_post",
    entityId: updated.id,
    metadata: { status: validated.status, reason: validated.rejectedReason },
  });

  return updated;
};

/**
 * Faculty/Admin: Get all jobs for review with filters
 */
export const getJobsForFacultyReview = async (status?: "pending" | "approved" | "rejected" | "expired") => {
  await requireRole(["faculty_staff", "admin"]);

  return await db.query.jobPosts.findMany({
    where: status ? { status } : undefined,
    with: {
      company: true,
      reviewer: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
