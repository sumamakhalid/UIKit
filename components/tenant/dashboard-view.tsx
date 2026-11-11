"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Button,
  Card,
  CardHeader,
  Checklist,
  DataTable,
  DateRangePicker,
  Delta,
  DotChart,
  DropdownMenu,
  IconButton,
  LegendDot,
  Meter,
  PageHeader,
  PillSelect,
  ReminderCard,
  SectionLabel,
  StatCard,
  StepDots,
  StockBadge,
  Tabs,
  useToast,
  type ChecklistItem,
  type Column,
  type DateRange,
} from "@/components/ui";
import { Alert } from "@/components/ui";
import { useCurrentTenant } from "@/components/saas/tenant-frame";
import { categoriesFor, productsFor } from "@/lib/saas/demo-products";
import { useLinkTo } from "@/lib/saas/link-base";
import { useSaas } from "@/lib/saas/store";
import { appConfig } from "@/lib/config";
import { months, monthlySeries, weeklyBills, type Product } from "@/lib/sample-data";
import { formatCompact, formatMoney, formatNumber, formatQty } from "@/lib/utils";

type Series = keyof typeof monthlySeries;

const seriesTabs: { value: Series; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "purchases", label: "Purchases" },
  { value: "profit", label: "Profit" },
  { value: "receivable", label: "Receivable" },
];

