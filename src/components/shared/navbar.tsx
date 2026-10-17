"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  X,
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [demoUser, setDemoUser] = React.useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-[#1E4D2B]/15 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand: Logo & Tên Trường Đại học Đà Lạt */}
        <Link
          href="/"
          className="flex items-center gap-3 transition hover:opacity-95"
        >
          <DLULogo size={42} />
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight leading-none text-[#1E4D2B]">
              DLU ALUMNI
            </span>
            <span className="text-[11px] font-semibold text-[#E67300] leading-tight mt-0.5 uppercase tracking-wide">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-[#1E4D2B] text-white font-semibold"
                    : "text-muted-foreground hover:bg-[#1E4D2B]/10 hover:text-[#1E4D2B]"
                }`}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {activeUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full p-1 border border-border hover:bg-muted transition-colors cursor-pointer"
                  />
                }
              >
                <Avatar className="h-8 w-8 border border-[#1E4D2B]/20">
                  <AvatarImage src={activeUser.image || undefined} />
                  <AvatarFallback className="bg-[#1E4D2B]/10 text-[#1E4D2B] font-semibold text-xs">
                    {activeUser.name?.slice(0, 2).toUpperCase() || "DLU"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium max-w-[140px] truncate text-foreground pr-1">
                  {activeUser.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
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
                  <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
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
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className={buttonVariants({
                  size: "sm",
                  className: "bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white",
                })}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted"
            >
              {link.icon && (
                <link.icon className="h-4 w-4 text-muted-foreground" />
              )}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            {activeUser ? (
              <>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-[#1E4D2B]/10 text-[#1E4D2B]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Trang điều khiển ({activeUser.name})
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full justify-center",
                  })}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={buttonVariants({
                    size: "sm",
                    className:
                      "w-full justify-center bg-[#1E4D2B] hover:bg-[#1E4D2B]/90 text-white",
                  })}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
