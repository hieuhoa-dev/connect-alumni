import { db } from "@/db";

export interface PublicPledgeDTO {
  id: string;
  donorDisplayName: string;
  isAnonymous: boolean;
  amount: string;
  status: string;
  createdAt: Date;
}

export interface PublicCampaignDTO {
  id: string;
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  progressPercent: number;
  applicationDeadline: Date;
  status: string;
  slots: number | null;
  pledgesCount: number;
  recentPledges: PublicPledgeDTO[];
  createdAt: Date;
}

/**
 * Data Access Layer: Query public scholarship campaigns.
 * Strictly hides applicant student details, application records, and donor user IDs.
 */
export async function getPublicCampaigns(): Promise<PublicCampaignDTO[]> {
  const campaigns = await db.query.scholarshipCampaigns.findMany({
    where: {
      status: "open",
    },
    with: {
      pledges: {
        where: {
          status: "fulfilled",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return campaigns.map((c) => {
    const target = Number(c.targetAmount) || 1;
    const current = Number(c.currentAmount) || 0;
    const progressPercent = Math.min(Math.round((current / target) * 100), 100);

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      targetAmount: c.targetAmount,
      currentAmount: c.currentAmount,
      progressPercent,
      applicationDeadline: c.applicationDeadline,
      status: c.status,
      slots: c.slots,
      pledgesCount: c.pledges.length,
      recentPledges: c.pledges.slice(0, 10).map((p) => ({
        id: p.id,
        donorDisplayName: p.isAnonymous ? "Nhà hảo tâm ẩn danh" : p.donorDisplayName,
        isAnonymous: p.isAnonymous,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      })),
      createdAt: c.createdAt,
    };
  });
}

/**
 * Data Access Layer: Query single campaign by ID with public DTO.
 */
export async function getPublicCampaignById(
  id: string
): Promise<PublicCampaignDTO | null> {
  const c = await db.query.scholarshipCampaigns.findFirst({
    where: {
      id,
    },
    with: {
      pledges: {
        where: {
          status: "fulfilled",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!c || c.status === "draft") {
    return null;
  }

  const target = Number(c.targetAmount) || 1;
  const current = Number(c.currentAmount) || 0;
  const progressPercent = Math.min(Math.round((current / target) * 100), 100);

  return {
    id: c.id,
    title: c.title,
    description: c.description,
    targetAmount: c.targetAmount,
    currentAmount: c.currentAmount,
    progressPercent,
    applicationDeadline: c.applicationDeadline,
    status: c.status,
    slots: c.slots,
    pledgesCount: c.pledges.length,
    recentPledges: c.pledges.slice(0, 10).map((p) => ({
      id: p.id,
      donorDisplayName: p.isAnonymous ? "Nhà hảo tâm ẩn danh" : p.donorDisplayName,
      isAnonymous: p.isAnonymous,
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt,
    })),
    createdAt: c.createdAt,
  };
}
