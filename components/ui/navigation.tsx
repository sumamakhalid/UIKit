"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { IconButton } from "./button";
import { Icon, type IconName } from "./icon";

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export interface TabItem<V extends string> {
  value: V;
  label: ReactNode;
  count?: number;
  icon?: IconName;
}

export interface TabsProps<V extends string> {
  items: TabItem<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}

export function Tabs<V extends string>({ items, value, onChange, className }: TabsProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    if (next >= 0) {
      e.preventDefault();
      refs.current[next]?.focus();
      onChange(items[next]!.value);
    }
  };

  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto border-b border-line", className)}>
      {items.map((t, i) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "relative -mb-px inline-flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-semibold whitespace-nowrap transition-colors",
              "focus-visible:rounded-t-md focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
              active ? "border-primary text-fg" : "border-transparent text-muted hover:text-fg",
            )}
          >
            {t.icon && <Icon name={t.icon} size={16} />}
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px font-mono text-[11px] tabular-nums",
                  active ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted",
                )}
              >
                {formatNumber(t.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
  className?: string;
}

function pageList(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < count - 1) out.push("…");
  out.push(count);
  return out;
}

export function Pagination({ page, pageCount, onPageChange, total, pageSize, className }: PaginationProps) {
  const from = total !== undefined && pageSize ? (page - 1) * pageSize + 1 : null;
  const to = total !== undefined && pageSize ? Math.min(page * pageSize, total) : null;

  return (
    <nav aria-label="Pagination" className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      {from !== null && total !== undefined ? (
        <p className="text-[13px] text-muted">
          Showing <span className="font-semibold text-fg">{from}</span>–<span className="font-semibold text-fg">{to}</span> of{" "}
          <span className="font-semibold text-fg">{formatNumber(total)}</span>
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <IconButton icon="chevron-left" label="Previous page" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        {pageList(page, pageCount).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1 text-sm text-subtle">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              aria-current={p === page ? "page" : undefined}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-8 min-w-8 rounded-md px-2 font-mono text-[13px] font-medium tabular-nums transition-colors",
                "focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                p === page ? "bg-primary text-primary-fg" : "text-fg hover:bg-surface-2",
              )}
            >
              {p}
            </button>
          ),
        )}
        <IconButton
          icon="chevron-right"
          label="Next page"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Breadcrumbs & PageHeader                                            */
/* ------------------------------------------------------------------ */

export function Breadcrumbs({ items }: { items: { label: ReactNode; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-muted">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <Icon name="chevron-right" size={13} className="text-subtle" />}
            {it.href && i < items.length - 1 ? (
              <a href={it.href} className="hover:text-fg hover:underline">
                {it.label}
              </a>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-semibold text-fg" : ""}>
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: { label: ReactNode; href?: string }[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-fg">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Theme toggle                                                        */
/* ------------------------------------------------------------------ */

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {}
    const initial =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = initial;
    setThemeState(initial);
  }, []);

  const setTheme = (t: "light" | "dark") => {
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("theme", t);
    } catch {}
    setThemeState(t);
  };

  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <IconButton
      icon={theme === "dark" ? "sun" : "moon"}
      label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/* AppShell — sidebar + top bar layout for every screen                */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  badge?: string | number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface AppShellProps {
  brand: { name: string; short?: string; subtitle?: string; logo?: ReactNode };
  nav: NavSection[];
  /** href of the current page, to highlight it */
  activeHref?: string;
  user?: { name: string; role?: string };
  /** Extra items in the top bar (search, notifications…) */
  topbar?: ReactNode;
  /** Bottom of the sidebar (e.g. logout) */
  sidebarFooter?: ReactNode;
  children: ReactNode;
}

function Sidebar({
  brand,
  nav,
  activeHref,
  sidebarFooter,
  onNavigate,
}: Pick<AppShellProps, "brand" | "nav" | "activeHref" | "sidebarFooter"> & { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        {brand.logo ?? (
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-[13px] font-extrabold tracking-tight text-primary-fg">
            {brand.short ?? brand.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[15px] font-extrabold text-fg">{brand.name}</p>
          {brand.subtitle && <p className="truncate text-xs text-muted">{brand.subtitle}</p>}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {nav.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-5" : ""}>
            {section.title && (
              <p className="mb-1.5 px-2.5 text-[11px] font-bold tracking-wider text-subtle uppercase">{section.title}</p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((it) => {
                const active = activeHref === it.href;
                return (
                  <li key={it.href}>
                    <a
                      href={it.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-semibold transition-colors",
                        "focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none",
                        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-fg",
                      )}
                    >
                      <Icon name={it.icon} size={17} />
                      <span className="flex-1 truncate">{it.label}</span>
                      {it.badge !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 font-mono text-[11px] tabular-nums",
                            active ? "bg-primary text-primary-fg" : "bg-warning-soft text-warning",
                          )}
                        >
                          {it.badge}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      {sidebarFooter && <div className="border-t border-line p-3">{sidebarFooter}</div>}
    </div>
  );
}

export function AppShell({ brand, nav, activeHref, user, topbar, sidebarFooter, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-surface lg:block">
        <Sidebar brand={brand} nav={nav} activeHref={activeHref} sidebarFooter={sidebarFooter} />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-72 max-w-[85vw] animate-slide-in-left border-r border-line bg-surface shadow-lg">
            <Sidebar
              brand={brand}
              nav={nav}
              activeHref={activeHref}
              sidebarFooter={sidebarFooter}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-line bg-surface/85 px-4 backdrop-blur sm:px-6">
          <IconButton icon="menu" label="Open menu" className="-ml-2 lg:hidden" onClick={() => setMobileOpen(true)} />
          <div className="flex min-w-0 flex-1 items-center gap-2">{topbar}</div>
          <ThemeToggle />
          {user && (
            <div className="ml-1 flex items-center gap-2.5 border-l border-line pl-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {user.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-[13px] font-bold text-fg">{user.name}</p>
                {user.role && <p className="text-xs text-muted">{user.role}</p>}
              </div>
            </div>
          )}
        </header>
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
