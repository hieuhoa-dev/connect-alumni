import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEMO_COOKIE_NAME, isDemoEnabled, verifyDemoCookie } from "@/lib/demo-accounts";

const PROTECTED_PREFIXES = ["/student", "/employer", "/faculty-admin", "/dashboard"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const hasAuthToken =
      request.cookies.has("better-auth.session_token") ||
      request.cookies.has("__Secure-better-auth.session_token");

    let hasValidDemoToken = false;
    if (isDemoEnabled()) {
      const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)?.value;
      hasValidDemoToken = Boolean(verifyDemoCookie(demoCookie));
    }

    if (!hasAuthToken && !hasValidDemoToken) {
      const loginUrl = new URL("/login", request.url);
      const nextParam = `${pathname}${search}`;
      loginUrl.searchParams.set("next", nextParam);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - api/auth (auth routes)
     * - static public assets (.svg, .png, .jpg, .webp, .css, .js)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
