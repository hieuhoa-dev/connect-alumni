"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { DluLogo } from "@/components/shared/dlu-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { SITE } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/news", label: "Tin tức" },
  { href: "/events", label: "Sự kiện" },
  { href: "/experiences", label: "Góc chia sẻ" },
  { href: "/jobs", label: "Việc làm" },
  { href: "/scholarships", label: "Quỹ khuyến học" },
];

const communityLinks = [
  { href: "/about", label: "Giới thiệu" },
  { href: "/contact", label: "Liên hệ" },
];

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mobileMenuTrigger = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        mobileMenuTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    closeMobileMenu();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="/"
          aria-label="Tải lại trang chủ DLU Alumni"
          onClick={closeMobileMenu}
          className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:gap-4"
        >
          <DluLogo className="size-12 sm:size-14" alt="" preload />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xl font-bold tracking-tight text-primary sm:text-[28px]">
              {SITE.appName}
            </span>
            <span className="text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
              {SITE.tagline}
            </span>
          </div>
        </a>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {isPending ? (
            <Skeleton className="h-8 w-36" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" />}
                className="gap-2"
              >
                <Avatar className="size-7">
                  <AvatarImage src={session.user.image || undefined} alt="" />
                  <AvatarFallback>
                    {session.user.name?.slice(0, 2).toUpperCase() || "SV"}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-40 truncate">{session.user.name}</span>
                <span aria-hidden="true">⌄</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="truncate font-semibold text-foreground">
                        {session.user.name}
                      </span>
                      <span className="truncate">{session.user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/dashboard" />}>
                    Trang điều khiển
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleSignOut}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="outline"
              >
                Đăng nhập
              </Button>
              <Button render={<Link href="/register" />} nativeButton={false}>
                Tham gia cộng đồng
              </Button>
            </>
          )}
        </div>

        <Button
          ref={mobileMenuTrigger}
          variant="outline"
          size="icon-lg"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {mobileMenuOpen ? (
              <path d="m6 6 12 12M6 18 18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </Button>
      </div>

      <Separator />
      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-6 px-8 lg:flex">
        <nav aria-label="Điều hướng chính" className="flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "border-b-2 py-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive(link.href)
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground hover:border-primary hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <nav
          aria-label="Thông tin cộng đồng"
          className="flex items-center gap-5"
        >
          {communityLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "border-b-2 py-3 text-[13px] font-medium transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive(link.href)
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Điều hướng trên thiết bị di động"
          className="flex max-h-[calc(100dvh-7rem)] flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6 lg:hidden"
        >
          {[...navLinks, ...communityLinks].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              onClick={closeMobileMenu}
              className={cn(
                "rounded-md px-3 py-2.5 text-sm decoration-primary underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                isActive(link.href)
                  ? "bg-accent font-semibold text-primary underline decoration-2"
                  : "text-foreground hover:bg-muted hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Separator className="my-3" />
          {isPending ? (
            <Skeleton className="h-8 w-full" />
          ) : session?.user ? (
            <div className="flex flex-col gap-3">
              <p className="px-3 text-xs text-muted-foreground">
                {session.user.name}
              </p>
              <Button
                render={<Link href="/dashboard" />}
                nativeButton={false}
                onClick={closeMobileMenu}
              >
                Trang điều khiển
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Đăng xuất
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                variant="outline"
                onClick={closeMobileMenu}
              >
                Đăng nhập
              </Button>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                onClick={closeMobileMenu}
              >
                Tham gia
              </Button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
