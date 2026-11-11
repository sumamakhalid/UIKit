"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  DropdownMenu,
  IconButton,
  Meter,
  PageHeader,
  Select,
  Tabs,
  useToast,
  type Column,
} from "@/components/ui";
import { NewTenantDrawer } from "@/components/admin/new-tenant-drawer";
import { StatusBadge, TenantCell, when } from "@/components/admin/shared";
import { businessTypes } from "@/lib/saas/catalog";
import { useLinkTo } from "@/lib/saas/link-base";
import { monthlyValue, useSaas } from "@/lib/saas/store";
import type { BusinessType, Tenant, TenantStatus } from "@/lib/saas/types";
import { tenantUrl } from "@/lib/saas/urls";
import { formatMoney } from "@/lib/utils";

type Tab = "all" | TenantStatus;

export default function TenantsPage() {
  const toast = useToast();
  const to = useLinkTo();
  const { state, impersonate, setTenantStatus } = useSaas();
  const [tab, setTab] = useState<Tab>("all");
  const [type, setType] = useState("");
  const [creating, setCreating] = useState(false);
  const [suspend, setSuspend] = useState<Tenant | null>(null);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("new") === "1") setCreating(true);
  }, []);

  const { tenants, plans } = state;
  const count = (s: TenantStatus) => tenants.filter((t) => t.status === s).length;

  const visible = useMemo(
    () => tenants.filter((t) => (tab === "all" || t.status === tab) && (!type || t.type === type)),
    [tenants, tab, type],
  );

  const loginAs = (t: Tenant) => {
    impersonate(t.slug);
    // give the session cookie a moment to save before leaving the page
    setTimeout(() => (location.href = tenantUrl(t.slug)), 50);
  };

  const columns: Column<Tenant>[] = [
    { key: "name", header: "Business", accessor: (t) => t.name, sortable: true, searchable: true, cell: (t) => <TenantCell tenant={t} /> },
    {
      key: "plan",
      header: "Plan",
      accessor: (t) => plans.find((p) => p.id === t.planId)?.name ?? "",
      sortable: true,
      cell: (t) => (
        <Badge tone={t.planId === "pro" ? "primary" : "neutral"}>
          {plans.find((p) => p.id === t.planId)?.name} · {t.cycle === "yearly" ? "yr" : "mo"}
        </Badge>
      ),
    },
    { key: "status", header: "Status", accessor: (t) => t.status, sortable: true, cell: (t) => <StatusBadge status={t.status} size="sm" /> },
    {
      key: "usage",
      header: "Items used",
      hideOnMobile: true,
      accessor: (t) => {
        const p = plans.find((x) => x.id === t.planId);
        return p ? t.usage.items / p.limits.items : 0;
      },
      sortable: true,
      cell: (t) => {
        const p = plans.find((x) => x.id === t.planId);
        if (!p) return "—";
        const pct = t.usage.items / p.limits.items;
        return (
          <div className="w-28">
            <Meter value={t.usage.items} max={p.limits.items} tone={pct >= 0.9 ? "warning" : "ink"} label={`${t.name} items used`} />
            <p className="mt-1 text-[11px] text-muted tabular-nums">
              {t.usage.items.toLocaleString()} / {p.limits.items.toLocaleString()}
            </p>
          </div>
        );
      },
    },
    {
      key: "mrr",
      header: "MRR",
      numeric: true,
      sortable: true,
      accessor: (t) => monthlyValue(t, plans),
      cell: (t) => formatMoney(monthlyValue(t, plans)),
      footer: (rows) => formatMoney(rows.reduce((s, t) => s + monthlyValue(t, plans), 0)),
    },
    { key: "created", header: "Joined", hideOnMobile: true, sortable: true, accessor: (t) => t.createdAt, cell: (t) => when(t.createdAt) },
  ];

  return (
    <>
      <PageHeader
        title="Tenants"
        subtitle="Every business on the platform"
        actions={
          <Button size="lg" arrow onClick={() => setCreating(true)}>
            Add tenant
          </Button>
        }
      />

      <Tabs<Tab>
        className="mt-8 mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: "all", label: "All", count: tenants.length },
          { value: "active", label: "Active", count: count("active") },
          { value: "trial", label: "Trial", count: count("trial") },
          { value: "past_due", label: "Past due", count: count("past_due") },
          { value: "suspended", label: "Suspended", count: count("suspended") },
        ]}
      />

      <DataTable
        data={visible}
        columns={columns}
        getRowId={(t) => t.id}
        searchPlaceholder="Search by name or address"
        defaultSort={{ key: "created", dir: "desc" }}
        onRowClick={(t) => (location.href = to(`/tenants/${t.id}`))}
        toolbar={
          <Select
            size="sm"
            aria-label="Business type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            wrapperClassName="w-44 rounded-full!"
            options={[{ value: "", label: "All types" }, ...(Object.keys(businessTypes) as BusinessType[]).map((k) => ({ value: k, label: businessTypes[k].label }))]}
          />
        }
        rowActions={(t) => (
          <DropdownMenu
            trigger={(p) => <IconButton icon="more" label={`Actions for ${t.name}`} size="sm" {...p} />}
            items={[
              { label: "Open details", icon: "eye", onSelect: () => (location.href = to(`/tenants/${t.id}`)) },
              { label: "Log in as this business", icon: "arrow-up-right", onSelect: () => loginAs(t) },
              { type: "divider" },
              t.status === "suspended"
                ? {
                    label: "Reactivate",
                    icon: "check-circle",
                    onSelect: () => {
                      setTenantStatus(t.id, "active");
                      toast({ title: "Reactivated", description: t.name });
                    },
                  }
                : { label: "Suspend", icon: "x-circle", danger: true, onSelect: () => setSuspend(t) },
            ]}
          />
        )}
      />

      <NewTenantDrawer
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(t) => {
          setCreating(false);
          toast({ title: "Business created", description: `Invite sent to ${t.ownerEmail}` });
          setTimeout(() => (location.href = to(`/tenants/${t.id}`)), 300);
        }}
      />

      <ConfirmDialog
        open={suspend !== null}
        onClose={() => setSuspend(null)}
        danger
        title={`Suspend ${suspend?.name}?`}
        description="Their team can’t sign in until you reactivate. No data is deleted."
        confirmLabel="Suspend"
        onConfirm={() => {
          setTenantStatus(suspend!.id, "suspended", "suspended by super admin");
          toast({ title: "Suspended", description: suspend!.name, tone: "warning" });
        }}
      />
    </>
  );
}
