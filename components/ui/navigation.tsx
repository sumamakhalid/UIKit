"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { IconButton } from "./button";
import { Icon, type IconName } from "./icon";
import { Tooltip } from "./display";

/* ------------------------------------------------------------------ */
/* Tabs — chip row (default) or underline                              */
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
  variant?: "chips" | "underline";
  size?: "sm" | "md";
  className?: string;
}

export function Tabs<V extends string>({ items, value, onChange, variant = "chips", size = "md", className }: TabsProps<V>) {
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
    <div
      role="tablist"
      className={cn(
        "flex overflow-x-auto [scrollbar-width:none]",
        variant === "chips" ? "gap-2" : "gap-1 border-b border-line",
        className,
      )}
    >
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
              "inline-flex shrink-0 items-center gap-2 font-medium whitespace-nowrap transition-colors",
              "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
              variant === "chips"
                ? cn(
                    "rounded-full border",
                    size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-9 px-4 text-sm",
                    active ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-fg hover:border-line-strong",
                  )
                : cn(
                    "-mb-px h-10 border-b-2 px-3 text-sm",
                    active ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg",
                  ),
            )}
          >
            {t.icon && <Icon name={t.icon} size={16} />}
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums",
                  active ? "bg-accent-fg text-accent" : "bg-surface-2 text-muted",
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
        <IconButton icon="chevron-left" label="Previous page" size="sm" variant="soft" disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
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
                "h-8 min-w-8 rounded-full px-2 text-[13px] font-semibold tabular-nums transition-colors",
                "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
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
          variant="soft"
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
  subtitle,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: ReactNode;
  /** Second line of the heading, set large and grey ("Stock overview") */
  subtitle?: ReactNode;
  description?: ReactNode;
  breadcrumbs?: { label: ReactNode; href?: string }[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-3", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[32px] leading-[1.05] font-medium tracking-[-0.03em] text-fg sm:text-[40px]">{title}</h1>
          {subtitle && <p className="text-xl leading-tight font-normal tracking-[-0.02em] text-subtle sm:text-2xl">{subtitle}</p>}
          {description && <p className="mt-2 text-sm text-muted">{description}</p>}
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

export function ThemeToggle({ className, variant = "soft" }: { className?: string; variant?: "soft" | "ghost" | "outline" }) {
  const { theme, toggle } = useTheme();
  return (
    <IconButton
      icon={theme === "dark" ? "sun" : "moon"}
      label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      variant={variant}
      className={className}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Workspace switcher — the accent pill top-left                       */
/* ------------------------------------------------------------------ */

export function WorkspacePill({
  name,
  subtitle,
  short,
  logo,
  onClick,
}: {
  name: string;
  subtitle?: string;
  short?: string;
  logo?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 max-w-[240px] shrink-0 items-center gap-2.5 rounded-full bg-accent pr-3.5 pl-1.5 text-left text-accent-fg transition-colors hover:bg-accent-hover focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
    >
      {logo ?? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold tracking-tight text-primary-fg dark:bg-accent-fg dark:text-accent">
          {short ?? name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[13px] font-bold">{name}</span>
        {subtitle && <span className="block truncate text-[11px] opacity-75">{subtitle}</span>}
      </span>
      <Icon name="chevrons-up-down" size={14} className="ml-0.5 shrink-0" />
    </button>
  );
}

/** Date pill with a bell and a count, like "Sat, 26 Aug (5)". */
export function DateChip({ label, count, onClick }: { label: ReactNode; count?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hidden h-11 items-center gap-2.5 rounded-full border border-line bg-surface pr-2 pl-1.5 text-[13px] font-semibold text-fg hover:bg-surface-2 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none sm:flex"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-surface-2">
        <Icon name="bell" size={15} />
      </span>
      {label}
      {count !== undefined && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-fg tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* AppShell — icon rail + top bar + rounded content canvas             */
/* ------------------------------------------------------------------ */

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  /** Short text shown inside the rail button instead of the icon (e.g. "POS") */
  short?: string;
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
  /** Left cluster of the top bar, after the workspace pill (quick actions) */
  topbar?: ReactNode;
  /** Right cluster of the top bar, before the menu button (date chip, alerts) */
  topbarEnd?: ReactNode;
  /** Bottom of the rail (e.g. help, logout) */
  railFooter?: ReactNode;
  children: ReactNode;
}

function RailButton({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Tooltip content={item.label} side="right">
      <a
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex size-11 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
          active ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-fg hover:bg-surface-2",
        )}
      >
        {item.short ?? <Icon name={item.icon} size={18} />}
        {item.badge !== undefined && (
          <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-fg tabular-nums ring-2 ring-surface">
            {item.badge}
          </span>
        )}
      </a>
    </Tooltip>
  );
}

function NavList({ nav, activeHref, onNavigate }: { nav: NavSection[]; activeHref?: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5">
      {nav.map((section, si) => (
        <div key={si}>
          {section.title && <p className="mb-2 px-3 text-xs font-semibold text-subtle">{section.title}</p>}
          <ul className="flex flex-col gap-1">
            {section.items.map((it) => {
              const active = activeHref === it.href;
              return (
                <li key={it.href}>
                  <a
                    href={it.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-full pr-3 pl-1.5 text-sm font-semibold transition-colors",
                      "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
                      active ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface-2",
                    )}
                  >
                    <span className={cn("flex size-8 items-center justify-center rounded-full", active ? "bg-accent-fg/10" : "bg-surface-2")}>
                      <Icon name={it.icon} size={16} />
                    </span>
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge !== undefined && (
                      <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-fg tabular-nums">{it.badge}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({ brand, nav, activeHref, user, topbar, topbarEnd, railFooter, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 bg-surface/90 px-4 backdrop-blur sm:px-6">
        <WorkspacePill name={brand.name} subtitle={brand.subtitle} short={brand.short} logo={brand.logo} />
        <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">{topbar}</div>
        <div className="ml-auto flex items-center gap-2">
          {topbarEnd}
          <ThemeToggle />
          {user && (
            <span
              title={user.role ? `${user.name} · ${user.role}` : user.name}
              className="hidden size-10 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-fg sm:flex"
            >
              {user.name
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </span>
          )}
          <IconButton icon="menu" label="Open menu" variant="primary" onClick={() => setMenuOpen(true)} />
        </div>
      </header>

      {/* Icon rail */}
      <aside className="fixed top-[76px] bottom-0 left-0 z-20 hidden w-[84px] flex-col items-center gap-2 overflow-y-auto pt-2 pb-5 lg:flex">
        {nav.map((section, si) => (
          <div key={si} className={cn("flex flex-col items-center gap-2", si > 0 && "mt-3 border-t border-line pt-5")}>
            {section.items.map((it) => (
              <RailButton key={it.href} item={it} active={activeHref === it.href} />
            ))}
          </div>
        ))}
        {railFooter && <div className="mt-auto flex flex-col items-center gap-2 pt-4">{railFooter}</div>}
      </aside>

      {/* Full menu (all sizes) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 animate-fade-in bg-overlay" onClick={() => setMenuOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 right-0 flex w-80 max-w-[88vw] animate-slide-in flex-col bg-surface p-4 shadow-lg sm:inset-y-3 sm:right-3 sm:rounded-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="pl-2 text-lg font-semibold">Menu</p>
              <IconButton icon="x" label="Close menu" variant="soft" onClick={() => setMenuOpen(false)} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList nav={nav} activeHref={activeHref} onNavigate={() => setMenuOpen(false)} />
            </div>
            {user && (
              <div className="mt-4 flex items-center gap-3 rounded-full bg-surface-2 p-1.5 pr-4">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-fg">
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{user.name}</p>
                  {user.role && <p className="text-xs text-muted">{user.role}</p>}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Content canvas */}
      <div className="lg:pl-[84px]">
        <main className="min-h-[calc(100dvh-76px)] rounded-t-xl bg-bg px-4 py-6 sm:px-8 sm:py-8 lg:rounded-tr-none lg:rounded-tl-[36px]">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
