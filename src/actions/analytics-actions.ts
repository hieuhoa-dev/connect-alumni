"use server";

import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  jobPosts,
  events,
  eventRegistrations,
  scholarshipCampaigns,
  donationPledges,
  scholarshipApplications,
  profiles,
} from "@/db/schema";
import { requireRole } from "@/lib/permissions";

export const getFacultyDashboardAnalytics = async () => {
  await requireRole(["faculty_staff", "admin"]);

  // 1. Overview Counts
  const [pendingCompanies] = await db
    .select({ val: count() })
    .from(companies)
    .where(eq(companies.verificationStatus, "pending"));

  const [verifiedCompanies] = await db
    .select({ val: count() })
    .from(companies)
    .where(eq(companies.verificationStatus, "verified"));

  const [pendingJobs] = await db
    .select({ val: count() })
    .from(jobPosts)
    .where(eq(jobPosts.status, "pending"));

  const [approvedJobs] = await db
    .select({ val: count() })
    .from(jobPosts)
    .where(eq(jobPosts.status, "approved"));

  const [expiredJobs] = await db
    .select({ val: count() })
    .from(jobPosts)
    .where(eq(jobPosts.status, "expired"));

  const [totalStudents] = await db
    .select({ val: count() })
    .from(profiles)
    .where(eq(profiles.role, "student"));

  const [totalAlumni] = await db
    .select({ val: count() })
    .from(profiles)
    .where(eq(profiles.role, "alumni"));

  // 2. Jobs by Industry
  const jobsByIndustry = await db
    .select({
      industry: companies.industry,
      count: count(jobPosts.id),
    })
    .from(jobPosts)
    .innerJoin(companies, eq(jobPosts.companyId, companies.id))
    .groupBy(companies.industry);

  // 3. Event Participation Stats
  const totalEvents = await db.select({ val: count() }).from(events);
  const totalRegistrations = await db
    .select({ val: count() })
    .from(eventRegistrations);
  const attendedRegistrations = await db
    .select({ val: count() })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.attendanceStatus, "attended"));

  // 4. Scholarship Fund Totals
  const fundTotals = await db
    .select({
      totalTarget: sql<string>`coalesce(sum(${scholarshipCampaigns.targetAmount}), 0)`,
      totalFulfilled: sql<string>`coalesce(sum(${scholarshipCampaigns.currentAmount}), 0)`,
    })
    .from(scholarshipCampaigns);

  const [pledgedTotal] = await db
    .select({
      totalPledged: sql<string>`coalesce(sum(${donationPledges.amount}), 0)`,
    })
    .from(donationPledges)
    .where(eq(donationPledges.status, "pledged"));

  // 5. Scholarship Applications by Status
  const applicationsByStatus = await db
    .select({
      status: scholarshipApplications.status,
      count: count(),
    })
    .from(scholarshipApplications)
    .groupBy(scholarshipApplications.status);

  // 6. Recent Audit Logs
  const recentLogs = await db.query.auditLogs.findMany({
    with: {
      actor: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    limit: 15,
  });

  // 7. Employment Rate by Graduation Batch (Aggregated from Alumni Profiles)
  const batchAlumniStats = await db
    .select({
      batchYear: profiles.batchYear,
      count: count(),
    })
    .from(profiles)
    .where(eq(profiles.role, "alumni"))
    .groupBy(profiles.batchYear);

  return {
    overview: {
      pendingCompanies: pendingCompanies.val,
      verifiedCompanies: verifiedCompanies.val,
      pendingJobs: pendingJobs.val,
      approvedJobs: approvedJobs.val,
      expiredJobs: expiredJobs.val,
      totalStudents: totalStudents.val,
      totalAlumni: totalAlumni.val,
      totalEvents: totalEvents[0]?.val || 0,
      totalRegistrations: totalRegistrations[0]?.val || 0,
      attendedRegistrations: attendedRegistrations[0]?.val || 0,
      attendanceRate:
        (totalRegistrations[0]?.val || 0) > 0
          ? Math.round(
              ((attendedRegistrations[0]?.val || 0) /
                (totalRegistrations[0]?.val || 1)) *
                100,
            )
          : 0,
      totalTargetFund: Number(fundTotals[0]?.totalTarget || 0),
      totalFulfilledFund: Number(fundTotals[0]?.totalFulfilled || 0),
      totalPledgedFund: Number(pledgedTotal?.totalPledged || 0),
    },
    jobsByIndustry,
    applicationsByStatus,
    batchAlumniStats,
    recentLogs,
  };
};

/**
 * Admin: Get complete audit logs with pagination and search
 */
export const getAuditLogs = async (limit = 50, offset = 0) => {
  await requireRole("admin");

  return await db.query.auditLogs.findMany({
    with: {
      actor: {
        with: {
          profile: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    limit,
    offset,
  });
};
