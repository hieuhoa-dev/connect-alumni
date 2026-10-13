"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { companies, jobPosts } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit";
import { sendNotification } from "@/lib/notifications";
import { requireCompanyContext, requireRole } from "@/lib/permissions";
import { getPagination, isEntityId } from "@/lib/query-input";
import {
  type JobPostInput,
  jobPostSchema,
  jobReviewSchema,
} from "@/validators/job-schema";

const PUBLIC_COMPANY_COLUMNS = {
  id: true,
  name: true,
  description: true,
  industry: true,
  website: true,
  logoUrl: true,
  verificationStatus: true,
} as const;

const PUBLIC_JOB_COLUMNS = {
  id: true,
  companyId: true,
  title: true,
  description: true,
  requirements: true,
  location: true,
  jobType: true,
  salaryRange: true,
  applyUrlOrEmail: true,
  status: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

const effectiveJobStatus = (
  post: { status: typeof jobPosts.$inferSelect.status; expiresAt: Date },
  now: Date,
) =>
  post.status === "approved" && post.expiresAt <= now ? "expired" : post.status;

const literalSearchPattern = (value?: string) => {
  const keyword = value?.trim().slice(0, 160);
  return keyword ? `%${keyword.replace(/[\\%_]/g, "\\$&")}%` : undefined;
};

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
  const { limit, offset } = getPagination(params);
  const jobType = jobPostSchema.shape.jobType.safeParse(params?.jobType);
  const search = literalSearchPattern(params?.search);
  const industry = literalSearchPattern(params?.industry);
  const location = literalSearchPattern(params?.location);

  return await db.query.jobPosts.findMany({
    columns: PUBLIC_JOB_COLUMNS,
    where: {
      status: "approved",
      expiresAt: { gt: now },
      ...(jobType.success ? { jobType: jobType.data } : {}),
      ...(location ? { location: { ilike: location } } : {}),
      ...(search
        ? {
            OR: [
              { title: { ilike: search } },
              { description: { ilike: search } },
              { requirements: { ilike: search } },
              { company: { name: { ilike: search } } },
            ],
          }
        : {}),
      company: {
        verificationStatus: "verified",
        ...(industry ? { industry: { ilike: industry } } : {}),
      },
    },
    with: {
      company: { columns: PUBLIC_COMPANY_COLUMNS },
    },
    orderBy: {
      createdAt: "desc",
    },
    limit,
    offset,
  });
};

/**
 * Get job post by ID
 */
export const getJobPostById = async (id: string) => {
  if (!isEntityId(id)) return undefined;
  const post = await db.query.jobPosts.findFirst({
    columns: PUBLIC_JOB_COLUMNS,
    where: {
      id,
      status: { in: ["approved", "expired"] },
      company: { verificationStatus: "verified" },
    },
    with: {
      company: { columns: PUBLIC_COMPANY_COLUMNS },
    },
  });

  return post
    ? { ...post, status: effectiveJobStatus(post, new Date()) }
    : undefined;
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
      "Doanh nghiệp của bạn đang chờ Ban quản trị phê duyệt hoặc chưa được xác minh. Chưa thể đăng tin.",
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

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");
  revalidatePath("/faculty-admin/jobs/review");
  return newPost;
};

/**
 * Employer: Get all job posts for current active company
 */
export const getEmployerJobs = async (companyId?: string) => {
  if (companyId !== undefined && !isEntityId(companyId)) {
    throw new Error("ID doanh nghiệp không hợp lệ");
  }
  const context = await requireCompanyContext(companyId);
  if (!context.companyId) return [];

  const posts = await db.query.jobPosts.findMany({
    where: {
      companyId: context.companyId,
    },
    with: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const now = new Date();
  return posts.map((post) => ({
    ...post,
    status: effectiveJobStatus(post, now),
  }));
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
  if (!isEntityId(data.jobId))
    throw new Error("ID tin tuyển dụng không hợp lệ");
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
    .where(
      and(
        eq(jobPosts.id, data.jobId),
        validated.status === "approved"
          ? gt(jobPosts.expiresAt, new Date())
          : undefined,
        validated.status === "approved"
          ? sql`${jobPosts.companyId} in (select ${companies.id} from ${companies} where ${companies.verificationStatus} = ${"verified"})`
          : undefined,
      ),
    )
    .returning();

  if (!updated) {
    throw new Error(
      validated.status === "approved"
        ? "Tin tuyển dụng không tồn tại, đã hết hạn hoặc doanh nghiệp chưa được xác minh"
        : "Không tìm thấy tin tuyển dụng",
    );
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

  revalidatePath("/employer/dashboard");
  revalidatePath("/employer/jobs");
  revalidatePath("/faculty-admin/jobs/review");
  revalidatePath("/jobs");
  revalidatePath("/jobs/[id]", "page");
  revalidatePath("/");
  return updated;
};

/**
 * Faculty/Admin: Get all jobs for review with filters
 */
export const getJobsForFacultyReview = async (
  status?: "pending" | "approved" | "rejected" | "expired",
) => {
  await requireRole(["faculty_staff", "admin"]);
  const now = new Date();

  const posts = await db.query.jobPosts.findMany({
    where:
      status === "approved"
        ? { status: "approved", expiresAt: { gt: now } }
        : status === "expired"
          ? {
              OR: [
                { status: "expired" },
                { status: "approved", expiresAt: { lte: now } },
              ],
            }
          : status
            ? { status }
            : undefined,
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
  return posts.map((post) => ({
    ...post,
    status: effectiveJobStatus(post, now),
  }));
};
