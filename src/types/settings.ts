export interface SiteSettingsDto {
  contactPhone: string;
  contactEmail: string;
  websiteUrl: string;
  address: string;
  mapUrl: string;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  zaloUrl?: string | null;
  aiSurveySummaryEnabled: boolean;
  aiWritingAssistantEnabled: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsDto = {
  contactPhone: "+84 263 3822 246",
  contactEmail: "it@dlu.edu.vn",
  websiteUrl: "https://dlu.edu.vn",
  address: "Tòa nhà A7, Số 01 Phù Đổng Thiên Vương, Phường 8, TP. Đà Lạt, Lâm Đồng",
  mapUrl: "https://maps.google.com/?q=Dai+hoc+Da+Lat",
  facebookUrl: "https://facebook.com/DLUConnectAlumni",
  youtubeUrl: "https://youtube.com/@DLUConnect",
  zaloUrl: null,
  aiSurveySummaryEnabled: false,
  aiWritingAssistantEnabled: false,
};
