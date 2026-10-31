import { requireRole } from "@/lib/permissions";
import { getAdminAlbums } from "@/server/dal/gallery";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { GalleryAdminClient } from "./gallery-admin-client";

export const dynamic = "force-dynamic";

const FacultyAdminGalleryPage = async () => {
  await requireRole(["faculty_staff", "admin"]);

  const [albums, eventRows] = await Promise.all([
    getAdminAlbums(),
    db
      .select({
        id: events.id,
        title: events.title,
        startTime: events.startTime,
      })
      .from(events)
      .orderBy(desc(events.startTime))
      .limit(50),
  ]);

  return <GalleryAdminClient initialAlbums={albums} availableEvents={eventRows} />;
};

export default FacultyAdminGalleryPage;
