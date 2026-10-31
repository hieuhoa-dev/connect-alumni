import * as React from "react";
import { notFound } from "next/navigation";
import { getPublicAlbumById } from "@/server/dal/gallery";
import { AlbumViewClient } from "./album-view-client";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

const PublicAlbumDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const data = await getPublicAlbumById(id);

  if (!data) {
    notFound();
  }

  return <AlbumViewClient album={data.album} photos={data.photos} />;
};

export default PublicAlbumDetailPage;