/** A coil of wire, drawn from circles — the shop's own motif. */
function CoilArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
      {[14, 26, 38, 50, 62, 74].map((r) => (
        <circle key={r} cx="80" cy="80" r={r} fill="none" stroke="currentColor" strokeWidth="3" />
      ))}
      <path d="M154 80 C 154 120, 150 150, 158 160" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardView() {
  const toast = useToast();
  const to = useLinkTo();
  const { tenant, plan, userName } = useCurrentTenant();
  const { state } = useSaas();
  const products = useMemo(() => productsFor(tenant), [tenant]);
  const news = state.announcements.filter((a) => a.active && (a.audience === "all" || a.audience === plan.id));
  const [hidden, setHidden] = useState<string[]>([]);
  const [series, setSeries] = useState<Series>("sales");
  const [range, setRange] = useState<DateRange>({ from: "2026-11-04", to: "2026-11-10" });
  const [period, setPeriod] = useState("24h");
  const [step, setStep] = useState(2);
  const [tasks, setTasks] = useState<ChecklistItem[]>([
    { id: "t1", label: "Collect pending customer payments", meta: "Due today", aside: <span className="text-sm font-semibold tabular-nums">Rs 145,000</span>, done: false },
    { id: "t2", label: "Receive supplier delivery", meta: categoriesFor(tenant)[0], aside: <Delta value="2.5 t" />, done: true },
    { id: "t3", label: `Count ${(categoriesFor(tenant)[1] ?? "shelf").toLowerCase()} stock`, meta: "Weekly", aside: <span className="text-xs text-muted">3 of 6</span>, done: false },
    { id: "t4", label: "Send new rate list", meta: "12 customers", aside: <IconButton icon="arrow-up-right" label="Open" size="sm" variant="soft" />, done: false },
  ]);

  const data = monthlySeries[series].slice(0, 11).map((v, i) => ({ label: months[i]!, value: v, title: `${months[i]}: ${formatMoney(v)}` }));
  const low = useMemo(() => products.filter((p) => p.stock <= p.reorderLevel), [products]);
  const inStockPct = ((products.length - low.length) / products.length) * 100;

  const lowColumns: Column<Product>[] = [
    {
      key: "name",
      header: "Item",
      accessor: (p) => p.name,
      cell: (p) => (
        <div className="min-w-[150px]">
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-muted">{p.category}</p>
        </div>
      ),
    },
    {
      key: "level",
      header: "Level",
      accessor: (p) => p.stock / Math.max(1, p.reorderLevel),
      hideOnMobile: true,
      cell: (p) => (
        <div className="w-32">
          <Meter value={p.stock} max={p.reorderLevel * 2} tone={p.stock <= 0 ? "danger" : "warning"} label={`${p.name} stock level`} />
        </div>
      ),
    },
    { key: "stock", header: "Left", numeric: true, accessor: (p) => p.stock, cell: (p) => formatQty(p.stock, p.sellBy) },
    { key: "status", header: "Status", cell: (p) => <StockBadge qty={p.stock} reorderLevel={p.reorderLevel} size="sm" /> },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={userName && userName !== "Super admin" ? `Welcome, ${userName.split(" ")[0]}` : "Stock & sales"}
        actions={
          <>
            <DateRangePicker value={range} onChange={setRange} />
            <PillSelect
              icon="clock"
              aria-label="Compare period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: "24h", label: "24h" },
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
              ]}
            />
            <Button size="lg" arrow onClick={() => toast({ title: "New sale", description: "The POS screen opens here." })}>
              New sale
            </Button>
          </>
        }
      />

      {news
        .filter((n) => !hidden.includes(n.id))
        .map((n) => (
          <Alert
            key={n.id}
            tone={n.tone}
            title={n.title}
            className="mt-6"
            onClose={() => setHidden((h) => [...h, n.id])}
          >
            {n.body}
          </Alert>
        ))}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        {/* ---------- Analytics ---------- */}
        <Card className="md:col-span-2 xl:col-span-6">
          <CardHeader
            title="Analytics"
            actions={
              <DropdownMenu
                trigger={(t) => <IconButton icon="more-h" label="Analytics options" size="sm" variant="soft" {...t} />}
                items={[
                  { label: "Download CSV", icon: "download", onSelect: () => toast({ title: "CSV downloaded" }) },
                  { label: "Print", icon: "printer", onSelect: () => {} },
                ]}
              />
            }
          />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 px-5 pt-2 pb-4">
            <span className="text-sm text-muted">Today</span>
            <div className="flex items-start gap-2">
              <span className="text-[30px] leading-none font-normal tracking-[-0.04em] tabular-nums">186,450</span>
              <span className="mt-0.5 text-[11px] font-semibold text-muted">Rs</span>
              <Delta value="12%" className="mt-1" />
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[30px] leading-none font-normal tracking-[-0.04em] tabular-nums">2,418</span>
              <span className="mt-0.5 text-[11px] font-semibold text-muted">{appConfig.weightUnit}</span>
              <Delta value="4.1%" className="mt-1" />
            </div>
          </div>
          <div className="px-5 pt-6">
            <BarChart
              data={data}
              accent={[data.length - 1]}
              format={formatCompact}
              height={190}
              label={`Monthly ${series}, ${months[0]} to ${months[data.length - 1]}`}
            />
          </div>
          <div className="px-5 pt-4 pb-5">
            <Tabs value={series} onChange={setSeries} items={seriesTabs} size="sm" />
          </div>
        </Card>

        {/* ---------- Two stacked tiles ---------- */}
        <div className="grid gap-4 xl:col-span-3">
          <StatCard
            label="Items in stock"
            value={formatNumber(inStockPct, 1)}
            unit="%"
            size="lg"
            hint="±2.1% from last week"
          />
          <StatCard variant="info" label="Cash in hand · 12:02" value={formatCompact(74200)} unit="Rs" size="lg" hint="+Rs 18,900 since opening" />
        </div>

        {/* ---------- Summary ---------- */}
        <Card className="flex flex-col xl:col-span-3">
          <div className="flex items-center gap-4 px-5 pt-5">
            <LegendDot label="Cash" />
            <LegendDot label="Credit" dotClassName="bg-primary" />
          </div>
          <div className="px-5 pt-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[32px] leading-none font-normal tracking-[-0.04em] tabular-nums">{formatNumber(1245800)}</p>
              <Delta value="16%" />
            </div>
            <p className="mt-1.5 text-xs text-muted">Rs sold this month</p>
          </div>
          <div className="px-5 pt-6">
            <div className="flex h-2.5 w-full gap-1 overflow-hidden" role="img" aria-label="Cash 68%, credit 32%">
              <span className="h-full rounded-full bg-accent" style={{ width: "68%" }} />
              <span className="h-full flex-1 rounded-full bg-primary" />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted tabular-nums">
              <span>Cash 68%</span>
              <span>Credit 32%</span>
            </div>
          </div>
          <div className="mt-auto flex items-end justify-between gap-3 px-5 pt-6 pb-4">
            <p className="text-[11px] leading-snug font-semibold text-muted uppercase">
              Top category
              <br />
              <span className="text-fg underline decoration-line-strong underline-offset-2">{categoriesFor(tenant)[0]} · 41%</span>
            </p>
          </div>
          <div className="grid grid-cols-2 border-t border-line">
            <div className="border-r border-line p-5">
              <p className="text-[32px] leading-none tracking-[-0.04em] tabular-nums">265</p>
              <p className="mt-2 text-xs text-muted">Bills this month</p>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-[32px] leading-none tracking-[-0.04em] tabular-nums">8</p>
                <Delta value="24%" />
              </div>
              <p className="mt-2 text-xs text-muted">New customers</p>
            </div>
          </div>
        </Card>

        {/* ---------- Low stock (accent) ---------- */}
        <div className="relative overflow-hidden rounded-lg bg-accent p-5 text-accent-fg xl:col-span-4">
          <CoilArt className="pointer-events-none absolute -right-6 -bottom-8 size-48 opacity-80" />
          <span className="inline-flex h-7 items-center gap-1 rounded-full bg-surface px-2.5 text-xs font-semibold text-fg">
            <span aria-hidden="true">↗</span> 6% this week
          </span>
          <StepDots count={4} active={step} onChange={setStep} className="mt-5" />
          <p className="mt-6 text-sm font-semibold">Low stock</p>
          <p className="text-[56px] leading-[0.95] tracking-[-0.05em] tabular-nums">
            {low.length}
            <span className="ml-1 text-2xl tracking-normal">items</span>
          </p>
          <Button variant="primary" size="sm" className="mt-4" rightIcon="arrow-right" onClick={() => (location.href = to("/inventory"))}>
            Review
          </Button>
        </div>

        {/* ---------- Weekly bills ---------- */}
        <Card className="p-5 xl:col-span-3">
          <SectionLabel>Bills this week</SectionLabel>
          <DotChart data={weeklyBills} peakChip="18%" height={130} label="Bills per day this week, highest on Saturday" className="mt-2" />
        </Card>

        {/* ---------- Reminder ---------- */}
        <ReminderCard
          className="md:col-span-2 xl:col-span-5"
          title={
            <>
              Restock
              <br />
              before Friday
            </>
          }
          note={
            <>
              <b>{low.length} items</b> are at or below their re-order level.
            </>
          }
          chip={low[0]?.name ?? "All stocked"}
          status={low[0] ? `${formatQty(low[0].stock, low[0].sellBy)} left · re-order at ${formatQty(low[0].reorderLevel, low[0].sellBy)}` : "Nothing below its re-order level"}
          action={{ icon: "cart", label: "Create purchase order", onClick: () => toast({ title: "Purchase order drafted", description: low[0]?.name }) }}
        />

        {/* ---------- Tasks ---------- */}
        <Card className="p-5 md:col-span-2 xl:col-span-5">
          <div className="flex items-center justify-between">
            <SectionLabel>Today’s tasks</SectionLabel>
            <span className="text-xs font-semibold text-muted tabular-nums">
              {tasks.filter((t) => t.done).length}/{tasks.length} done
            </span>
          </div>
          <Checklist
            className="mt-3"
            items={tasks}
            onToggle={(id, done) => setTasks((list) => list.map((t) => (t.id === id ? { ...t, done } : t)))}
          />
        </Card>

        {/* ---------- Low stock table ---------- */}
        <div className="md:col-span-2 xl:col-span-7">
          <DataTable
            data={low}
            columns={lowColumns}
            getRowId={(p) => p.id}
            searchPlaceholder="Search low stock"
            dense
            pageSize={5}
            toolbar={
              <Button size="sm" variant="secondary" rightIcon="arrow-right" onClick={() => (location.href = to("/inventory"))}>
                All items
              </Button>
            }
          />
        </div>
      </div>
    </>
  );
}
