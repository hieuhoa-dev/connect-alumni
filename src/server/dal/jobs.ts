import { db } from "@/db";

export interface PublicCompanySummaryDTO {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  industry: string;
  verificationStatus: string;
}

export interface PublicJobPostDTO {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: string;
  salaryRange: string | null;
  applyUrlOrEmail: string;
  expiresAt: Date;
  createdAt: Date;
  company: PublicCompanySummaryDTO;
}

/**
 * Data Access Layer: Query public active job posts.
 * Strictly verifies post is approved, company is verified, and expiration is in future.
 */
export async function getPublicJobPosts(params?: {
  search?: string;
  industry?: string;
  jobType?: "full_time" | "part_time" | "internship";
  location?: string;
  limit?: number;
  offset?: number;
}): Promise<PublicJobPostDTO[]> {
  const now = new Date();
  const limit = params?.limit || 50;
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

  // Enforce company verification status
  let verified = posts.filter(
    (p) => p.company && p.company.verificationStatus === "verified"
  );

  if (params?.industry) {
    const indLower = params.industry.toLowerCase();
    verified = verified.filter((p) =>
      p.company?.industry?.toLowerCase().includes(indLower)
    );
  }

  if (params?.search) {
    const q = params.search.toLowerCase();
    verified = verified.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.company?.name.toLowerCase().includes(q)
    );
  }

  return verified.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    requirements: p.requirements,
    location: p.location,
    jobType: p.jobType,
    salaryRange: p.salaryRange,
    applyUrlOrEmail: p.applyUrlOrEmail,
    expiresAt: p.expiresAt,
    createdAt: p.createdAt,
    company: {
      id: p.company!.id,
      name: p.company!.name,
      logoUrl: p.company!.logoUrl,
      website: p.company!.website,
      industry: p.company!.industry,
      verificationStatus: p.company!.verificationStatus,
    },
  }));
}

/**
 * Data Access Layer: Query single public job post by ID.
 */
export async function getPublicJobPostById(
  id: string
): Promise<PublicJobPostDTO | null> {
  const now = new Date();
  const p = await db.query.jobPosts.findFirst({
    where: {
      id,
    },
    with: {
      company: true,
    },
  });

  if (
    !p ||
    p.status !== "approved" ||
    !p.company ||
    p.company.verificationStatus !== "verified" ||
    new Date(p.expiresAt) <= now
  ) {
    return null;
  }

  return {
    id: p.id,
    title: p.title,
    description: p.description,
    requirements: p.requirements,
    location: p.location,
    jobType: p.jobType,
    salaryRange: p.salaryRange,
    applyUrlOrEmail: p.applyUrlOrEmail,
    expiresAt: p.expiresAt,
    createdAt: p.createdAt,
    company: {
      id: p.company.id,
      name: p.company.name,
      logoUrl: p.company.logoUrl,
      website: p.company.website,
      industry: p.company.industry,
      verificationStatus: p.company.verificationStatus,
    },
  };
}
