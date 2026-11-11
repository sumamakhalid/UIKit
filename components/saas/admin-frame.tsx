"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell, Button, IconButton, Tooltip, type NavSection } from "@/components/ui";
import { appConfig } from "@/lib/config";
import { LinkBaseProvider, useLinkTo } from "@/lib/saas/link-base";
import { useSaas } from "@/lib/saas/store";
import { FullScreen, LoadingScreen } from "./screens";

function activeFor(nav: NavSection[], pathname: string) {
  const hrefs = nav.flatMap((s) => s.items.map((i) => i.href));
  return hrefs.filter((h) => pathname === h || (h !== hrefs[0] && pathname.startsWith(h + "/"))).sort((a, b) => b.length - a.length)[0] ?? hrefs[0];
}

function Frame({ children }: { children: ReactNode }) {
  const to = useLinkTo();
  const pathname = usePathname() ?? "";
  const { state, ready, session, signInSuper, signOut } = useSaas();

  if (!ready) return <LoadingScreen />;

  if (session.kind !== "super") {
    return (
      <FullScreen
        icon="settings"
        tone="ink"
        title="Super admin"
        actions={
          <>
            <Button size="lg" variant="accent" arrow onClick={signInSuper}>
              Sign in as super admin
            </Button>
            <Button variant="ghost" onClick={() => (location.href = "/")}>
              Back to home
            </Button>
          </>
        }
      >
        This area manages every business on {appConfig.platformName}. In this demo, one click signs you in.
      </FullScreen>
    );
  }

  const pastDue = state.tenants.filter((t) => t.status === "past_due").length;
  const nav: NavSection[] = [
    {
      items: [
        { label: "Platform", href: to(""), icon: "asterisk" },
        { label: "Tenants", href: to("/tenants"), icon: "home", badge: pastDue || undefined },
        { label: "Plans", href: to("/plans"), icon: "layers" },
        { label: "Billing", href: to("/billing"), icon: "wallet" },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Support & audit", href: to("/audit"), icon: "eye" },
        { label: "UI kit", href: "/ui-kit", icon: "tag" },
      ],
    },
  ];

  return (
    <AppShell
      brand={{ name: appConfig.platformName, short: appConfig.platformShort, subtitle: "Super admin" }}
      nav={nav}
      activeHref={activeFor(nav, pathname)}
      user={{ name: session.name, role: "Super admin" }}
      onBrandClick={() => (location.href = to(""))}
      topbar={
        <div className="flex items-center gap-2 pl-2">
          <Tooltip content="Add tenant" side="bottom">
            <IconButton icon="plus" label="Add tenant" variant="outline" onClick={() => (location.href = to("/tenants?new=1"))} />
          </Tooltip>
          <Tooltip content="Invoices" side="bottom">
            <IconButton icon="receipt" label="Invoices" variant="outline" onClick={() => (location.href = to("/billing"))} />
          </Tooltip>
        </div>
      }
      railFooter={<IconButton icon="logout" label="Sign out" variant="primary" onClick={signOut} />}
    >
      {children}
    </AppShell>
  );
}

export function AdminFrame({ base, children }: { base: string; children: ReactNode }) {
  return (
    <LinkBaseProvider base={base}>
      <Frame>{children}</Frame>
    </LinkBaseProvider>
  );
}
