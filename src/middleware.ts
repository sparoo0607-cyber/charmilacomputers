import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;

  // Domain Canonicalization:
  // Redirect Vercel deployment domain and www subdomain to primary canonical domain
  // https://charmilacomputers.in
  const isVercelDomain = host.includes("charmilacomputers.vercel.app");
  const isWwwDomain = host === "www.charmilacomputers.in" || host.startsWith("www.charmilacomputers.");

  if (isVercelDomain || isWwwDomain) {
    const canonicalUrl = new URL(`https://charmilacomputers.in${pathname}${search}`);
    return NextResponse.redirect(canonicalUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png, manifest.webmanifest, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
