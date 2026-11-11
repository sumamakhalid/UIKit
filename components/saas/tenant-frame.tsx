"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell, DateChip, IconButton, Tooltip, type NavSection } from "@/components/ui";
import { Button } from "@/components/ui";
import { appConfig } from "@/lib/config";
import { LinkBaseProvider, useLinkTo } from "@/lib/saas/link-base";
import { daysLeft, useSaas, useTenant } from "@/lib/saas/store";
import type { MemberRole, Plan, Tenant } from "@/lib/saas/types";
import { adminUrl } from "@/lib/saas/urls";
import { Banner, FullScreen, LoadingScreen } from "./screens";

interface TenantCtx {
  tenant: Tenant;
  plan: Plan;
  role: MemberRole;
  /** Display name of whoever is using the panel */
  userName: string;
  impersonating: boolean;
}

const Ctx = createContext<TenantCtx | null>(null);

/** Current tenant, plan and role inside a tenant panel. */
export function useCurrentTenant() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCurrentTenant must be used inside the tenant panel");
  return c;
}

/** Point the kit's number/unit formatting at this tenant's settings. */
function applyTenantFormat(t: Tenant) {
  Object.assign(appConfig, {
    businessName: t.name,
    shortName: t.shortName,
    currency: t.settings.currency,
    weightUnit: t.settings.weightUnit,
    weightDecimals: t.settings.weightDecimals,
    pieceUnit: t.settings.pieceUnit,
  });
}

function activeFor(nav: NavSection[], pathname: string) {
  const hrefs = nav.flatMap((s) => s.items.map((i) => i.href));
  return hrefs.filter((h) => pathname === h || (h !== hrefs[0] && pathname.startsWith(h + "/"))).sort((a, b) => b.length - a.length)[0] ?? hrefs[0];
}

