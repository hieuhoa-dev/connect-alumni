import { db } from "@/db";
import { profiles, user } from "@/db/schema";
import { eq, and, isNotNull, or, ilike, sql, desc, count } from "drizzle-orm";

export interface AlumniDirectoryQuery {
  search?: string;
  batchYear?: number;
  major?: string;
  province?: string;
  industry?: string;
  employmentStatus?: "employed" | "self_employed" | "seeking" | "studying" | "other";
  page?: number;
  limit?: number;
  viewerRole?: string;
}

export interface AlumniProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  batchYear: number | null;
  graduationYear: number | null;
  faculty: string | null;
  major: string | null;
  province: string | null;
  industry: string | null;
  currentTitle: string | null;
  currentCompanyName: string | null;
  employmentStatus: string | null;
  skills: string[] | null;
  bio: string | null;
  visibility: "public" | "members" | "private";
  email?: string | null;
  phone?: string | null;
}

/**
 * DAL: Get public or network alumni directory
 * Enforces privacy rules:
 * - Must be alumni role and verified (alumniVerifiedAt is not null)
 * - Must be active account
 * - private profiles are never exposed to public or regular users (only faculty_staff or admin)
 */
export const getAlumniDirectory = async (
  query: AlumniDirectoryQuery,
): Promise<{ alumni: AlumniProfileDTO[]; total: number; page: number; totalPages: number }> => {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(50, Math.max(1, query.limit || 20));
  const offset = (page - 1) * limit;

  // Base conditions: active, verified alumni
  const conditions: any[] = [
    eq(profiles.role, "alumni"),
    eq(profiles.status, "active"),
    isNotNull(profiles.alumniVerifiedAt),
  ];

  // Visibility privacy rule
  const isFacultyOrAdmin =
    query.viewerRole === "faculty_staff" || query.viewerRole === "admin";

  if (!isFacultyOrAdmin) {
    // Normal users cannot see private profiles
    conditions.push(or(eq(profiles.visibility, "public"), eq(profiles.visibility, "members")));
  }

  // Filters
  if (query.batchYear) {
    conditions.push(eq(profiles.batchYear, query.batchYear));
  }
  if (query.major) {
    conditions.push(ilike(profiles.major, `%${query.major}%`));
  }
  if (query.province) {
    conditions.push(ilike(profiles.province, `%${query.province}%`));
  }
  if (query.industry) {
    conditions.push(ilike(profiles.industry, `%${query.industry}%`));
  }
  if (query.employmentStatus) {
    conditions.push(eq(profiles.employmentStatus, query.employmentStatus));
  }

  if (query.search) {
    const term = `%${query.search.trim()}%`;
    conditions.push(
      or(
        ilike(profiles.fullName, term),
        ilike(profiles.currentCompanyName, term),
        ilike(profiles.currentTitle, term),
        ilike(profiles.bio, term),
      ),
    );
  }

  const whereClause = and(...conditions);

  // Count total
  const [totalRes] = await db
    .select({ count: count() })
    .from(profiles)
    .where(whereClause);

  const total = totalRes?.count || 0;

  // Fetch items
  const rows = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      batchYear: profiles.batchYear,
      graduationYear: profiles.graduationYear,
      faculty: profiles.faculty,
      major: profiles.major,
      province: profiles.province,
      industry: profiles.industry,
      currentTitle: profiles.currentTitle,
      currentCompanyName: profiles.currentCompanyName,
      employmentStatus: profiles.employmentStatus,
      skills: profiles.skills,
      bio: profiles.bio,
      visibility: profiles.visibility,
      showEmail: profiles.showEmail,
      showPhone: profiles.showPhone,
      userEmail: user.email,
      phone: profiles.phone,
    })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(whereClause)
    .orderBy(desc(profiles.alumniVerifiedAt), desc(profiles.createdAt))
    .limit(limit)
    .offset(offset);

  const alumni: AlumniProfileDTO[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    fullName: r.fullName,
    avatarUrl: r.avatarUrl,
    batchYear: r.batchYear,
    graduationYear: r.graduationYear,
    faculty: r.faculty,
    major: r.major,
    province: r.province,
    industry: r.industry,
    currentTitle: r.currentTitle,
    currentCompanyName: r.currentCompanyName,
    employmentStatus: r.employmentStatus,
    skills: r.skills,
    bio: r.bio,
    visibility: r.visibility,
    email: r.showEmail ? r.userEmail : null,
    phone: r.showPhone ? r.phone : null,
  }));

  return {
    alumni,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * DAL: Get single alumni profile by userId
 */
export const getAlumniProfileById = async (
  userId: string,
  viewerRole?: string,
): Promise<AlumniProfileDTO | null> => {
  const isFacultyOrAdmin =
    viewerRole === "faculty_staff" || viewerRole === "admin";

  const rows = await db
    .select({
      id: profiles.id,
      userId: profiles.userId,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
      batchYear: profiles.batchYear,
      graduationYear: profiles.graduationYear,
      faculty: profiles.faculty,
      major: profiles.major,
      province: profiles.province,
      industry: profiles.industry,
      currentTitle: profiles.currentTitle,
      currentCompanyName: profiles.currentCompanyName,
      employmentStatus: profiles.employmentStatus,
      skills: profiles.skills,
      bio: profiles.bio,
      visibility: profiles.visibility,
      showEmail: profiles.showEmail,
      showPhone: profiles.showPhone,
      userEmail: user.email,
      phone: profiles.phone,
      status: profiles.status,
      alumniVerifiedAt: profiles.alumniVerifiedAt,
    })
    .from(profiles)
    .leftJoin(user, eq(profiles.userId, user.id))
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!rows.length) return null;
  const r = rows[0];

  // If not faculty/admin, check visibility
  if (!isFacultyOrAdmin && r.visibility === "private") {
    return null;
  }

  return {
    id: r.id,
    userId: r.userId,
    fullName: r.fullName,
    avatarUrl: r.avatarUrl,
    batchYear: r.batchYear,
    graduationYear: r.graduationYear,
    faculty: r.faculty,
    major: r.major,
    province: r.province,
    industry: r.industry,
    currentTitle: r.currentTitle,
    currentCompanyName: r.currentCompanyName,
    employmentStatus: r.employmentStatus,
    skills: r.skills,
    bio: r.bio,
    visibility: r.visibility,
    email: r.showEmail || isFacultyOrAdmin ? r.userEmail : null,
    phone: r.showPhone || isFacultyOrAdmin ? r.phone : null,
  };
};
