import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CLIENT_SESSION_COOKIE_NAME = "sentra_session";
const protectedPrefixes = [
  "/admin",
  "/ai",
  "/audit",
  "/analytics",
  "/app",
  "/autonomy",
  "/board",
  "/behavior",
  "/cloud",
  "/dashboard",
  "/growth",
  "/investor",
  "/iot",
  "/map",
  "/ml",
  "/mobile/staff",
  "/mobile/responder",
  "/operations",
  "/revenue",
  "/security",
  "/settings",
  "/twin",
];
const ACCESS_COOKIE_NAME = "sentra_access_token";
const REFRESH_COOKIE_NAME = "sentra_refresh_token";
const BACKEND_PROXY_ORIGIN =
  process.env.BACKEND_PROXY_ORIGIN?.trim() || "http://127.0.0.1:8000";

function isProtectedRoute(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    const url = new URL("/app", request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  if (pathname === "/app/dashboard" || pathname === "/app/dashboard/") {
    const url = new URL("/app", request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  if (pathname === "/landing" || pathname === "/landing/") {
    const url = new URL("/", request.url);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  const clientSession = request.cookies.get(CLIENT_SESSION_COOKIE_NAME)?.value;
  const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value;
  const hasSession = clientSession === "active" || Boolean(accessToken || refreshToken);

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    const backendPath = pathname === "/api" ? "/" : pathname.replace(/^\/api/, "");
    const backendUrl = new URL(`${BACKEND_PROXY_ORIGIN}${backendPath}${request.nextUrl.search}`);
    return NextResponse.rewrite(backendUrl);
  }

  if (pathname === "/soc" || pathname.startsWith("/soc/")) {
    const backendUrl = new URL(`${BACKEND_PROXY_ORIGIN}${pathname}${request.nextUrl.search}`);
    return NextResponse.rewrite(backendUrl);
  }

  if (isProtectedRoute(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/ai/:path*",
    "/audit/:path*",
    "/analytics/:path*",
    "/app/:path*",
    "/autonomy/:path*",
    "/board/:path*",
    "/behavior/:path*",
    "/cloud/:path*",
    "/dashboard/:path*",
    "/growth/:path*",
    "/investor/:path*",
    "/iot/:path*",
    "/map/:path*",
    "/ml/:path*",
    "/mobile/staff/:path*",
    "/mobile/responder/:path*",
    "/operations/:path*",
    "/revenue/:path*",
    "/security/:path*",
    "/settings/:path*",
    "/twin/:path*",
    "/login",
    "/soc/:path*",
    "/api/:path*",
  ],
};
