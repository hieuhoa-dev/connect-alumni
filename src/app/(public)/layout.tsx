import type * as React from "react";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="public-canvas min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
