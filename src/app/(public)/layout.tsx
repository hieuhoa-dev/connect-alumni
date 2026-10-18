import * as React from "react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { QuickRail } from "@/components/shared/quick-rail";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-pine-200 selection:text-pine-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <QuickRail />
    </div>
  );
};

export default PublicLayout;
