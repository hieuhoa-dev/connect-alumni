import { notFound } from "next/navigation";
import { requireRole } from "@/lib/permissions";
import { getAdminAlbumById } from "@/server/dal/gallery";
import { AlbumDetailAdminClient } from "./album-detail-admin-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

const FacultyAdminAlbumDetailPage = async ({ params }: PageProps) => {
  await requireRole(["faculty_staff", "admin"]);
  const { id } = await params;

  const data = await getAdminAlbumById(id);
  if (!data) {
    notFound();
  }

  return <AlbumDetailAdminClient album={data.album} initialPhotos={data.photos} />;
};

export default FacultyAdminAlbumDetailPage;
