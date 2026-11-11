"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  PageHeader,
  RadioGroup,
  SearchSelect,
  Select,
  Switch,
  Tabs,
  Textarea,
  useToast,
  type Column,
} from "@/components/ui";
import { TenantCell, when } from "@/components/admin/shared";
import { useSaas } from "@/lib/saas/store";
import type { Announcement, AuditEvent, AuditKind } from "@/lib/saas/types";
import { tenantUrl } from "@/lib/saas/urls";

type Tab = "support" | "log" | "news";

const kinds: AuditKind[] = ["tenant", "billing", "plan", "support", "user", "settings"];

const emptyNews: Omit<Announcement, "id" | "createdAt"> = { title: "", body: "", tone: "info", audience: "all", active: true };

export default function AuditPage() {
  const toast = useToast();
  const { state, impersonate, saveAnnouncement, resetDemo } = useSaas();
  const [tab, setTab] = useState<Tab>("support");
  const [kind, setKind] = useState<"" | AuditKind>("");
  const [lookup, setLookup] = useState<string | null>(null);
  const [news, setNews] = useState<(Omit<Announcement, "id" | "createdAt"> & { id?: string }) | null>(null);
  const [newsError, setNewsError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  const tenantOf = (id?: string) => state.tenants.find((t) => t.id === id);
  const found = lookup ? state.tenants.find((t) => t.id === lookup) : null;

  const logCols: Column<AuditEvent>[] = [
    { key: "at", header: "When", accessor: (a) => a.at, sortable: true, cell: (a) => <span className="whitespace-nowrap">{when(a.at)}</span> },
    { key: "actor", header: "Who", accessor: (a) => a.actor, searchable: true, sortable: true },
    { key: "action", header: "What happened", accessor: (a) => a.action, searchable: true, cell: (a) => <span className="min-w-[220px] inline-block">{a.action}</span> },
    { key: "tenant", header: "Business", hideOnMobile: true, accessor: (a) => tenantOf(a.tenantId)?.name ?? "", searchable: true, cell: (a) => tenantOf(a.tenantId)?.name ?? "—" },
    { key: "kind", header: "Type", accessor: (a) => a.kind, cell: (a) => <Badge size="sm">{a.kind}</Badge> },
  ];

  const saveNews = () => {
    if (!news) return;
    if (!news.title.trim()) return setNewsError("Add a title");
    saveAnnouncement({ ...news, title: news.title.trim() });
    setNews(null);
    toast({ title: news.id ? "Announcement updated" : "Announcement published", description: "Shown on tenant dashboards." });
  };

  return (
    <>
      <PageHeader title="Support & audit" subtitle="Help businesses, see who did what" />

      <Tabs<Tab>
        className="mt-8 mb-4"
        value={tab}
        onChange={setTab}
        items={[
          { value: "support", label: "Support" },
          { value: "log", label: "Audit log", count: state.audit.length },
          { value: "news", label: "Announcements", count: state.announcements.filter((a) => a.active).length },
        ]}
      />

      {tab === "support" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-2xl font-medium tracking-[-0.02em]">Log in as a business</p>
            <p className="mt-1 text-sm text-muted">See exactly what the owner sees to help them. Every login is recorded in the audit log, and a black banner shows while you’re inside.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <SearchSelect
                className="flex-1"
                value={lookup}
                onChange={setLookup}
                placeholder="Find a business"
                searchPlaceholder="Name, owner or address…"
                options={state.tenants.map((t) => ({ value: t.id, label: t.name, description: `${t.ownerName} · ${t.slug}`, meta: t.status.replace("_", " ") }))}
              />
              <Button
                size="md"
                arrow
                disabled={!found}
                onClick={() => {
                  if (!found) return;
                  impersonate(found.slug);
                  setTimeout(() => (location.href = tenantUrl(found.slug)), 50);
                }}
              >
                Log in
              </Button>
            </div>
            {found && (
              <div className="mt-5 rounded-lg bg-surface-2 p-4">
                <TenantCell tenant={found} />
              </div>
            )}
          </Card>

          <Card className="flex flex-col p-6">
            <p className="text-2xl font-medium tracking-[-0.02em]">Recent support actions</p>
            <ol className="mt-3 flex-1">
              {state.audit
                .filter((a) => a.kind === "support")
                .slice(0, 5)
                .map((a) => (
                  <li key={a.id} className="flex gap-3 border-b border-line py-2.5 text-sm last:border-0">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/30" />
                    <div>
                      <p>{a.action}</p>
                      <p className="text-xs text-muted">{when(a.at)}</p>
                    </div>
                  </li>
                ))}
            </ol>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-dashed border-line-strong p-3">
              <p className="text-xs text-muted">Demo only: put all sample data back to the start.</p>
              <Button size="sm" variant="outline" onClick={() => setResetOpen(true)}>
                Reset demo
              </Button>
            </div>
          </Card>
        </div>
      )}

      {tab === "log" && (
        <DataTable
          data={state.audit.filter((a) => !kind || a.kind === kind)}
          columns={logCols}
          getRowId={(a) => a.id}
          searchPlaceholder="Search actions, people, businesses"
          defaultSort={{ key: "at", dir: "desc" }}
          pageSize={12}
          toolbar={
            <Select
              size="sm"
              aria-label="Type"
              value={kind}
              onChange={(e) => setKind(e.target.value as "" | AuditKind)}
              wrapperClassName="w-40 rounded-full!"
              options={[{ value: "", label: "All types" }, ...kinds.map((k) => ({ value: k, label: k[0]!.toUpperCase() + k.slice(1) }))]}
            />
          }
        />
      )}

      {tab === "news" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Button size="lg" arrow onClick={() => (setNews({ ...emptyNews }), setNewsError(""))}>
              New announcement
            </Button>
          </div>
          {state.announcements.length === 0 && <Card className="p-10 text-center text-sm text-muted">No announcements yet.</Card>}
          {state.announcements.map((a) => (
            <Card key={a.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Alert tone={a.tone} title={a.title} className="flex-1">
                {a.body}
              </Alert>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                <Badge tone={a.active ? "success" : "neutral"} dot>
                  {a.active ? "Showing" : "Hidden"}
                </Badge>
                <span className="text-xs text-muted">
                  {a.audience === "all" ? "All businesses" : `${state.plans.find((p) => p.id === a.audience)?.name} plan`} · {a.createdAt}
                </span>
                <Button size="sm" variant="secondary" onClick={() => (setNews({ ...a }), setNewsError(""))}>
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={news !== null}
        onClose={() => setNews(null)}
        title={news?.id ? "Edit announcement" : "New announcement"}
        description="Appears at the top of each tenant’s dashboard until they close it."
        footer={
          <>
            <Button variant="outline" onClick={() => setNews(null)}>
              Cancel
            </Button>
            <Button onClick={saveNews}>{news?.id ? "Save" : "Publish"}</Button>
          </>
        }
      >
        {news && (
          <div className="flex flex-col gap-4">
            <Field label="Title" required error={newsError}>
              <Input data-autofocus value={news.title} onChange={(e) => setNews({ ...news, title: e.target.value })} placeholder="e.g. New feature: WhatsApp reminders" />
            </Field>
            <Field label="Message">
              <Textarea value={news.body} onChange={(e) => setNews({ ...news, body: e.target.value })} rows={3} />
            </Field>
            <Field label="Who sees it">
              <Select
                value={news.audience}
                onChange={(e) => setNews({ ...news, audience: e.target.value })}
                options={[{ value: "all", label: "All businesses" }, ...state.plans.map((p) => ({ value: p.id, label: `${p.name} plan only` }))]}
              />
            </Field>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-semibold">Style</span>
              <RadioGroup<Announcement["tone"]>
                name="tone"
                variant="card"
                className="sm:grid-cols-3!"
                value={news.tone}
                onChange={(tone) => setNews({ ...news, tone })}
                options={[
                  { value: "info", label: "Info" },
                  { value: "success", label: "Good news" },
                  { value: "warning", label: "Warning" },
                ]}
              />
            </div>
            <Switch checked={news.active} onCheckedChange={(active) => setNews({ ...news, active })} label="Show now" />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        danger
        title="Reset demo data?"
        description="All tenants, plans, invoices and logs go back to the sample data. You stay signed in."
        confirmLabel="Reset"
        onConfirm={() => {
          resetDemo();
          toast({ title: "Demo data reset" });
        }}
      />
    </>
  );
}
