import { db } from "@/db";
import { events, experiencePosts, scholarshipCampaigns } from "@/db/schema";
import { eq, desc, gte, and } from "drizzle-orm";
import type { TickerItemDto } from "@/types/ticker";

export type { TickerItemDto };

export const getLiveTickerItems = async (): Promise<TickerItemDto[]> => {
  try {
    const items: TickerItemDto[] = [];
    const now = new Date();

    // 1. Upcoming published events
    const upcomingEvents = await db
      .select({
        id: events.id,
        title: events.title,
        startTime: events.startTime,
      })
      .from(events)
      .where(
        and(
          eq(events.status, "published"),
          gte(events.startTime, now),
        ),
      )
      .orderBy(events.startTime)
      .limit(2);

    for (const ev of upcomingEvents) {
      const d = ev.startTime ? new Date(ev.startTime) : null;
      items.push({
        id: `ev-${ev.id}`,
        tag: "SỰ KIỆN",
        title: ev.title,
        href: `/events`,
        date: d ? `${d.getDate()}/${d.getMonth() + 1}` : undefined,
        isHot: true,
      });
    }

    // 2. Open scholarship campaigns
    const activeCampaigns = await db
      .select({
        id: scholarshipCampaigns.id,
        title: scholarshipCampaigns.title,
        deadline: scholarshipCampaigns.applicationDeadline,
      })
      .from(scholarshipCampaigns)
      .where(eq(scholarshipCampaigns.status, "open"))
      .orderBy(desc(scholarshipCampaigns.createdAt))
      .limit(2);

    for (const sc of activeCampaigns) {
      const d = sc.deadline ? new Date(sc.deadline) : null;
      items.push({
        id: `sc-${sc.id}`,
        tag: "HỌC BỔNG",
        title: sc.title,
        href: `/scholarships`,
        date: d ? `Hạn: ${d.getDate()}/${d.getMonth() + 1}` : undefined,
        isHot: true,
      });
    }

    // 3. Latest published experience posts
    const latestPosts = await db
      .select({
        id: experiencePosts.id,
        title: experiencePosts.title,
        createdAt: experiencePosts.createdAt,
      })
      .from(experiencePosts)
      .where(eq(experiencePosts.status, "published"))
      .orderBy(desc(experiencePosts.createdAt))
      .limit(3);

    for (const post of latestPosts) {
      const d = post.createdAt ? new Date(post.createdAt) : null;
      items.push({
        id: `exp-${post.id}`,
        tag: "CHIA SẺ",
        title: post.title,
        href: `/experiences`,
        date: d ? `${d.getDate()}/${d.getMonth() + 1}` : undefined,
      });
    }

    return items;
  } catch (err) {
    console.warn("[getLiveTickerItems] Database offline or unavailable, returning empty list.");
    return [];
  }
};
