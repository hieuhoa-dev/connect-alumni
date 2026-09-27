"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Building2,
  PlusCircle,
  Users,
  ShieldCheck,
  FileCheck2,
  ScrollText,
  LogOut,
  ExternalLink,
  PanelLeft,
  X,
} from "lucide-react";
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
  useAnimatedSidebar,
} from "@/components/motion/animated-sidebar";
import {
  NotificationsPopover,
  type NotificationItem,
} from "@/components/shared/notifications-popover";
import { CompanySwitcher } from "@/components/shared/company-switcher";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

export interface SidebarProps {
  role: "student" | "alumni" | "employer" | "faculty_staff" | "admin";
  userName: string;
  userEmail: string;
  notifications?: NotificationItem[];
  companies?: any[];
}

const getInitials = (name?: string): string => {
  if (!name) return "CA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getRoleBadge = (role: SidebarProps["role"]) => {
  switch (role) {
    case "admin":
      return (
        <span className="inline-flex items-center rounded-full border border-[#F5C2C4]/60 bg-[#FDEBEC] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#9F2F2D] dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
          Quản trị viên
        </span>
      );
    case "faculty_staff":
      return (
        <span className="inline-flex items-center rounded-full border border-[#BFDFFA]/60 bg-[#E1F3FE] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#1F6C9F] dark:border-sky-900/40 dark:bg-sky-950/40 dark:text-sky-300">
          Nhân sự Khoa
        </span>
      );
    case "employer":
      return (
        <span className="inline-flex items-center rounded-full border border-[#CDE3CB]/60 bg-[#EDF3EC] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#346538] dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          Doanh nghiệp
        </span>
      );
    case "alumni":
      return (
        <span className="inline-flex items-center rounded-full border border-[#EFE0B2]/60 bg-[#FBF3DB] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#956400] dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">
          Cựu sinh viên
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-[#E3E2DF]/60 bg-[#F1F1EF] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[#37352F] dark:border-zinc-700/40 dark:bg-zinc-800 dark:text-zinc-300">
          Sinh viên
        </span>
      );
  }
};

const SidebarInner = ({
  role,
  userName,
  userEmail,
  notifications = [],
  companies,
}: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useAnimatedSidebar();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const getNavSections = (): { title: string; items: NavItem[] }[] => {
    if (role === "admin" || role === "faculty_staff") {
      return [
        {
          title: "Vận hành chung",
          items: [
            { label: "Bảng thống kê", href: "/faculty-admin/dashboard", icon: LayoutDashboard },
            { label: "Duyệt doanh nghiệp", href: "/faculty-admin/companies/review", icon: Building2 },
            { label: "Duyệt tin tuyển dụng", href: "/faculty-admin/jobs/review", icon: Briefcase },
            { label: "Duyệt bài chia sẻ", href: "/faculty-admin/experiences/review", icon: BookOpen },
          ],
        },
        {
          title: "Sự kiện & Khảo sát",
          items: [
            { label: "Quản lý sự kiện", href: "/faculty-admin/events", icon: Calendar },
            { label: "Form & Khảo sát", href: "/faculty-admin/forms", icon: ClipboardList },
          ],
        },
        {
          title: "Quỹ Khuyến học",
          items: [
            { label: "Chiến dịch học bổng", href: "/faculty-admin/scholarships/campaigns", icon: GraduationCap },
            { label: "Xét duyệt hồ sơ", href: "/faculty-admin/scholarships/applications/review", icon: FileCheck2 },
          ],
        },
        ...(role === "admin"
          ? [
              {
                title: "Hệ thống (Admin)",
                items: [
                  { label: "Quản lý người dùng", href: "/faculty-admin/users", icon: Users, adminOnly: true },
                  { label: "Nhật ký Audit Log", href: "/faculty-admin/audit-logs", icon: ScrollText, adminOnly: true },
                ],
              },
            ]
          : []),
      ];
    }

    if (role === "employer") {
      return [
        {
          title: "Không gian Doanh nghiệp",
          items: [
            { label: "Tổng quan", href: "/employer/dashboard", icon: LayoutDashboard },
            { label: "Hồ sơ công ty", href: "/employer/onboarding", icon: Building2 },
            { label: "Tin tuyển dụng", href: "/employer/jobs", icon: Briefcase },
            { label: "Đăng tin mới", href: "/employer/jobs/new", icon: PlusCircle },
            { label: "Tài trợ học bổng", href: "/employer/scholarships/pledge", icon: GraduationCap },
          ],
        },
      ];
    }

    // Student & Alumni
    return [
      {
        title: "Hoạt động & Cơ hội",
        items: [
          { label: "Bảng điều khiển", href: "/student/dashboard", icon: LayoutDashboard },
          { label: "Sự kiện & Hội thảo", href: "/student/events", icon: Calendar },
          { label: "Tìm việc làm", href: "/jobs", icon: Briefcase },
          { label: "Biểu mẫu & Khảo sát", href: "/student/surveys", icon: ClipboardList },
          { label: "Học bổng & Hỗ trợ", href: "/student/scholarships", icon: GraduationCap },
          ...(role === "alumni"
            ? [{ label: "Viết bài chia sẻ", href: "/student/experiences/new", icon: BookOpen }]
            : []),
        ],
      },
    ];
  };

  const sections = getNavSections();
  const initials = getInitials(userName);

  const isItemActive = (href: string) => {
    if (
      href === "/student/dashboard" ||
      href === "/employer/dashboard" ||
      href === "/faculty-admin/dashboard"
    ) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <AnimatedSidebar
        ariaLabel="Bảng điều khiển Connect Alumni"
        collapsible="icon"
        className="h-screen shrink-0"
        panelClassName="h-screen border-r border-border/80 bg-card/95 backdrop-blur-sm flex flex-col justify-between"
      >
        {/* Header with App Branding and Rail/Close Trigger */}
        <AnimatedSidebarHeader className="p-3 pb-2 border-b border-border/40">
          <div className="flex min-h-11 items-center gap-3 overflow-hidden px-1">
            <button
              type="button"
              onClick={toggleSidebar}
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background outline-none transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
              title="Đổi chế độ thu gọn / mở rộng (⌘B)"
            >
              {role === "admin" || role === "faculty_staff" ? (
                <ShieldCheck aria-hidden="true" className="size-4" />
              ) : role === "employer" ? (
                <Building2 aria-hidden="true" className="size-4" />
              ) : (
                <GraduationCap aria-hidden="true" className="size-4" />
              )}
            </button>

            <div className="flex min-w-0 flex-1 flex-col group-data-[state=collapsed]/sidebar:hidden">
              <span className="truncate text-xs font-bold tracking-tight text-foreground uppercase">
                Connect Alumni
              </span>
              <span className="truncate text-[10px] text-muted-foreground font-mono">
                {role === "admin"
                  ? "Quản trị Khoa CNTT"
                  : role === "faculty_staff"
                    ? "Vận hành Khoa CNTT"
                    : role === "employer"
                      ? "Cổng Doanh nghiệp"
                      : "Cổng Sinh viên & Cựu SV"}
              </span>
            </div>

            <AnimatedSidebarTrigger className="hidden md:inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground group-data-[state=collapsed]/sidebar:hidden">
              <PanelLeft aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Thu gọn thanh điều hướng</span>
            </AnimatedSidebarTrigger>

            <AnimatedSidebarClose className="ml-auto text-muted-foreground hover:bg-muted md:hidden">
              <X aria-hidden="true" className="size-4" />
            </AnimatedSidebarClose>
          </div>

          {/* Optional Company Switcher in Header for Employer */}
          {role === "employer" && companies && companies.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/40 group-data-[state=collapsed]/sidebar:hidden">
              <CompanySwitcher companies={companies} />
            </div>
          )}
        </AnimatedSidebarHeader>

        {/* Content Navigation */}
        <AnimatedSidebarContent className="px-2 pt-2">
          {/* Notifications as first-class Sidebar menu item */}
          <AnimatedSidebarGroup className="pb-1">
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                <AnimatedSidebarMenuItem>
                  <NotificationsPopover
                    notifications={notifications}
                    isSidebarItem
                    side="right"
                    align="start"
                    sideOffset={12}
                  />
                </AnimatedSidebarMenuItem>
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>

          {/* Navigation Groups */}
          {sections.map((section) => (
            <AnimatedSidebarGroup key={section.title} className="pb-3">
              <AnimatedSidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {section.title}
              </AnimatedSidebarGroupLabel>
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu>
                  {section.items.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <AnimatedSidebarMenuItem key={item.href}>
                        <AnimatedSidebarMenuButton
                          isActive={active}
                          icon={<item.icon className="size-4" />}
                          onSelect={() => router.push(item.href)}
                        >
                          {item.label}
                        </AnimatedSidebarMenuButton>
                      </AnimatedSidebarMenuItem>
                    );
                  })}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          ))}
        </AnimatedSidebarContent>

        {/* Footer Profile & Actions */}
        <AnimatedSidebarFooter className="border-t border-border/50 p-2.5 gap-2">
          {/* Collapsed state quick icon buttons */}
          <div className="hidden group-data-[state=collapsed]/sidebar:flex flex-col items-center gap-2 py-1">
            <div
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold text-foreground border border-border/80"
              title={`${userName} (${userEmail})`}
            >
              {initials}
            </div>
            <Link
              href="/"
              title="Về Cổng thông tin công khai"
              className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ExternalLink className="size-4" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              title="Đăng xuất"
              className="grid size-8 place-items-center rounded-lg text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <LogOut className="size-4" />
            </button>
          </div>

          {/* Expanded state profile card */}
          <div className="flex flex-col gap-2 group-data-[state=collapsed]/sidebar:hidden">
            <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/40 p-2">
              <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground text-background text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-xs font-medium text-foreground">
                    {userName}
                  </span>
                  {getRoleBadge(role)}
                </div>
                <span className="block truncate text-[11px] text-muted-foreground font-mono">
                  {userEmail}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                <span>Cổng thông tin</span>
                <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border border-border/80 bg-background px-1 py-0.5 text-[9px] font-mono text-muted-foreground">
                  ⌘B
                </kbd>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut className="size-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </AnimatedSidebarFooter>

        <AnimatedSidebarRail />
      </AnimatedSidebar>

      {/* Floating trigger for mobile when sidebar is hidden */}
      <div className="fixed bottom-4 left-4 z-40 md:hidden">
        <AnimatedSidebarTrigger className="flex size-10 items-center justify-center rounded-xl bg-foreground text-background shadow-md transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring">
          <PanelLeft className="size-4" />
          <span className="sr-only">Mở thanh điều hướng</span>
        </AnimatedSidebarTrigger>
      </div>
    </>
  );
};

export const Sidebar = ({
  role,
  userName,
  userEmail,
  notifications,
  companies,
}: SidebarProps) => {
  return (
    <AnimatedSidebarProvider className="w-auto h-screen shrink-0 flex overflow-hidden">
      <SidebarInner
        role={role}
        userName={userName}
        userEmail={userEmail}
        notifications={notifications}
        companies={companies}
      />
    </AnimatedSidebarProvider>
  );
};
