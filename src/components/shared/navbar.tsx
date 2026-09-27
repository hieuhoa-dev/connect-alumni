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
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Briefcase,
  Calendar,
  BookOpen,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: null },
    { href: "/jobs", label: "Việc làm", icon: Briefcase },
    { href: "/events", label: "Sự kiện", icon: Calendar },
    { href: "/experiences", label: "Góc chia sẻ", icon: BookOpen },
    { href: "/scholarships", label: "Quỹ học bổng", icon: HeartHandshake },
  ];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const getDashboardHref = () => {
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight leading-none text-foreground">
              CONNECT ALUMNI
            </span>
            <span className="text-[11px] font-medium text-muted-foreground leading-tight">
              Khoa Công nghệ Thông tin
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
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarImage src={session.user.image || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {session.user.name?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium max-w-[120px] truncate text-foreground">
                  {session.user.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {session.user.email}
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
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Đăng nhập
              </Link>
              <Link href="/register" className={buttonVariants({ size: "sm" })}>
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
            {session?.user ? (
              <>
                <Link
                  href={getDashboardHref()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-secondary text-foreground"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Trang điều khiển ({session.user.name})
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
                    className: "w-full justify-center",
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
