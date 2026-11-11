import { NextResponse, type NextRequest } from "next/server";

/**
 * Subdomain routing.
 *   admin.<root>/x        → /admin/x
 *   <slug>.<root>/x       → /t/<slug>/x
 * The real path routes (/admin, /t/<slug>) keep working on every host,
 * so the app also runs on *.netlify.app and localhost without any DNS setup.
 *
 * Set NEXT_PUBLIC_ROOT_DOMAIN (e.g. "yourapp.com") to turn subdomains on.
 * For local testing use "localhost" and open http://khalid-wire.localhost:3000
 */

const ROOT = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").toLowerCase();

export function middleware(req: NextRequest) {
  if (!ROOT) return NextResponse.next();

  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0] ?? "";
  if (host === ROOT || host === `www.${ROOT}` || !host.endsWith(`.${ROOT}`)) return NextResponse.next();

  const sub = host.slice(0, -(ROOT.length + 1));
  if (!sub || sub.includes(".")) return NextResponse.next();

  const url = req.nextUrl.clone();
  const path = url.pathname === "/" ? "" : url.pathname;
  const headers = new Headers(req.headers);

  if (sub === "admin") {
    if (path.startsWith("/admin")) return NextResponse.next();
    url.pathname = `/admin${path}`;
    headers.set("x-admin-base", "");
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (path.startsWith(`/t/${sub}`)) return NextResponse.next();
  url.pathname = `/t/${sub}${path}`;
  headers.set("x-tenant-base", "");
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Skip Next internals and files with an extension (images, fonts, favicon…)
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
