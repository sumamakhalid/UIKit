"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  DescriptionList,
  Drawer,
  DropdownMenu,
  Field,
  IconButton,
  Input,
  Modal,
  MoneyInput,
  NumberInput,
  PageHeader,
  SegmentedControl,
  Select,
  StatCard,
  StockBadge,
  Tabs,
  useToast,
  type Column,
} from "@/components/ui";
import { appConfig } from "@/lib/config";
import { useCurrentTenant } from "@/components/saas/tenant-frame";
import { UpgradeModal } from "@/components/saas/upgrade-modal";
import { categoriesFor, productsFor } from "@/lib/saas/demo-products";
import type { Product, SellBy } from "@/lib/sample-data";
import { formatCompact, formatMoney, formatNumber, formatQty, round } from "@/lib/utils";


type Tab = "all" | "low" | "out";

interface FormState {
  name: string;
  sku: string;
  category: string;
  sellBy: SellBy;
  rate: number | null;
  cost: number | null;
  stock: number | null;
  reorderLevel: number | null;
}

const emptyForm: FormState = {
  name: "",
  sku: "",
  category: "",
  sellBy: "weight",
  rate: null,
  cost: null,
  stock: null,
  reorderLevel: null,
};

export function InventoryView() {
  const toast = useToast();
  const { tenant, plan, role } = useCurrentTenant();
  const categories = categoriesFor(tenant);
  const canEdit = role !== "cashier" && role !== "viewer";
  const [items, setItems] = useState<Product[]>(() => productsFor(tenant));
  const [limitOpen, setLimitOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
  const [category, setCategory] = useState("");

  // Add / edit drawer
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);

  // Stock in modal
  const [stockIn, setStockIn] = useState<Product | null>(null);
  const [inQty, setInQty] = useState<number | null>(null);
  const [inCost, setInCost] = useState<number | null>(null);

  // Delete
  const [toDelete, setToDelete] = useState<Product[] | null>(null);

  const low = items.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel);
  const out = items.filter((p) => p.stock <= 0);
  const stockValue = items.reduce((s, p) => s + p.stock * p.cost, 0);

  const visible = useMemo(() => {
    let list = items;
    if (tab === "low") list = low;
    if (tab === "out") list = out;
    if (category) list = list.filter((p) => p.category === category);
    return list;
  }, [items, tab, category, low, out]);

  // Open the add form from the top-bar "+" (…/inventory?new=1)
  useEffect(() => {
    if (new URLSearchParams(location.search).get("new") === "1") openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    if (items.length >= plan.limits.items) {
      setLimitOpen(true);
      return;
    }
    setForm(emptyForm);
    setErrors({});
    setEditing("new");
  };

  const openEdit = (p: Product) => {
    setForm({ ...p });
    setErrors({});
    setEditing(p);
  };

  const save = async () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Item name is required";
    if (!form.category) e.category = "Choose a category";
    if (form.rate === null || form.rate <= 0) e.rate = "Enter the sale rate";
    if (form.cost !== null && form.rate !== null && form.cost > form.rate) e.cost = "Cost is higher than the sale rate";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 500)); // simulate API call
    const record: Product = {
      id: editing === "new" ? crypto.randomUUID() : (editing as Product).id,
      sku: form.sku || form.name.slice(0, 2).toUpperCase() + "-" + Math.floor(Math.random() * 900 + 100),
      name: form.name.trim(),
      category: form.category,
      sellBy: form.sellBy,
      rate: form.rate!,
      cost: form.cost ?? 0,
      stock: form.stock ?? 0,
      reorderLevel: form.reorderLevel ?? 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setItems((list) => (editing === "new" ? [record, ...list] : list.map((p) => (p.id === record.id ? record : p))));
    setSaving(false);
    setEditing(null);
    toast({ title: editing === "new" ? "Item added" : "Changes saved", description: record.name });
  };

  const confirmStockIn = () => {
    if (!stockIn || !inQty) return;
    setItems((list) =>
      list.map((p) =>
        p.id === stockIn.id ? { ...p, stock: round(p.stock + inQty, 3), cost: inCost ?? p.cost } : p,
      ),
    );
    toast({ title: "Stock added", description: `${formatQty(inQty, stockIn.sellBy)} of ${stockIn.name}` });
    setStockIn(null);
  };

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Item",
      accessor: (p) => p.name,
      sortable: true,
      searchable: true,
      cell: (p) => (
        <div className="min-w-[180px]">
          <p className="font-semibold">{p.name}</p>
          <p className="font-mono text-xs text-muted">{p.sku}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", accessor: (p) => p.category, sortable: true, searchable: true, hideOnMobile: true },
    {
      key: "sellBy",
      header: "Sold by",
      accessor: (p) => p.sellBy,
      hideOnMobile: true,
      cell: (p) => (
        <Badge tone={p.sellBy === "weight" ? "info" : "neutral"} size="sm">
          {p.sellBy === "weight" ? `Per ${appConfig.weightUnit}` : "Per piece"}
        </Badge>
      ),
    },
    {
      key: "rate",
      header: "Rate",
      numeric: true,
      sortable: true,
      accessor: (p) => p.rate,
      cell: (p) => (
        <>
          {formatMoney(p.rate)}
          <span className="text-muted">/{p.sellBy === "weight" ? appConfig.weightUnit : appConfig.pieceUnit}</span>
        </>
      ),
    },
    {
      key: "stock",
      header: "In stock",
      numeric: true,
      sortable: true,
      accessor: (p) => p.stock,
      cell: (p) => <span className={p.stock <= 0 ? "text-danger" : ""}>{formatQty(p.stock, p.sellBy)}</span>,
    },
    {
      key: "status",
      header: "Status",
      accessor: (p) => (p.stock <= 0 ? 0 : p.stock <= p.reorderLevel ? 1 : 2),
      sortable: true,
      cell: (p) => <StockBadge qty={p.stock} reorderLevel={p.reorderLevel} size="sm" />,
    },
    {
      key: "value",
      header: "Stock value",
      numeric: true,
      sortable: true,
      hideOnMobile: true,
      accessor: (p) => p.stock * p.cost,
      cell: (p) => formatMoney(p.stock * p.cost),
      footer: (rows) => formatMoney(rows.reduce((s, p) => s + p.stock * p.cost, 0)),
    },
  ];

  const isWeight = form.sellBy === "weight";
  const inTotal = (inQty ?? 0) * (inCost ?? 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Every item, live stock"
        actions={
          <>
            <Button variant="outline" size="lg" leftIcon="download">
              Export
            </Button>
            {canEdit && (
              <Button size="lg" arrow onClick={openNew}>
                Add item
              </Button>
            )}
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total items" value={formatNumber(items.length)} icon="box" hint={`${categories.length} categories`} />
        <StatCard
          label="Stock value (cost)"
          value={formatCompact(stockValue)}
          unit={appConfig.currency}
          variant="accent"
          icon="wallet"
          change={{ value: "4.2%", direction: "up" }}
          hint="vs last month"
        />
        <StatCard label="Low stock" value={low.length} icon="alert" variant="info" hint="at or below re-order level" />
        <StatCard label="Out of stock" value={out.length} icon="x-circle" variant="ink" hint="needs purchase" />
      </div>

      <div className="mt-6">
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          items={[
            { value: "all", label: "All items", count: items.length },
            { value: "low", label: "Low stock", count: low.length },
            { value: "out", label: "Out of stock", count: out.length },
          ]}
          className="mb-4"
        />

        <DataTable
          data={visible}
          columns={columns}
          getRowId={(p) => p.id}
          searchPlaceholder="Search by name, SKU or category"
          selectable
          onRowClick={canEdit ? openEdit : undefined}
          defaultSort={{ key: "name", dir: "asc" }}
          pageSize={8}
          toolbar={
            <Select
              size="sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c, label: c }))]}
              aria-label="Filter by category"
              wrapperClassName="w-44"
            />
          }
          bulkActions={(ids, clear) => (
            <>
              <Button size="sm" variant="outline" leftIcon="printer">
                Print labels
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon="trash"
                onClick={() => {
                  setToDelete(items.filter((p) => ids.includes(p.id)));
                  clear();
                }}
              >
                Delete
              </Button>
            </>
          )}
          rowActions={(p) => (
            <DropdownMenu
              trigger={(t) => <IconButton icon="more" label={`Actions for ${p.name}`} size="sm" {...t} />}
              items={[
                { label: "Edit item", icon: "edit", onSelect: () => openEdit(p) },
                {
                  label: "Stock in",
                  icon: "arrow-in",
                  onSelect: () => {
                    setStockIn(p);
                    setInQty(null);
                    setInCost(p.cost);
                  },
                },
                { type: "divider" },
                { label: "Delete", icon: "trash", danger: true, onSelect: () => setToDelete([p]) },
              ]}
            />
          )}
        />
      </div>

      {/* ---------- Add / edit item ---------- */}
      <Drawer
        open={editing !== null}
        onClose={() => !saving && setEditing(null)}
        title={editing === "new" ? "Add item" : "Edit item"}
        description="Items can be sold by weight or per piece."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing === "new" ? "Add item" : "Save changes"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Item name" required error={errors.name}>
            <Input
              data-autofocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. GI Wire No. 12"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="SKU / code" hint="Leave blank to auto-generate">
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="GI-12" />
            </Field>
            <Field label="Category" required error={errors.category}>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Choose…"
                options={categories.map((c) => ({ value: c, label: c }))}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-fg">How is it sold?</span>
            <SegmentedControl<SellBy>
              fullWidth
              aria-label="Sold by"
              value={form.sellBy}
              onChange={(v) => setForm({ ...form, sellBy: v })}
              options={[
                { value: "weight", label: `By weight (${appConfig.weightUnit})` },
                { value: "unit", label: "Per piece" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={`Sale rate / ${isWeight ? appConfig.weightUnit : appConfig.pieceUnit}`} required error={errors.rate}>
              <MoneyInput value={form.rate} onValueChange={(v) => setForm({ ...form, rate: v })} />
            </Field>
            <Field label={`Cost / ${isWeight ? appConfig.weightUnit : appConfig.pieceUnit}`} error={errors.cost}>
              <MoneyInput value={form.cost} onValueChange={(v) => setForm({ ...form, cost: v })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={editing === "new" ? "Opening stock" : "Current stock"}>
              <NumberInput
                value={form.stock}
                onValueChange={(v) => setForm({ ...form, stock: v })}
                decimals={isWeight ? appConfig.weightDecimals : 0}
                trailing={isWeight ? appConfig.weightUnit : appConfig.pieceUnit}
                min={0}
              />
            </Field>
            <Field label="Re-order level" hint="Warn me below this">
              <NumberInput
                value={form.reorderLevel}
                onValueChange={(v) => setForm({ ...form, reorderLevel: v })}
                decimals={isWeight ? appConfig.weightDecimals : 0}
                trailing={isWeight ? appConfig.weightUnit : appConfig.pieceUnit}
                min={0}
              />
            </Field>
          </div>

          {form.rate !== null && form.cost !== null && form.rate > 0 && (
            <div className="rounded-lg border border-line bg-surface-2/60 px-4 py-1">
              <DescriptionList
                items={[
                  { label: "Profit per " + (isWeight ? appConfig.weightUnit : "piece"), value: formatMoney(form.rate - form.cost) },
                  { label: "Margin", value: `${formatNumber(((form.rate - form.cost) / form.rate) * 100, 1)}%` },
                ]}
              />
            </div>
          )}
        </div>
      </Drawer>

      {/* ---------- Stock in ---------- */}
      <Modal
        open={stockIn !== null}
        onClose={() => setStockIn(null)}
        title="Stock in"
        description={stockIn ? `Add new stock for ${stockIn.name}` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setStockIn(null)}>
              Cancel
            </Button>
            <Button onClick={confirmStockIn} disabled={!inQty}>
              Add to stock
            </Button>
          </>
        }
      >
        {stockIn && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={stockIn.sellBy === "weight" ? "Weight received" : "Quantity received"} required>
                <NumberInput
                  data-autofocus
                  value={inQty}
                  onValueChange={setInQty}
                  decimals={stockIn.sellBy === "weight" ? appConfig.weightDecimals : 0}
                  trailing={stockIn.sellBy === "weight" ? appConfig.weightUnit : appConfig.pieceUnit}
                  min={0}
                />
              </Field>
              <Field label={`Purchase rate / ${stockIn.sellBy === "weight" ? appConfig.weightUnit : appConfig.pieceUnit}`}>
                <MoneyInput value={inCost} onValueChange={setInCost} />
              </Field>
            </div>
            <div className="rounded-lg border border-line bg-surface-2/60 px-4 py-1">
              <DescriptionList
                items={[
                  { label: "Current stock", value: formatQty(stockIn.stock, stockIn.sellBy) },
                  { label: "After stock in", value: formatQty(round(stockIn.stock + (inQty ?? 0), 3), stockIn.sellBy) },
                  { label: "Purchase total", value: formatMoney(inTotal), emphasis: true },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Delete ---------- */}
      <ConfirmDialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        danger
        title={toDelete && toDelete.length > 1 ? `Delete ${toDelete.length} items?` : "Delete this item?"}
        description={
          toDelete?.length === 1
            ? `“${toDelete[0]!.name}” will be removed. Past sales and bills keep their records.`
            : "These items will be removed. Past sales and bills keep their records."
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 400));
          const ids = new Set(toDelete!.map((p) => p.id));
          setItems((list) => list.filter((p) => !ids.has(p.id)));
          toast({ title: `${ids.size} item${ids.size > 1 ? "s" : ""} deleted`, tone: "danger" });
        }}
      />
      <UpgradeModal
        open={limitOpen}
        onClose={() => setLimitOpen(false)}
        title="Item limit reached"
        reason={`The ${plan.name} plan allows ${formatNumber(plan.limits.items)} items. Upgrade to add more.`}
      />
    </>
  );
}
