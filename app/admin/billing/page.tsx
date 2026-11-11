"use client";

import { useMemo, useState } from "react";
import { Badge, BarChart, Button, Card, DataTable, PageHeader, Select, StatCard, Tabs, useToast, type Column } from "@/components/ui";
import { TenantCell } from "@/components/admin/shared";
import { invoiceTone } from "@/components/tenant/billing-view";
import { useLinkTo } from "@/lib/saas/link-base";
import { TODAY, monthlyValue, useSaas } from "@/lib/saas/store";
import type { Invoice, InvoiceStatus, Tenant } from "@/lib/saas/types";
import { formatCompact, formatMoney } from "@/lib/utils";

type Tab = "invoices" | "subscriptions";

export default function BillingPage() {
  const toast = useToast();
  const to = useLinkTo();
  const { state, markInvoicePaid, sendReminder } = useSaas();
  const [tab, setTab] = useState<Tab>("invoices");
  const [status, setStatus] = useState<"" | InvoiceStatus>("");

  const { invoices, tenants, plans } = state;
  const tenantOf = (id: string) => tenants.find((t) => t.id === id);
  const mrr = tenants.reduce((s, t) => s + monthlyValue(t, plans), 0);
  const month = TODAY.slice(0, 7);
  const collected = invoices.filter((i) => i.status === "paid" && (i.paidAt ?? "").startsWith(month)).reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "overdue");
  const due = invoices.filter((i) => i.status === "due");

  const byMonth = useMemo(() => {
    const keys = [...new Set(invoices.map((i) => i.issuedAt.slice(0, 7)))].sort().slice(-6);
    return keys.map((k) => ({
      label: new Date(k + "-01T00:00:00").toLocaleDateString("en-GB", { month: "short" }),
      value: invoices.filter((i) => i.issuedAt.startsWith(k) && i.status === "paid").reduce((s, i) => s + i.amount, 0),
    }));
  }, [invoices]);

  const list = invoices.filter((i) => !status || i.status === status);

  const invoiceCols: Column<Invoice>[] = [
    { key: "n", header: "Invoice", accessor: (i) => i.number, searchable: true, sortable: true, cell: (i) => <span className="font-semibold">{i.number}</span> },
    {
      key: "t",
      header: "Business",
      accessor: (i) => tenantOf(i.tenantId)?.name ?? "",
      searchable: true,
      sortable: true,
      cell: (i) => {
        const t = tenantOf(i.tenantId);
        return t ? <TenantCell tenant={t} showType={false} /> : "—";
      },
    },
    { key: "d", header: "Issued", accessor: (i) => i.issuedAt, sortable: true, hideOnMobile: true },
    { key: "due", header: "Due", accessor: (i) => i.dueAt, sortable: true, hideOnMobile: true },
    { key: "a", header: "Amount", numeric: true, sortable: true, accessor: (i) => i.amount, cell: (i) => formatMoney(i.amount), footer: (r) => formatMoney(r.reduce((s, i) => s + i.amount, 0)) },
    {
      key: "s",
      header: "Status",
      accessor: (i) => i.status,
      sortable: true,
      cell: (i) => (
        <Badge tone={invoiceTone[i.status]} dot size="sm">
          {i.status[0]!.toUpperCase() + i.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const subCols: Column<Tenant>[] = [
    { key: "t", header: "Business", accessor: (t) => t.name, searchable: true, sortable: true, cell: (t) => <TenantCell tenant={t} /> },
    { key: "p", header: "Plan", accessor: (t) => plans.find((p) => p.id === t.planId)?.name ?? "", sortable: true },
    { key: "c", header: "Cycle", accessor: (t) => t.cycle, cell: (t) => <Badge>{t.cycle === "yearly" ? "Yearly" : "Monthly"}</Badge> },
    {
      key: "s",
      header: "Status",
      accessor: (t) => t.status,
      cell: (t) => (
        <Badge tone={t.status === "active" ? "success" : t.status === "trial" ? "accent" : t.status === "past_due" ? "danger" : "neutral"} dot size="sm">
          {t.status.replace("_", " ")}
        </Badge>
      ),
    },
    { key: "m", header: "MRR", numeric: true, sortable: true, accessor: (t) => monthlyValue(t, plans), cell: (t) => formatMoney(monthlyValue(t, plans)), footer: (r) => formatMoney(r.reduce((s, t) => s + monthlyValue(t, plans), 0)) },
  ];

  return (
    <>
      <PageHeader title="Billing" subtitle="Invoices and subscriptions" />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard variant="accent" label="MRR" value={formatCompact(mrr)} unit="Rs" size="lg" hint={`ARR ${formatMoney(mrr * 12)}`} />
        <StatCard label="Collected this month" value={formatCompact(collected)} unit="Rs" size="lg" hint="Paid invoices" />
        <StatCard variant="info" label="Due" value={formatCompact(due.reduce((s, i) => s + i.amount, 0))} unit="Rs" size="lg" hint={`${due.length} invoices not yet late`} />
        <StatCard variant="ink" label="Overdue" value={formatCompact(overdue.reduce((s, i) => s + i.amount, 0))} unit="Rs" size="lg" hint={`${overdue.length} invoices`} />
      </div>

      <Card className="mt-4 p-5">
        <p className="text-sm font-semibold">Collected by month</p>
        <BarChart className="mt-10" data={byMonth} accent={[byMonth.length - 1]} format={formatCompact} height={150} variant="ink" label="Money collected per month" />
      </Card>

      <Tabs<Tab>
        className="mt-8 mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: "invoices", label: "Invoices", count: invoices.length },
          { value: "subscriptions", label: "Subscriptions", count: tenants.length },
        ]}
      />

      {tab === "invoices" ? (
        <DataTable
          data={list}
          columns={invoiceCols}
          getRowId={(i) => i.id}
          searchPlaceholder="Search invoice or business"
          defaultSort={{ key: "d", dir: "desc" }}
          selectable
          bulkActions={(ids, clear) => (
            <Button
              size="sm"
              variant="accent"
              onClick={() => {
                ids.forEach((id) => {
                  const inv = invoices.find((i) => i.id === id);
                  if (inv && inv.status !== "paid") markInvoicePaid(id);
                });
                toast({ title: `Marked ${ids.length} as paid` });
                clear();
              }}
            >
              Mark paid
            </Button>
          )}
          toolbar={
            <Select
              size="sm"
              aria-label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | InvoiceStatus)}
              wrapperClassName="w-40 rounded-full!"
              options={[
                { value: "", label: "All statuses" },
                { value: "paid", label: "Paid" },
                { value: "due", label: "Due" },
                { value: "overdue", label: "Overdue" },
              ]}
            />
          }
          rowActions={(i) =>
            i.status === "paid" ? null : (
              <div className="flex justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    sendReminder(i.id);
                    toast({ title: "Reminder sent", description: tenantOf(i.tenantId)?.ownerEmail });
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
                  Paid
                </Button>
              </div>
            )
          }
        />
      ) : (
        <DataTable
          data={tenants}
          columns={subCols}
          getRowId={(t) => t.id}
          searchPlaceholder="Search businesses"
          defaultSort={{ key: "m", dir: "desc" }}
          onRowClick={(t) => (location.href = to(`/tenants/${t.id}`))}
        />
      )}
    </>
  );
}
