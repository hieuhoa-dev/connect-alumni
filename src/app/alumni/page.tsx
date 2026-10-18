import * as React from "react";
import { getCurrentUser } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { AlumniDirectoryView } from "./alumni-directory-view";
import { Users, GraduationCap, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const AlumniDirectoryPage = async () => {
  const current = await getCurrentUser();
  if (!current?.user) {
    redirect("/login?next=/alumni");
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B7A3E] to-[#156030] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold tracking-wide text-white mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Mạng lưới Tri thức & Hợp tác
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Danh bạ Cựu sinh viên DLU
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-50 leading-relaxed">
            Kết nối cùng các thế hệ cựu sinh viên Đại học Đà Lạt đang làm việc tại các tập đoàn công nghệ, viện nghiên cứu và khởi nghiệp sáng tạo trên toàn quốc.
          </p>
        </div>
        <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
          <GraduationCap className="h-56 w-56 text-white" />
        </div>
      </div>

      {/* Directory Component */}
      <React.Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />}>
        <AlumniDirectoryView />
      </React.Suspense>
    </div>
  );
};

export default AlumniDirectoryPage;
