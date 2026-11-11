"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Meter,
  PageHeader,
  SegmentedControl,
  useToast,
  type Column,
} from "@/components/ui";
import { PlanCard, planPrice } from "@/components/saas/plan-cards";
import { useCurrentTenant } from "@/components/saas/tenant-frame";
import { daysLeft, usageTone, useSaas, useTenant } from "@/lib/saas/store";
import type { BillingCycle, Invoice, Plan } from "@/lib/saas/types";
import { formatMoney, formatNumber } from "@/lib/utils";

export const invoiceTone = { paid: "success", due: "warning", overdue: "danger", void: "neutral" } as const;

export function TenantBillingView() {
  const toast = useToast();
  const { tenant, plan } = useCurrentTenant();
  const { invoices } = useTenant(tenant.slug);
  const { state, changePlan, markInvoicePaid } = useSaas();
  const [cycle, setCycle] = useState<BillingCycle>(tenant.cycle);
  const [target, setTarget] = useState<Plan | null>(null);
  const [paying, setPaying] = useState<Invoice | null>(null);

  const plans = state.plans.filter((p) => !p.archived || p.id === plan.id);
  const unpaid = invoices.filter((i) => i.status === "due" || i.status === "overdue");
  const usage = [
    { label: "Team members", used: tenant.usage.users, max: plan.limits.users },
    { label: "Items", used: tenant.usage.items, max: plan.limits.items },
    { label: "Bills this month", used: tenant.usage.billsThisMonth, max: plan.limits.bills },
    { label: "Branches", used: tenant.usage.branches, max: plan.limits.branches },
  ];

  const columns: Column<Invoice>[] = [
    { key: "number", header: "Invoice", accessor: (i) => i.number, cell: (i) => <span className="font-semibold">{i.number}</span> },
    { key: "date", header: "Date", accessor: (i) => i.issuedAt, sortable: true },
    { key: "plan", header: "Plan", hideOnMobile: true, accessor: (i) => state.plans.find((p) => p.id === i.planId)?.name ?? i.planId },
    { key: "amount", header: "Amount", numeric: true, accessor: (i) => i.amount, cell: (i) => formatMoney(i.amount) },
    {
      key: "status",
      header: "Status",
      accessor: (i) => i.status,
      cell: (i) => (
        <Badge tone={invoiceTone[i.status]} dot size="sm">
          {i.status === "due" ? "Due" : i.status[0]!.toUpperCase() + i.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Plan & billing"
        subtitle={`${plan.name} · ${tenant.cycle}`}
        actions={
          unpaid.length > 0 ? (
            <Button size="lg" variant="accent" arrow onClick={() => setPaying(unpaid[0]!)}>
              Pay {formatMoney(unpaid[0]!.amount)}
            </Button>
          ) : undefined
        }
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card className="p-6">
          <p className="text-sm text-muted">Current plan</p>
          <p className="mt-1 text-[40px] leading-none tracking-[-0.04em]">{plan.name}</p>
          <p className="mt-2 text-sm text-muted">
            {tenant.status === "trial"
              ? `Free trial · ${daysLeft(tenant.trialEndsAt)} days left · then ${formatMoney(planPrice(plan, tenant.cycle))}/${tenant.cycle === "yearly" ? "year" : "month"}`
              : `${formatMoney(planPrice(plan, tenant.cycle))} per ${tenant.cycle === "yearly" ? "year" : "month"}`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {tenant.status === "trial" && <Badge tone="accent">Trial</Badge>}
            {tenant.status === "past_due" && <Badge tone="danger" dot>Payment overdue</Badge>}
            {tenant.status === "active" && <Badge tone="success" dot>Active</Badge>}
            <Badge>Since {tenant.createdAt}</Badge>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted">Usage this month</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {usage.map((u) => {
              return (
                <div key={u.label}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium">{u.label}</span>
                    <span className="text-muted tabular-nums">
                      {formatNumber(u.used)} / {formatNumber(u.max)}
                    </span>
                  </div>
                  <Meter className="mt-2" value={u.used} max={u.max} tone={usageTone(u.used, u.max)} label={u.label} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.02em]">Change plan</h2>
          <p className="text-sm text-muted">Upgrades start today. Downgrades start at the next bill.</p>
        </div>
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
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const isCurrent = p.id === plan.id && cycle === tenant.cycle;
          const tooSmall = tenant.usage.users > p.limits.users || tenant.usage.items > p.limits.items;
          return (
            <PlanCard
              key={p.id}
              plan={p}
              cycle={cycle}
              current={p.id === plan.id}
              action={
                <Button
                  fullWidth
                  size="lg"
                  variant={p.highlight ? "accent" : "primary"}
                  disabled={isCurrent || tooSmall}
                  onClick={() => setTarget(p)}
                >
                  {isCurrent ? "Your plan" : p.priceMonthly > plan.priceMonthly ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
                </Button>
              }
              footnote={tooSmall ? "Your usage is above this plan’s limits" : undefined}
            />
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-medium tracking-[-0.02em]">Invoices</h2>
        <DataTable
          data={invoices}
          columns={columns}
          getRowId={(i) => i.id}
          searchable={false}
          pageSize={6}
          rowActions={(i) =>
            i.status === "due" || i.status === "overdue" ? (
              <Button size="sm" variant="accent" onClick={() => setPaying(i)}>
                Pay
              </Button>
            ) : (
              <Button size="sm" variant="ghost" leftIcon="download" onClick={() => toast({ title: `${i.number}.pdf downloaded` })}>
                PDF
              </Button>
            )
          }
        />
      </div>

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        title={`Move to ${target?.name}?`}
        description={
          target
            ? `You will pay ${formatMoney(planPrice(target, cycle))} per ${cycle === "yearly" ? "year" : "month"}. ${
                target.priceMonthly > plan.priceMonthly ? "New limits apply right away." : "The change applies from your next bill."
              }`
            : undefined
        }
        confirmLabel="Confirm"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 400));
          changePlan(tenant.id, target!.id, cycle);
          toast({ title: `You are on ${target!.name}`, description: "Thanks for growing with us." });
        }}
      />

      <ConfirmDialog
        open={paying !== null}
        onClose={() => setPaying(null)}
        title={`Pay ${paying ? formatMoney(paying.amount) : ""}`}
        description={`${paying?.number} — demo payment. In production this opens your payment gateway (JazzCash, Easypaisa, card).`}
        confirmLabel="Pay now"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 600));
          markInvoicePaid(paying!.id);
          toast({ title: "Payment received", description: `${paying!.number} is paid.` });
        }}
      />
    </>
  );
}