function Frame({ slug, children }: { slug: string; children: ReactNode }) {
  const to = useLinkTo();
  const pathname = usePathname() ?? "";
  const { ready, session, signInTenant, signOut, impersonate, stopImpersonating } = useSaas();
  const { tenant, plan, members } = useTenant(slug);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(/^(\w+) /, "$1, "));
  }, []);

  // Tenant's accent colour
  useEffect(() => {
    if (!tenant) return;
    const root = document.documentElement;
    if (tenant.accent === "lime") delete root.dataset.brand;
    else root.dataset.brand = tenant.accent;
    return () => {
      delete root.dataset.brand;
    };
  }, [tenant?.accent, tenant]);

  if (!ready) return <LoadingScreen />;

  if (!tenant || !plan) {
    return (
      <FullScreen icon="search" title="Business not found" actions={<Button onClick={() => (location.href = "/")}>Go to home</Button>}>
        There is no business at <b className="text-fg">{slug}</b>. Check the address, or ask the owner for the right link.
      </FullScreen>
    );
  }

  const isSuper = session.kind === "super";
  const impersonating = isSuper && session.impersonating === slug;
  const isMember = session.kind === "tenant" && session.tenantSlug === slug;

  if (!isMember && !impersonating) {
    const owner = members.find((m) => m.role === "owner");
    return (
      <FullScreen
        icon="home"
        title={tenant.name}
        actions={
          <>
            {isSuper ? (
              <Button size="lg" arrow onClick={() => impersonate(slug)}>
                Log in as this business
              </Button>
            ) : (
              <Button size="lg" variant="accent" arrow onClick={() => signInTenant(slug)}>
                Sign in as {owner?.name ?? "owner"}
              </Button>
            )}
            {!isSuper && members.filter((m) => m.role !== "owner" && m.status === "active").length > 0 && (
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {members
                  .filter((m) => m.role !== "owner" && m.status === "active")
                  .slice(0, 3)
                  .map((m) => (
                    <Button key={m.id} size="sm" variant="outline" onClick={() => signInTenant(slug, m.id)}>
                      {m.name} · {m.role}
                    </Button>
                  ))}
              </div>
            )}
          </>
        }
      >
        {isSuper ? "You are signed in as super admin. Logging in as this business is recorded in the audit log." : "Demo sign-in — pick who to sign in as."}
      </FullScreen>
    );
  }

  if (tenant.status === "suspended" && !impersonating) {
    return (
      <FullScreen
        icon="alert"
        tone="danger"
        title="Account suspended"
        actions={
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        }
      >
        {tenant.name} is suspended because of unpaid invoices. Contact {appConfig.platformName} support to restore access — your data is safe.
      </FullScreen>
    );
  }

  applyTenantFormat(tenant);

  const role: MemberRole = impersonating ? "owner" : session.kind === "tenant" ? session.role : "viewer";
  const userName = impersonating ? "Super admin" : session.kind === "tenant" ? session.name : "";
  const isAdmin = role === "owner" || role === "manager";
  const lock = (ok: boolean) => (ok ? undefined : "Pro");

  const nav: NavSection[] = [
    {
      items: [
        { label: "Dashboard", href: to(""), icon: "asterisk" },
        { label: "Sales / POS", href: to("/sales"), icon: "cart" },
        { label: "Inventory", href: to("/inventory"), icon: "box" },
        { label: "Purchases", href: to("/purchases"), icon: "truck", badge: lock(plan.features.includes("purchases")) },
      ],
    },
    {
      title: "Accounts",
      items: [
        { label: "Customers", href: to("/customers"), icon: "users" },
        { label: "Suppliers", href: to("/suppliers"), icon: "layers" },
        { label: "Ledger & payments", href: to("/ledger"), icon: "wallet" },
        { label: "Reports", href: to("/reports"), icon: "chart", badge: lock(plan.features.includes("reports")) },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "Business",
            items: [
              { label: "Team", href: to("/team"), icon: "shield" as const },
              ...(role === "owner" ? [{ label: "Plan & billing", href: to("/billing"), icon: "receipt" as const }] : []),
              { label: "Settings", href: to("/settings"), icon: "settings" as const },
            ],
          },
        ]
      : []),
  ];

  let banner: ReactNode = null;
  if (impersonating) {
    banner = (
      <Banner
        tone="ink"
        icon="eye"
        action={{
          label: "Exit",
          onClick: () => {
            stopImpersonating();
            location.href = adminUrl(`/tenants/${tenant.id}`);
          },
        }}
      >
        You are viewing <b>{tenant.name}</b> as super admin{tenant.status === "suspended" ? " — this account is suspended" : ""}.
      </Banner>
    );
  } else if (tenant.status === "trial") {
    const d = daysLeft(tenant.trialEndsAt);
    banner = (
      <Banner tone="accent" icon="clock" action={role === "owner" ? { label: "Choose a plan", onClick: () => (location.href = to("/billing")) } : undefined}>
        Free trial — <b>{d} {d === 1 ? "day" : "days"}</b> left on {plan.name}.
      </Banner>
    );
  } else if (tenant.status === "past_due") {
    banner = (
      <Banner tone="danger" icon="alert" action={role === "owner" ? { label: "Pay now", onClick: () => (location.href = to("/billing")) } : undefined}>
        Your last invoice is overdue. Pay it to avoid suspension.
      </Banner>
    );
  }

  return (
    <Ctx.Provider value={{ tenant, plan, role, userName, impersonating }}>
      <AppShell
        brand={{ name: tenant.name, short: tenant.shortName, subtitle: `${plan.name} plan` }}
        nav={nav}
        activeHref={activeFor(nav, pathname)}
        user={{ name: userName, role: impersonating ? "Super admin" : role[0]!.toUpperCase() + role.slice(1) }}
        banner={banner}
        onBrandClick={() => (location.href = to(""))}
        topbar={
          <div className="flex items-center gap-2 pl-2">
            <Tooltip content="Scan barcode" side="bottom">
              <IconButton icon="barcode" label="Scan barcode" variant="outline" />
            </Tooltip>
            <Tooltip content="New bill" side="bottom">
              <IconButton icon="receipt" label="New bill" variant="outline" onClick={() => (location.href = to("/sales"))} />
            </Tooltip>
            <Tooltip content="Add item" side="bottom">
              <IconButton icon="plus" label="Add item" variant="outline" onClick={() => (location.href = to("/inventory?new=1"))} />
            </Tooltip>
          </div>
        }
        topbarEnd={
          <>
            <IconButton icon="sparkles" label="Ask assistant" variant="soft" className="hidden sm:inline-flex" />
            {today && <DateChip label={today} count={3} />}
          </>
        }
        railFooter={
          <IconButton
            icon="logout"
            label={impersonating ? "Exit business" : "Sign out"}
            variant="primary"
            onClick={() => {
              if (impersonating) {
                stopImpersonating();
                location.href = adminUrl(`/tenants/${tenant.id}`);
              } else signOut();
            }}
          />
        }
      >
        {children}
      </AppShell>
    </Ctx.Provider>
  );
}

export function TenantFrame({ slug, base, children }: { slug: string; base: string; children: ReactNode }) {
  return (
    <LinkBaseProvider base={base}>
      <Frame slug={slug}>{children}</Frame>
    </LinkBaseProvider>
  );
}
