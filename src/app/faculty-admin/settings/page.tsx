import * as React from "react";
import { getSiteSettings } from "@/server/dal/settings";
import { SettingsClient } from "./settings-client";
import { requireRole } from "@/lib/permissions";

export const metadata = {
  title: "Thiết lập hệ thống & Liên hệ | Khoa CNTT - Trường ĐH Đà Lạt",
};

const SettingsPage = async () => {
  await requireRole(["faculty_staff", "admin"]);
  const settings = await getSiteSettings();

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6">
      <SettingsClient initialSettings={settings} />
    </div>
  );
};

export default SettingsPage;
