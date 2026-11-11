"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Button,
  Card,
  CardHeader,
  Delta,
  DotChart,
  IconButton,
  LegendDot,
  Meter,
  PageHeader,
  PillSelect,
  ReminderCard,
  SectionLabel,
  StatCard,
  Tabs,
  useToast,
} from "@/components/ui";
import { StatusBadge, TenantCell, when } from "@/components/admin/shared";
import { businessTypes } from "@/lib/saas/catalog";
import { useLinkTo } from "@/lib/saas/link-base";
import { mrrHistory, signupsThisWeek } from "@/lib/saas/seed";
import { daysLeft, monthlyValue, useSaas } from "@/lib/saas/store";
import type { BusinessType } from "@/lib/saas/types";
import { formatCompact, formatMoney, formatNumber } from "@/lib/utils";

type ChartKind = "mrr" | "tenants";

export default function PlatformDashboard() {
  const toast = useToast();
  const to = useLinkTo();
  const { state, extendTrial } = useSaas();
  const [chart, setChart] = useState<ChartKind>("mrr");
  const [range, setRange] = useState("12m");

  const { tenants, plans, invoices, audit } = state;
  const mrr = tenants.reduce((s, t) => s + monthlyValue(t, plans), 0);
  const paying = tenants.filter((t) => t.status === "active" || t.status === "past_due");
  const trials = tenants.filter((t) => t.status === "trial");
  const pastDue = tenants.filter((t) => t.status === "past_due");
  const outstanding = invoices.filter((i) => i.status === "due" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const prevMrr = mrrHistory[mrrHistory.length - 1]!.value;
  const growth = prevMrr ? ((mrr - prevMrr) / prevMrr) * 100 : 0;
  const endingSoon = trials.filter((t) => daysLeft(t.trialEndsAt) <= 7).sort((a, b) => daysLeft(a.trialEndsAt) - daysLeft(b.trialEndsAt));

  const series = useMemo(() => {
    if (chart === "mrr") return [...mrrHistory, { label: "Nov", value: mrr }];
    // tenants per month (cumulative signups)
    const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
    const keys = ["2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
    return keys.map((k, i) => ({ label: months[i]!, value: tenants.filter((t) => t.createdAt.slice(0, 7) <= k).length }));
  }, [chart, mrr, tenants]);

  const planMix = plans
    .filter((p) => !p.archived)
    .map((p) => {
      const list = tenants.filter((t) => t.planId === p.id && t.status !== "suspended");
      return { plan: p, count: list.length, mrr: list.reduce((s, t) => s + monthlyValue(t, plans), 0) };
    });
  const maxCount = Math.max(1, ...planMix.map((p) => p.count));

  const typeMix = (Object.keys(businessTypes) as BusinessType[])
    .map((k) => ({ type: k, count: tenants.filter((t) => t.type === k).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);

  const recent = [...tenants].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Platform"
        subtitle="All businesses at a glance"
        actions={
          <>
            <PillSelect
              icon="calendar"
              aria-label="Range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={[
                { value: "12m", label: "Last 12 months" },
                { value: "6m", label: "Last 6 months" },
              ]}
            />
            <Button size="lg" arrow onClick={() => (location.href = to("/tenants?new=1"))}>
              Add tenant
            </Button>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          variant="accent"
          label="Monthly recurring revenue"
          value={formatCompact(mrr)}
          unit="Rs"
          size="lg"
          change={{ value: `${formatNumber(Math.abs(growth), 1)}%`, direction: growth >= 0 ? "up" : "down" }}
          hint={`${formatMoney(mrr * 12)} a year`}
        />
        <StatCard label="Paying businesses" value={paying.length} size="lg" hint={`${tenants.length} total · ${tenants.filter((t) => t.status === "suspended").length} suspended`} />
        <StatCard variant="info" label="On free trial" value={trials.length} size="lg" hint={`${endingSoon.length} end within 7 days`} />
        <StatCard variant="ink" label="Outstanding" value={formatCompact(outstanding)} unit="Rs" size="lg" hint={`${pastDue.length} past due`} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader title="Growth" actions={<IconButton icon="download" label="Export" size="sm" variant="soft" onClick={() => toast({ title: "CSV downloaded" })} />} />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2 px-5 pt-1 pb-2">
            <div className="flex items-start gap-2">
              <span className="text-[30px] leading-none tracking-[-0.04em] tabular-nums">{formatNumber(mrr)}</span>
              <span className="text-[11px] font-semibold text-muted">Rs MRR</span>
              <Delta value={`${formatNumber(Math.abs(growth), 1)}%`} direction={growth >= 0 ? "up" : "down"} className="mt-1" />
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[30px] leading-none tracking-[-0.04em] tabular-nums">{tenants.length}</span>
              <span className="text-[11px] font-semibold text-muted">businesses</span>
            </div>
          </div>
          <div className="px-5 pt-10">
            <BarChart
              data={range === "6m" ? series.slice(-6) : series}
              accent={[(range === "6m" ? 6 : series.length) - 1]}
              format={chart === "mrr" ? formatCompact : (v) => formatNumber(v)}
              height={200}
              label={chart === "mrr" ? "Monthly recurring revenue by month" : "Number of businesses by month"}
            />
          </div>
          <div className="px-5 pt-4 pb-5">
            <Tabs<ChartKind>
              size="sm"
              value={chart}
              onChange={setChart}
              items={[
                { value: "mrr", label: "Revenue" },
                { value: "tenants", label: "Businesses" },
              ]}
            />
          </div>
        </Card>

        <Card className="flex flex-col p-5 xl:col-span-4">
          <SectionLabel>Plan mix</SectionLabel>
          <ul className="mt-4 flex flex-col gap-4">
            {planMix.map(({ plan, count, mrr: pm }) => (
              <li key={plan.id}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{plan.name}</span>
                  <span className="text-muted tabular-nums">
                    {count} · {formatMoney(pm)}
                  </span>
                </div>
                <Meter className="mt-2" value={count} max={maxCount} tone={plan.highlight ? "accent" : "ink"} label={`${plan.name} tenants`} />
              </li>
            ))}
          </ul>
          <SectionLabel className="mt-7">Business types</SectionLabel>
          <div className="mt-3 flex flex-wrap gap-2">
            {typeMix.map((t) => (
              <span key={t.type} className="inline-flex h-8 items-center gap-2 rounded-full bg-surface-2 pr-1 pl-3 text-[13px] font-medium">
                {businessTypes[t.type].label}
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-1.5 text-xs font-semibold tabular-nums">{t.count}</span>
              </span>
            ))}
          </div>
          <div className="mt-auto flex gap-4 pt-6">
            <LegendDot label="Most popular plan" />
            <LegendDot label="Other plans" dotClassName="bg-primary" />
          </div>
        </Card>

        <Card className="p-5 xl:col-span-4">
          <SectionLabel>Signups this week</SectionLabel>
          <DotChart data={signupsThisWeek} peakChip="3" height={120} label="Signups per day this week, most on Friday" className="mt-2" />
        </Card>

        <ReminderCard
          className="xl:col-span-4"
          title={
            <>
              {endingSoon.length} {endingSoon.length === 1 ? "trial ends" : "trials end"}
              <br />
              this week
            </>
          }
          note={
            endingSoon[0] ? (
              <>
                <b>{endingSoon[0].name}</b> ends in {daysLeft(endingSoon[0].trialEndsAt)} days.
              </>
            ) : (
              "No trials ending soon."
            )
          }
          chip={endingSoon[0]?.ownerName ?? "—"}
          status={endingSoon[0]?.ownerEmail ?? "All caught up"}
          action={
            endingSoon[0]
              ? {
                  icon: "clock",
                  label: "Extend trial by 7 days",
                  onClick: () => {
                    extendTrial(endingSoon[0]!.id, 7);
                    toast({ title: "Trial extended", description: `${endingSoon[0]!.name} +7 days` });
                  },
                }
              : undefined
          }
        />

        <Card className="p-5 xl:col-span-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Needs attention</SectionLabel>
            <Button size="sm" variant="ghost" rightIcon="arrow-right" onClick={() => (location.href = to("/billing"))}>
              Billing
            </Button>
          </div>
          <ul className="mt-2">
            {pastDue.length === 0 && <li className="py-6 text-center text-sm text-muted">Nobody is past due.</li>}
            {pastDue.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => (location.href = to(`/tenants/${t.id}`))}
                  className="flex w-full items-center justify-between gap-3 border-b border-line py-3 text-left last:border-0 hover:opacity-80"
                >
                  <TenantCell tenant={t} showType={false} />
                  <StatusBadge status={t.status} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 xl:col-span-7">
          <div className="flex items-center justify-between">
            <SectionLabel>Newest businesses</SectionLabel>
            <Button size="sm" variant="secondary" rightIcon="arrow-right" onClick={() => (location.href = to("/tenants"))}>
              All tenants
            </Button>
          </div>
          <ul className="mt-2">
            {recent.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => (location.href = to(`/tenants/${t.id}`))}
                  className="flex w-full items-center justify-between gap-3 border-b border-line py-3 text-left last:border-0 hover:opacity-80"
                >
                  <TenantCell tenant={t} />
                  <span className="hidden text-xs text-muted sm:inline">{when(t.createdAt)}</span>
                  <StatusBadge status={t.status} size="sm" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5 xl:col-span-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Latest activity</SectionLabel>
            <Button size="sm" variant="ghost" rightIcon="arrow-right" onClick={() => (location.href = to("/audit"))}>
              Audit log
            </Button>
          </div>
          <ol className="mt-3 flex flex-col">
            {audit.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-line py-2.5 text-sm last:border-0">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/30" />
                <div className="min-w-0">
                  <p className="truncate">{a.action}</p>
                  <p className="text-xs text-muted">
                    {a.actor} · {when(a.at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
