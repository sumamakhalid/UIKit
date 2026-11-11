"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Icon, SegmentedControl, ThemeToggle } from "@/components/ui";
import { StatusBadge } from "@/components/admin/shared";
import { PlanCard } from "@/components/saas/plan-cards";
import { appConfig } from "@/lib/config";
import { businessTypes } from "@/lib/saas/catalog";
import { useSaas } from "@/lib/saas/store";
import type { BillingCycle, BusinessType } from "@/lib/saas/types";
import { adminUrl, tenantDisplayHost, tenantUrl } from "@/lib/saas/urls";

/** Public landing page with pricing and demo entry points. */
export default function LandingPage() {
  const { state, signInSuper, signInTenant } = useSaas();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  const goAdmin = () => {
    signInSuper();
    setTimeout(() => (location.href = adminUrl()), 50);
  };
  const goTenant = (slug: string) => {
    signInTenant(slug);
    setTimeout(() => (location.href = tenantUrl(slug)), 50);
  };

  const demoTenants = state.tenants.filter((t) => t.status !== "suspended").slice(0, 6);

  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex h-[76px] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-accent-fg">{appConfig.platformShort}</span>
        <span className="text-lg font-bold">{appConfig.platformName}</span>
        <nav className="ml-6 hidden items-center gap-1 text-sm font-medium md:flex">
          <a href="#types" className="rounded-full px-3 py-2 hover:bg-surface-2">
            Who it’s for
          </a>
          <a href="#pricing" className="rounded-full px-3 py-2 hover:bg-surface-2">
            Pricing
          </a>
          <a href="#demo" className="rounded-full px-3 py-2 hover:bg-surface-2">
            Demo
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" className="hidden sm:inline-flex" onClick={() => (location.href = "/login")}>
            Sign in
          </Button>
          <Button arrow onClick={() => (location.href = "#demo")}>
            Try demo
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Badge tone="accent" icon="sparkles">
                For shops in Pakistan
              </Badge>
              <h1 className="mt-5 text-[44px] leading-[0.98] font-medium tracking-[-0.045em] sm:text-[72px]">
                Stock, bills
                <br />
                and <span className="rounded-[0.2em] bg-accent px-[0.12em] text-accent-fg">khata</span>
                <br />
                <span className="text-subtle">in one place.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted">
                Sell by kg or by piece, track every rupee customers owe, and see your stock live — from any phone or computer.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" variant="accent" arrow onClick={() => (location.href = "#demo")}>
                  Open the demo
                </Button>
                <Button size="lg" variant="outline" onClick={() => (location.href = "#pricing")}>
                  See pricing
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 rounded-lg bg-bg p-5">
                <p className="text-sm text-muted">Sold today</p>
                <p className="mt-1 text-[52px] leading-none tracking-[-0.05em] tabular-nums">
                  1.86<span className="text-2xl tracking-normal">L</span>
                </p>
                <div className="mt-6 flex h-20 items-end gap-1.5">
                  {[30, 45, 38, 60, 52, 80, 66, 92, 58, 70].map((h, i) => (
                    <span key={i} className={i === 7 ? "flex-1 rounded-full bg-accent" : "flex-1 rounded-full bg-surface"} style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-accent p-5 text-accent-fg">
                <p className="text-sm font-semibold">Low stock</p>
                <p className="mt-2 text-[44px] leading-none tracking-[-0.05em]">7</p>
              </div>
              <div className="rounded-lg bg-primary p-5 text-primary-fg">
                <p className="text-sm opacity-75">Receivable</p>
                <p className="mt-2 text-[44px] leading-none tracking-[-0.05em]">
                  3.9<span className="text-xl tracking-normal">L</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Business types */}
        <section id="types" className="scroll-mt-20 rounded-t-[36px] bg-bg">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-[32px] leading-tight font-medium tracking-[-0.03em] sm:text-[40px]">
              One system, <span className="text-subtle">set up for your kind of shop.</span>
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(businessTypes) as BusinessType[]).map((k) => {
                const t = businessTypes[k];
                return (
                  <div key={k} className="rounded-lg bg-surface p-5 shadow-sm">
                    <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-fg">
                      <Icon name={t.icon} size={18} />
                    </span>
                    <p className="mt-4 font-semibold">{t.label}</p>
                    <p className="mt-1 text-sm text-muted">{t.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-20 bg-bg">
          <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[32px] leading-tight font-medium tracking-[-0.03em] sm:text-[40px]">
                Simple pricing. <span className="text-subtle">14 days free.</span>
              </h2>
              <SegmentedControl
                aria-label="Billing cycle"
                value={cycle}
                onChange={setCycle}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly · 2 months free" },
                ]}
              />
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {state.plans
                .filter((p) => !p.archived)
                .map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    cycle={cycle}
                    action={
                      <Button fullWidth size="lg" variant={p.highlight ? "accent" : "primary"} arrow onClick={() => (location.href = "#demo")}>
                        Start free trial
                      </Button>
                    }
                  />
                ))}
            </div>
          </div>
        </section>

        {/* Demo */}
        <section id="demo" className="scroll-mt-20 bg-bg">
          <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
            <h2 className="text-[32px] leading-tight font-medium tracking-[-0.03em] sm:text-[40px]">
              Try it. <span className="text-subtle">No sign-up.</span>
            </h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
              <div className="flex flex-col rounded-lg bg-primary p-6 text-primary-fg">
                <Badge tone="accent" className="self-start">
                  Platform owner
                </Badge>
                <p className="mt-4 text-[28px] leading-tight font-medium tracking-[-0.02em]">Super admin</p>
                <p className="mt-2 text-sm opacity-75">Add businesses, set plans and prices, collect payments, log in as a shop to help them, and see who did what.</p>
                <Button size="lg" variant="accent" arrow className="mt-auto self-start" onClick={goAdmin}>
                  Open super admin
                </Button>
              </div>
              <div className="rounded-lg bg-surface p-6 shadow-sm">
                <p className="text-[28px] leading-tight font-medium tracking-[-0.02em]">Business panels</p>
                <p className="mt-1 text-sm text-muted">Sign in as the owner of any demo shop.</p>
                <ul className="mt-4">
                  {demoTenants.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => goTenant(t.slug)}
                        className="flex w-full items-center gap-3 border-b border-line py-3 text-left last:border-0 hover:opacity-80"
                      >
                        <Avatar name={t.name} size={36} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{t.name}</span>
                          <span className="block truncate text-xs text-muted">
                            {tenantDisplayHost(t.slug)} · {businessTypes[t.type].label}
                          </span>
                        </span>
                        <StatusBadge status={t.status} size="sm" />
                        <Icon name="arrow-right" size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-bg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-8 text-sm text-muted sm:px-6">
          <span>
            © 2026 {appConfig.platformName}. Built with the Inventory UI Kit.
          </span>
          <a href="/ui-kit" className="font-semibold text-fg hover:underline">
            UI kit
          </a>
        </div>
      </footer>
    </div>
  );
}
