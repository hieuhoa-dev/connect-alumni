import * as React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { QuickRail } from "@/components/shared/quick-rail";
import { getSiteSettings } from "@/server/dal/settings";

const PublicLayout = async ({ children }: { children: React.ReactNode }) => {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-pine-200 selection:text-pine-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuickRail settings={settings} />
    </div>
  );
};

export default PublicLayout;
