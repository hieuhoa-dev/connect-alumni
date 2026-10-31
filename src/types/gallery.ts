export interface PublicAlbumPhotoDto {
  id: string;
  albumId: string;
  fileId: string;
  fileKey: string;
  caption: string | null;
  takenAt: Date | null;
  sortOrder: number;
  thumbUrl: string;
  fullUrl: string;
}

export interface PublicAlbumDto {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  publishedAt: Date | null;
  eventId: string | null;
  eventTitle?: string | null;
  coverPhotoUrl: string;
  photoCount: number;
}
