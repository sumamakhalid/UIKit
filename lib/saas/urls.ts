/**
 * Where things live.
 *
 * Subdomain mode (production, needs NEXT_PUBLIC_ROOT_DOMAIN + wildcard DNS):
 *   yourapp.com                → landing
 *   admin.yourapp.com          → super admin   (also yourapp.com/admin)
 *   khalid-wire.yourapp.com    → tenant panel  (also yourapp.com/t/khalid-wire)
 *
 * Path mode (default, works on any host incl. *.netlify.app and localhost):
 *   /admin, /t/khalid-wire
 *
 * middleware.ts rewrites subdomains to the path routes, so both work at once.
 */

export const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "").toLowerCase();

/** Subdomains that can never be a tenant slug. */
export const RESERVED_SLUGS = ["www", "admin", "app", "api", "t", "login", "static", "mail", "help", "status"];

export function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug) && !RESERVED_SLUGS.includes(slug);
}

function onRootDomain() {
  if (!ROOT_DOMAIN || typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === ROOT_DOMAIN || h.endsWith("." + ROOT_DOMAIN);
}

/** Full link to a tenant panel — subdomain when available, otherwise /t/slug. Use in click handlers. */
export function tenantUrl(slug: string, path = "") {
  const p = path ? (path.startsWith("/") ? path : "/" + path) : "";
  if (onRootDomain()) return `${window.location.protocol}//${slug}.${ROOT_DOMAIN}${window.location.port ? ":" + window.location.port : ""}${p || "/"}`;
  return `/t/${slug}${p}`;
}

/** Link to the super admin panel. */
export function adminUrl(path = "") {
  const p = path ? (path.startsWith("/") ? path : "/" + path) : "";
  if (onRootDomain()) return `${window.location.protocol}//admin.${ROOT_DOMAIN}${window.location.port ? ":" + window.location.port : ""}${p || "/"}`;
  return `/admin${p}`;
}

/** Address shown to people, e.g. "khalid-wire.yourapp.com" */
export function tenantDisplayHost(slug: string) {
  return `${slug}.${ROOT_DOMAIN || "yourapp.com"}`;
}
