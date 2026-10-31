import * as React from "react";
import { getPublicAlbums } from "@/server/dal/gallery";
import { GalleryPublicClient } from "./gallery-public-client";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ page?: string; year?: string }>;
}

const PublicGalleryPage = async ({ searchParams }: PageProps) => {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const year = resolvedParams.year ? parseInt(resolvedParams.year, 10) : undefined;

  const data = await getPublicAlbums({ page, year, limit: 12 });

  return (
    <GalleryPublicClient
      albums={data.albums}
      total={data.total}
      years={data.years}
      currentPage={page}
      selectedYear={year}
    />
  );
};

export default PublicGalleryPage;
