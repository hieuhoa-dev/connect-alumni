"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DLULogo } from "@/components/shared/dlu-logo";
import {
  Briefcase,
  Calendar,
  BookOpen,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  ArrowRight,
} from "lucide-react";
import { cn } from "cn";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [demoUser, setDemoUser] = React.useState<any>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/current-user")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setDemoUser({
            user: data.user,
            profile: data.profile,
            role: data.role,
          });
        } else {
          setDemoUser(null);
        }
      })
      .catch(() => setDemoUser(null));
  }, [pathname]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeUser = session?.user || demoUser?.user;

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: null },
    { href: "/jobs", label: "Việc làm", icon: Briefcase },
    { href: "/events", label: "Sự kiện", icon: Calendar },
    { href: "/experiences", label: "Góc chia sẻ", icon: BookOpen },
    { href: "/scholarships", label: "Quỹ học bổng", icon: HeartHandshake },
  ];

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/demo-logout", { method: "POST" });
    } catch (e) {}
    try {
      await authClient.signOut();
    } catch (e) {}
    setDemoUser(null);
    router.push("/login");
    router.refresh();
  };

  const getDashboardHref = () => {
    const role = demoUser?.role || "student";
    if (role === "admin" || role === "faculty_staff") {
      return "/faculty-admin/dashboard";
    }
    if (role === "employer") {
      return "/employer/dashboard";
    }
    return "/student/dashboard";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-pine-950/95 backdrop-blur-md shadow-brand border-b border-border"
          : "bg-white dark:bg-pine-950 border-b border-border/80",
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand: Logo & Tên Trường Đại học Đà Lạt */}
        <Link
          href="/"
          className="flex items-center gap-3 transition hover:opacity-95 group"
        >
          <DLULogo size={40} className="shadow-xs" />
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-pine-800 dark:text-pine-200">
              DLU CONNECT
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-sun-600 dark:text-sun-500 leading-tight mt-0.5 uppercase tracking-wider">
              Trường Đại học Đà Lạt
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors rounded-lg",
                  isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-pine-50/70 dark:hover:bg-pine-900/40",
                )}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                <span>{link.label}</span>

                {/* Active indicator: 2px sliding bottom bar */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-sun-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth Section */}
        <div className="hidden md:flex items-center gap-2.5">
          {activeUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-1 pr-3 border border-border hover:bg-pine-50 dark:hover:bg-pine-900/40 transition-colors cursor-pointer"
                  />
                }
              >
                <Avatar className="h-8 w-8 border border-pine-600/30">
                  <AvatarImage src={activeUser.image || undefined} />
                  <AvatarFallback className="bg-pine-100 text-pine-800 font-bold text-xs">
                    {activeUser.name?.slice(0, 2).toUpperCase() || "DLU"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold max-w-[130px] truncate text-foreground">
                  {activeUser.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-brand-lg">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none text-foreground">
                        {activeUser.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {activeUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(getDashboardHref())}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4 text-pine-600" />
                  <span>Trang điều khiển</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : (
            <div className="flex items-center gap-2">
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                Đăng nhập
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                variant="sun"
                size="sm"
                className="rounded-full shadow-sun px-4 text-xs font-bold"
              >
                Đăng ký
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu sheet trigger */}
        <div className="flex md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Mở menu điều hướng"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] p-0 flex flex-col justify-between">
              <div>
                <SheetHeader className="p-5 border-b border-border">
                  <div className="flex items-center gap-3">
                    <DLULogo size={36} />
                    <div className="flex flex-col text-left">
                      <SheetTitle className="text-base font-extrabold text-pine-800 leading-none">
                        DLU CONNECT
                      </SheetTitle>
                      <span className="text-[10px] font-semibold text-sun-600 mt-0.5 uppercase">
                        Trường Đại học Đà Lạt
                      </span>
                    </div>
                  </div>
                </SheetHeader>

                <div className="p-4 space-y-1">
                  {navLinks.map((link) => {
                    const isActive =
                      link.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 h-12 rounded-xl text-sm font-medium transition-colors",
                          isActive
                            ? "bg-pine-100 text-pine-900 font-bold"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        {link.icon && <link.icon className="h-4 w-4 text-pine-600" />}
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Auth Bottom Bar */}
              <div className="p-5 border-t border-border bg-canvas space-y-3">
                {activeUser ? (
                  <>
                    <Button
                      render={<Link href={getDashboardHref()} />}
                      nativeButton={false}
                      onClick={() => setMobileOpen(false)}
                      className="w-full h-11 justify-start gap-2 text-sm font-semibold"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Trang điều khiển</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="w-full h-10 text-destructive border-destructive/20"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      render={<Link href="/login" />}
                      nativeButton={false}
                      variant="outline"
                      onClick={() => setMobileOpen(false)}
                      className="w-full h-11"
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      render={<Link href="/register" />}
                      nativeButton={false}
                      variant="sun"
                      onClick={() => setMobileOpen(false)}
                      className="w-full h-11 font-bold"
                    >
                      Đăng ký
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
