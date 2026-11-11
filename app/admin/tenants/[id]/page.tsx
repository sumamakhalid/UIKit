"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  DataTable,
  DescriptionList,
  EmptyState,
  Field,
  Meter,
  Modal,
  PageHeader,
  RadioGroup,
  SegmentedControl,
  StatCard,
  Tabs,
  useToast,
  type Column,
} from "@/components/ui";
import { StatusBadge, when } from "@/components/admin/shared";
import { invoiceTone } from "@/components/tenant/billing-view";
import { businessTypes, featureLabels, roleInfo } from "@/lib/saas/catalog";
import { useLinkTo } from "@/lib/saas/link-base";
import { daysLeft, monthlyValue, useSaas, useTenant } from "@/lib/saas/store";
import type { BillingCycle, Invoice, Member } from "@/lib/saas/types";
import { tenantDisplayHost, tenantUrl } from "@/lib/saas/urls";
import { formatMoney, formatNumber } from "@/lib/utils";
import { usageTone } from "@/lib/saas/store";

type Tab = "overview" | "team" | "invoices" | "activity";

export default function TenantDetailPage() {
  const toast = useToast();
  const to = useLinkTo();
  const params = useParams<{ id: string }>();
  const { state, impersonate, setTenantStatus, changePlan, extendTrial, markInvoicePaid, sendReminder } = useSaas();
  const tenant = state.tenants.find((t) => t.id === params?.id) ?? null;
  const { plan, members, invoices } = useTenant(tenant?.slug ?? "");
  const [tab, setTab] = useState<Tab>("overview");
  const [planOpen, setPlanOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ planId: tenant?.planId ?? "", cycle: (tenant?.cycle ?? "monthly") as BillingCycle });
  const [confirmSuspend, setConfirmSuspend] = useState(false);

  if (!tenant || !plan) {
    return (
      <Card>
        <EmptyState
          icon="search"
          title="Tenant not found"
          description="It may have been removed."
          action={<Button onClick={() => (location.href = to("/tenants"))}>Back to tenants</Button>}
        />
      </Card>
    );
  }

  const activity = state.audit.filter((a) => a.tenantId === tenant.id);
  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const owed = invoices.filter((i) => i.status === "due" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const loginAs = () => {
    impersonate(tenant.slug);
    setTimeout(() => (location.href = tenantUrl(tenant.slug)), 50);
  };

  const usage = [
    { label: "Team members", used: tenant.usage.users, max: plan.limits.users },
    { label: "Items", used: tenant.usage.items, max: plan.limits.items },
    { label: "Bills this month", used: tenant.usage.billsThisMonth, max: plan.limits.bills },
    { label: "Branches", used: tenant.usage.branches, max: plan.limits.branches },
  ];

  const memberCols: Column<Member>[] = [
    {
      key: "name",
      header: "Member",
      accessor: (m) => m.name,
      searchable: true,
      cell: (m) => (
        <div className="flex items-center gap-3">
          <Avatar name={m.name} size={32} />
          <div>
            <p className="font-semibold">{m.name}</p>
            <p className="text-xs text-muted">{m.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", accessor: (m) => m.role, cell: (m) => <Badge tone={m.role === "owner" ? "primary" : "neutral"}>{roleInfo[m.role].label}</Badge> },
    {
      key: "status",
      header: "Status",
      accessor: (m) => m.status,
      cell: (m) => (
        <Badge tone={m.status === "active" ? "success" : "warning"} dot size="sm">
          {m.status === "active" ? "Active" : "Invite sent"}
        </Badge>
      ),
    },
    { key: "last", header: "Last active", hideOnMobile: true, accessor: (m) => m.lastActive ?? "", cell: (m) => m.lastActive ?? "—" },
  ];

  const invoiceCols: Column<Invoice>[] = [
    { key: "n", header: "Invoice", accessor: (i) => i.number, searchable: true, cell: (i) => <span className="font-semibold">{i.number}</span> },
    { key: "d", header: "Issued", accessor: (i) => i.issuedAt, sortable: true },
    { key: "a", header: "Amount", numeric: true, accessor: (i) => i.amount, cell: (i) => formatMoney(i.amount), footer: (r) => formatMoney(r.reduce((s, i) => s + i.amount, 0)) },
    {
      key: "s",
      header: "Status",
      accessor: (i) => i.status,
      cell: (i) => (
        <Badge tone={invoiceTone[i.status]} dot size="sm">
          {i.status[0]!.toUpperCase() + i.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "Tenants", href: to("/tenants") }, { label: tenant.name }]}
        title={tenant.name}
        subtitle={tenantDisplayHost(tenant.slug)}
        actions={
          <>
            {tenant.status === "suspended" ? (
              <Button
                variant="outline"
                size="lg"
                leftIcon="check-circle"
                onClick={() => {
                  setTenantStatus(tenant.id, "active");
                  toast({ title: "Reactivated" });
                }}
              >
                Reactivate
              </Button>
            ) : (
              <Button variant="outline" size="lg" leftIcon="x-circle" onClick={() => setConfirmSuspend(true)}>
                Suspend
              </Button>
            )}
            <Button size="lg" arrow onClick={loginAs}>
              Log in as business
            </Button>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          variant="accent"
          label="Plan"
          value={plan.name}
          hint={tenant.status === "trial" ? `Trial · then ${formatMoney(tenant.cycle === "yearly" ? plan.priceYearly : plan.priceMonthly)}/${tenant.cycle === "yearly" ? "yr" : "mo"}` : `${tenant.cycle === "yearly" ? "Yearly" : "Monthly"} · ${formatMoney(monthlyValue(tenant, state.plans))}/mo`}
        >
          <div className="mt-3">
            <StatusBadge status={tenant.status} className="bg-surface! text-fg!" />
          </div>
        </StatCard>
        <StatCard label="Paid so far" value={formatNumber(paid)} unit="Rs" hint={`${invoices.filter((i) => i.status === "paid").length} invoices`} />
        <StatCard variant={owed ? "ink" : "default"} label="Owed" value={formatNumber(owed)} unit="Rs" hint={owed ? "Due or overdue" : "Nothing owed"} />
        <StatCard
          variant="info"
          label={tenant.status === "trial" ? "Trial ends in" : "Customer since"}
          value={tenant.status === "trial" ? daysLeft(tenant.trialEndsAt) : when(tenant.createdAt)}
          unit={tenant.status === "trial" ? "days" : undefined}
          hint={tenant.status === "trial" ? tenant.trialEndsAt : businessTypes[tenant.type].label}
        />
      </div>

      <Tabs<Tab>
        className="mt-8 mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: "overview", label: "Overview" },
          { value: "team", label: "Team", count: members.length },
          { value: "invoices", label: "Invoices", count: invoices.length },
          { value: "activity", label: "Activity", count: activity.length },
        ]}
      />

      {tab === "overview" && (
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="p-5 xl:col-span-2">
            <p className="text-sm font-semibold">Usage vs plan limits</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {usage.map((u) => {
                return (
                  <div key={u.label}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{u.label}</span>
                      <span className="text-muted tabular-nums">
                        {formatNumber(u.used)} / {formatNumber(u.max)}
                      </span>
                    </div>
                    <Meter className="mt-2" value={u.used} max={u.max} tone={usageTone(u.used, u.max)} label={u.label} />
                  </div>
                );
              })}
            </div>
            <p className="mt-8 text-sm font-semibold">Features in use</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {tenant.settings.enabled.map((f) => (
                <Badge key={f} tone={plan.features.includes(f) ? "accent" : "neutral"}>
                  {featureLabels[f].label}
                </Badge>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader
              title="Subscription"
              actions={
                <Button size="sm" variant="secondary" onClick={() => (setNewPlan({ planId: tenant.planId, cycle: tenant.cycle }), setPlanOpen(true))}>
                  Change
                </Button>
              }
            />
            <div className="px-5 pb-5">
              <DescriptionList
                items={[
                  { label: "Owner", value: tenant.ownerName },
                  { label: "Email", value: <span className="text-xs">{tenant.ownerEmail}</span> },
                  { label: "City", value: tenant.settings.city || "—" },
                  { label: "Type", value: businessTypes[tenant.type].label },
                  { label: "Billing", value: tenant.cycle === "yearly" ? "Yearly" : "Monthly" },
                  { label: "MRR", value: formatMoney(monthlyValue(tenant, state.plans)), emphasis: true },
                ]}
              />
              {tenant.status === "trial" && (
                <Button
                  fullWidth
                  variant="accent"
                  className="mt-4"
                  onClick={() => {
                    extendTrial(tenant.id, 7);
                    toast({ title: "Trial extended by 7 days" });
                  }}
                >
                  Extend trial 7 days
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === "team" && <DataTable data={members} columns={memberCols} getRowId={(m) => m.id} searchPlaceholder="Search members" />}

      {tab === "invoices" && (
        <DataTable
          data={invoices}
          columns={invoiceCols}
          getRowId={(i) => i.id}
          searchPlaceholder="Search invoices"
          pageSize={8}
          rowActions={(i) =>
            i.status === "paid" ? null : (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    sendReminder(i.id);
                    toast({ title: "Reminder sent", description: tenant.ownerEmail });
                  }}
                >
                  Remind
                </Button>
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => {
                    markInvoicePaid(i.id);
                    toast({ title: `${i.number} marked paid` });
                  }}
                >
                  Mark paid
                </Button>
              </div>
            )
          }
        />
      )}

      {tab === "activity" && (
        <Card className="p-5">
          {activity.length === 0 && <EmptyState icon="clock" title="No activity yet" />}
          <ol className="flex flex-col">
            {activity.map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-line py-3 text-sm last:border-0">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/30" />
                <div className="min-w-0 flex-1">
                  <p>{a.action}</p>
                  <p className="text-xs text-muted">
                    {a.actor} · {when(a.at)}
                  </p>
                </div>
                <Badge size="sm">{a.kind}</Badge>
              </li>
            ))}
          </ol>
        </Card>
      )}

      <Modal
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        title="Change plan"
        description={`${tenant.name} is on ${plan.name}. The change is logged and the next invoice uses the new price.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                changePlan(tenant.id, newPlan.planId, newPlan.cycle);
                setPlanOpen(false);
                toast({ title: "Plan changed" });
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SegmentedControl<BillingCycle>
            fullWidth
            aria-label="Billing cycle"
            value={newPlan.cycle}
            onChange={(cycle) => setNewPlan({ ...newPlan, cycle })}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Field label="Plan">
            <RadioGroup
              name="change-plan"
              variant="card"
              className="sm:grid-cols-1!"
              value={newPlan.planId}
              onChange={(planId) => setNewPlan({ ...newPlan, planId })}
              options={state.plans
                .filter((p) => !p.archived)
                .map((p) => ({
                  value: p.id,
                  label: `${p.name} — ${formatMoney(newPlan.cycle === "yearly" ? p.priceYearly : p.priceMonthly)}`,
                  description: `${p.limits.users} users · ${p.limits.items.toLocaleString()} items`,
                }))}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmSuspend}
        onClose={() => setConfirmSuspend(false)}
        danger
        title={`Suspend ${tenant.name}?`}
        description="Their team can’t sign in until you reactivate. No data is deleted."
        confirmLabel="Suspend"
        onConfirm={() => {
          setTenantStatus(tenant.id, "suspended", "suspended by super admin");
          toast({ title: "Suspended", tone: "warning" });
        }}
      />
    </>
  );
}
