import { db } from "@/db";
import { profiles, companies, scholarshipCampaigns, events } from "@/db/schema";
import { eq, sql, count, and } from "drizzle-orm";
import type { NetworkStatItem } from "@/types/stats";

export type { NetworkStatItem };

export const getNetworkStats = async (): Promise<NetworkStatItem[]> => {
  try {
    // 1. Alumni count (prioritize verified, fallback to total alumni profiles)
    const [verifiedAlumniRes] = await db
      .select({ count: count() })
      .from(profiles)
      .where(
        and(
          eq(profiles.role, "alumni"),
          sql`${profiles.alumniVerifiedAt} IS NOT NULL`,
        ),
      );
    let alumniCount = Number(verifiedAlumniRes?.count ?? 0);
    if (alumniCount === 0) {
      const [allAlumniRes] = await db
        .select({ count: count() })
        .from(profiles)
        .where(eq(profiles.role, "alumni"));
      alumniCount = Number(allAlumniRes?.count ?? 0);
    }

    // 2. Verified partner companies
    const [companiesRes] = await db
      .select({ count: count() })
      .from(companies)
      .where(eq(companies.verificationStatus, "verified"));
    const companiesCount = Number(companiesRes?.count ?? 0);

    // 3. Scholarship funds raised (sum currentAmount in VND)
    const [scholarshipRes] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${scholarshipCampaigns.currentAmount}), 0)`,
      })
      .from(scholarshipCampaigns);
    const rawFund = Number(scholarshipRes?.total ?? 0);
    // Convert to millions if > 1M, or raw
    const fundInMillions = Math.round(rawFund / 1_000_000);

    // 4. Published events
    const [eventsRes] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.status, "published"));
    const eventsCount = Number(eventsRes?.count ?? 0);

    const items: NetworkStatItem[] = [];

    // Only add cards with non-zero or meaningful data, or provide honest status
    items.push({
      value: alumniCount,
      suffix: alumniCount > 0 ? "+" : "",
      label: "Cựu Sinh Viên DLU",
      desc:
        alumniCount > 0
          ? "Mạng lưới cựu sinh viên kết nối qua nền tảng"
          : "Đang cập nhật danh bạ cựu sinh viên",
    });

    items.push({
      value: companiesCount,
      suffix: companiesCount > 0 ? "+" : "",
      label: "Doanh Nghiệp Đối Tác",
      desc:
        companiesCount > 0
          ? "Đã xác thực hợp tác tuyển dụng & thực tập"
          : "Đang mở rộng mạng lưới doanh nghiệp đối tác",
    });

    if (fundInMillions > 0) {
      items.push({
        value: fundInMillions,
        suffix: "M+",
        prefix: "₫",
        label: "Quỹ Học Bổng Đồng Hành",
        desc: "Đã và đang vận động hỗ trợ sinh viên",
      });
    }

    items.push({
      value: eventsCount,
      suffix: eventsCount > 0 ? "+" : "",
      label: "Sự Kiện Kết Nối",
      desc:
        eventsCount > 0
          ? "Workshop, tọa đàm & ngày hội tuyển dụng"
          : "Các hoạt động giao lưu đang được lên kế hoạch",
    });

    return items;
  } catch (err) {
    console.warn("[getNetworkStats] Database offline or unavailable, returning empty stats.");
    return [];
  }
};
