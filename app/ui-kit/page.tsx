"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  ConfirmDialog,
  DataTable,
  DescriptionList,
  Divider,
  Drawer,
  DropdownMenu,
  EmptyState,
  Field,
  Icon,
  IconButton,
  Input,
  Kbd,
  Modal,
  MoneyInput,
  NumberInput,
  PageHeader,
  Pagination,
  RadioGroup,
  SearchSelect,
  SegmentedControl,
  Select,
  Skeleton,
  Spinner,
  StatCard,
  StockBadge,
  Switch,
  Tabs,
  Textarea,
  ThemeToggle,
  Tooltip,
  WeightInput,
  iconNames,
  useToast,
  type Column,
} from "@/components/ui";
import { appConfig } from "@/lib/config";
import { customers, products, type Customer } from "@/lib/sample-data";
import { formatMoney, formatQty, round } from "@/lib/utils";

const sections = [
  ["foundations", "Foundations"],
  ["buttons", "Buttons"],
  ["inputs", "Inputs"],
  ["numbers", "Weight & money"],
  ["choices", "Choices"],
  ["display", "Badges & cards"],
  ["table", "Data table"],
  ["overlays", "Overlays"],
  ["feedback", "Feedback"],
  ["navigation", "Navigation"],
  ["icons", "Icons"],
] as const;

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-10 first:border-0 first:pt-2">
      <h2 className="text-xl font-extrabold tracking-tight text-fg">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Demo({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold tracking-wider text-subtle uppercase">{title}</p>
      <div className={"rounded-lg border border-dashed border-line-strong bg-surface p-5 " + (className ?? "")}>{children}</div>
    </div>
  );
}

const swatches: [string, string][] = [
  ["bg", "--bg"],
  ["surface", "--surface"],
  ["surface-2", "--surface-2"],
  ["line", "--line"],
  ["line-strong", "--line-strong"],
  ["fg", "--fg"],
  ["muted", "--muted"],
  ["subtle", "--subtle"],
  ["primary", "--primary"],
  ["primary-soft", "--primary-soft"],
  ["success", "--success"],
  ["warning", "--warning"],
  ["danger", "--danger"],
  ["info", "--info"],
];

const brands = ["steel", "emerald", "maroon", "copper"] as const;
const brandHex: Record<(typeof brands)[number], string> = { steel: "#1f4f8a", emerald: "#0d7062", maroon: "#9b1c3b", copper: "#b4470f" };

export default function UiKitPage() {
  const toast = useToast();
  const [brand, setBrand] = useState<(typeof brands)[number]>(appConfig.brand);
  useEffect(() => {
    if (brand === "steel") delete document.documentElement.dataset.brand;
    else document.documentElement.dataset.brand = brand;
  }, [brand]);

  // form demo state
  const [name, setName] = useState("");
  const [cat, setCat] = useState("");
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(true);
  const [notify, setNotify] = useState(true);
  const [payment, setPayment] = useState<"cash" | "credit" | "bank">("cash");
  const [range, setRange] = useState<"day" | "week" | "month">("week");

  // sale-line demo
  const [itemId, setItemId] = useState<string | null>("gi-wire-12");
  const item = products.find((p) => p.id === itemId) ?? null;
  const [qty, setQty] = useState<number | null>(12.5);
  const [rate, setRate] = useState<number | null>(490);
  const [discount, setDiscount] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<string | null>("c2");
  const amount = round((qty ?? 0) * (rate ?? 0), 0);

  // overlays
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);

  // nav demo
  const [tab, setTab] = useState<"all" | "paid" | "due">("all");
  const [page, setPage] = useState(3);
  const [loading, setLoading] = useState(false);

  const custColumns: Column<Customer>[] = [
    { key: "name", header: "Customer", accessor: (c) => c.name, sortable: true, searchable: true,
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={c.name} size={28} />
          <span className="font-semibold">{c.name}</span>
        </div>
      ) },
    { key: "phone", header: "Phone", accessor: (c) => c.phone, searchable: true, hideOnMobile: true },
    { key: "balance", header: "Balance due", numeric: true, sortable: true, accessor: (c) => c.balance,
      cell: (c) => <span className={c.balance > 0 ? "font-semibold text-danger" : "text-muted"}>{formatMoney(c.balance)}</span>,
      footer: (rows) => formatMoney(rows.reduce((s, c) => s + c.balance, 0)) },
    { key: "status", header: "Status", accessor: (c) => (c.balance > 0 ? 1 : 0),
      cell: (c) => (c.balance > 0 ? <Badge tone="warning" dot size="sm">Due</Badge> : <Badge tone="success" dot size="sm">Clear</Badge>) },
  ];

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-extrabold text-primary-fg">UI</span>
          <p className="font-extrabold text-fg">Inventory UI Kit</p>
          <Badge size="sm" className="hidden sm:inline-flex">v1.0</Badge>
          <div className="ml-auto flex items-center gap-2">
            <SegmentedControl
              size="sm"
              aria-label="Brand preset"
              value={brand}
              onChange={setBrand}
              options={brands.map((b) => ({
                value: b,
                label: (
                  <span className="flex items-center gap-1.5 capitalize">
                    <span className="size-2.5 rounded-full" style={{ background: brandHex[b] }} />
                    <span className="hidden sm:inline">{b}</span>
                  </span>
                ),
              }))}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 sm:px-6">
        <nav className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-44 shrink-0 overflow-y-auto py-8 lg:block">
          <ul className="flex flex-col gap-0.5 text-sm">
            {sections.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-md px-2.5 py-1.5 font-medium text-muted hover:bg-surface-2 hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Divider className="my-4" />
          <a href="/inventory" className="flex items-center gap-1.5 px-2.5 text-sm font-semibold text-primary hover:underline">
            Example screen <Icon name="chevron-right" size={14} />
          </a>
        </nav>

        <main className="min-w-0 flex-1 py-8">
          <PageHeader
            title="Inventory UI Kit"
            description="Every building block for the stock & accounts system. Switch the brand preset and theme at the top — every component follows the tokens."
            className="mb-8"
          />

          {/* ------------------------------------------------ */}
          <Section id="foundations" title="Foundations" description="Colours, type and shape live as CSS variables in app/globals.css.">
            <Demo title="Colour tokens">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {swatches.map(([name, v]) => (
                  <div key={name}>
                    <div className="h-12 rounded-md border border-line" style={{ background: `var(${v})` }} />
                    <p className="mt-1.5 text-xs font-semibold text-fg">{name}</p>
                    <p className="font-mono text-[11px] text-subtle">{v}</p>
                  </div>
                ))}
              </div>
            </Demo>
            <div className="grid gap-6 md:grid-cols-2">
              <Demo title="Type — Manrope (UI) & IBM Plex Mono (figures)">
                <div className="flex flex-col gap-2">
                  <p className="text-2xl font-extrabold tracking-tight">Page title 24</p>
                  <p className="text-lg font-bold">Dialog title 18</p>
                  <p className="text-[15px] font-bold">Card title 15</p>
                  <p className="text-sm">Body text 14 — readable for long lists.</p>
                  <p className="text-xs text-muted">Hint / caption 12</p>
                  <p className="font-mono text-2xl font-semibold tabular-nums">Rs 1,245,800</p>
                  <p className="font-mono text-sm tabular-nums text-muted">612.50 kg × Rs 470 = Rs 287,875</p>
                </div>
              </Demo>
              <Demo title="Radius & elevation">
                <div className="flex flex-wrap gap-4">
                  {["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"].map((r) => (
                    <div key={r} className="text-center">
                      <div className={`size-16 border border-line-strong bg-surface-2 ${r}`} />
                      <p className="mt-1.5 font-mono text-[11px] text-muted">{r}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-4">
                  {["shadow-sm", "shadow-md", "shadow-lg"].map((s) => (
                    <div key={s} className={`flex h-14 w-24 items-center justify-center rounded-lg border border-line bg-surface ${s}`}>
                      <span className="font-mono text-[11px] text-muted">{s}</span>
                    </div>
                  ))}
                </div>
              </Demo>
            </div>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="buttons" title="Buttons" description="One primary action per screen. Use outline for secondary, ghost inside tables and toolbars, danger only for destructive actions.">
            <Demo title="Variants" className="flex flex-wrap items-center gap-3">
              <Button>Save bill</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Delete</Button>
              <Button variant="link">Link button</Button>
            </Demo>
            <Demo title="Sizes, icons & states" className="flex flex-wrap items-center gap-3">
              <Button size="sm" leftIcon="plus">Small</Button>
              <Button leftIcon="plus">Medium</Button>
              <Button size="lg" leftIcon="cart">Large</Button>
              <Button variant="outline" rightIcon="chevron-down">With menu</Button>
              <Button loading>Saving…</Button>
              <Button disabled>Disabled</Button>
              <IconButton icon="edit" label="Edit" variant="outline" />
              <IconButton icon="printer" label="Print" />
              <IconButton icon="trash" label="Delete" variant="danger" size="sm" />
            </Demo>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="inputs" title="Inputs" description="Wrap any control in <Field> for the label, hint and error — ids and aria wiring are automatic.">
            <Demo title="Text, select, textarea" className="grid gap-4 md:grid-cols-2">
              <Field label="Item name" required hint="As it should appear on bills">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. GI Wire No. 12" />
              </Field>
              <Field label="Category">
                <Select
                  value={cat}
                  onChange={(e) => setCat(e.target.value)}
                  placeholder="Choose a category"
                  options={["GI wire", "Binding wire", "Barbed wire", "Nails", "Tools"].map((c) => ({ value: c, label: c }))}
                />
              </Field>
              <Field label="Phone" error="Enter an 11-digit mobile number">
                <Input icon="users" defaultValue="0300 12" />
              </Field>
              <Field label="Bill date">
                <Input type="date" defaultValue="2026-11-10" />
              </Field>
              <Field label="Search" className="md:col-span-1">
                <Input icon="search" type="search" placeholder="Search items…" />
              </Field>
              <Field label="Disabled">
                <Input disabled defaultValue="Read only value" />
              </Field>
              <Field label="Note" className="md:col-span-2">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery instructions, cheque number…" />
              </Field>
            </Demo>
            <Demo title="Searchable select — for items, customers and suppliers" className="grid gap-4 md:grid-cols-2">
              <Field label="Customer">
                <SearchSelect
                  value={customerId}
                  onChange={setCustomerId}
                  clearable
                  placeholder="Choose customer"
                  searchPlaceholder="Name or phone…"
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                    description: c.phone,
                    meta: c.balance ? formatMoney(c.balance) : undefined,
                  }))}
                  footer={
                    <button type="button" className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold text-primary hover:bg-surface-2">
                      <Icon name="plus" size={15} /> Add new customer
                    </button>
                  }
                />
              </Field>
              <Field label="Size">
                <Select size="sm" options={[{ value: "a", label: "Small control (32px)" }]} />
              </Field>
            </Demo>
          </Section>

          {/* ------------------------------------------------ */}
          <Section
            id="numbers"
            title="Weight & money"
            description="NumberInput accepts only valid digits, formats with commas when you leave the field and gives you a real number. Arrow keys step the value."
          >
            <Demo title="Sale line — weight × rate" className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
                <Field label="Item">
                  <SearchSelect
                    value={itemId}
                    onChange={(v) => {
                      setItemId(v);
                      const p = products.find((x) => x.id === v);
                      if (p) setRate(p.rate);
                    }}
                    options={products.map((p) => ({
                      value: p.id,
                      label: p.name,
                      description: `Stock: ${formatQty(p.stock, p.sellBy)}`,
                      meta: formatMoney(p.rate),
                      disabled: p.stock <= 0,
                    }))}
                  />
                </Field>
                <Field label={item?.sellBy === "unit" ? "Quantity" : "Weight"}>
                  {item?.sellBy === "unit" ? (
                    <NumberInput value={qty} onValueChange={setQty} trailing={appConfig.pieceUnit} min={0} stepper />
                  ) : (
                    <WeightInput value={qty} onValueChange={setQty} max={item?.stock} />
                  )}
                </Field>
                <Field label={`Rate / ${item?.sellBy === "unit" ? appConfig.pieceUnit : appConfig.weightUnit}`}>
                  <MoneyInput value={rate} onValueChange={setRate} />
                </Field>
                <Field label="Discount">
                  <MoneyInput value={discount} onValueChange={setDiscount} />
                </Field>
              </div>
              <div className="ml-auto w-full max-w-xs rounded-lg border border-line bg-surface-2/60 px-4 py-1">
                <DescriptionList
                  items={[
                    { label: "Amount", value: formatMoney(amount) },
                    { label: "Discount", value: formatMoney(-(discount ?? 0)) },
                    { label: "Total", value: formatMoney(amount - (discount ?? 0)), emphasis: true },
                  ]}
                />
              </div>
            </Demo>
            <Demo title="Presets" className="grid gap-4 sm:grid-cols-3">
              <Field label="WeightInput" hint={`${appConfig.weightDecimals} decimals, ${appConfig.weightUnit}`}>
                <WeightInput value={1250.5} onValueChange={() => {}} />
              </Field>
              <Field label="MoneyInput" hint={`Whole ${appConfig.currency}`}>
                <MoneyInput value={287875} onValueChange={() => {}} />
              </Field>
              <Field label="With stepper">
                <NumberInput value={4} onValueChange={() => {}} stepper min={0} trailing="pcs" />
              </Field>
            </Demo>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="choices" title="Choices">
            <div className="grid gap-6 md:grid-cols-2">
              <Demo title="Checkbox & switch" className="flex flex-col gap-4">
                <Checkbox label="Print receipt after saving" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                <Checkbox label="Partially selected" indeterminate readOnly />
                <Checkbox label="Disabled option" disabled />
                <Switch
                  checked={notify}
                  onCheckedChange={setNotify}
                  label="Low-stock alerts"
                  description="Notify when an item drops below its re-order level"
                />
              </Demo>
              <Demo title="Radio group & segmented control" className="flex flex-col gap-5">
                <RadioGroup
                  name="payment"
                  value={payment}
                  onChange={setPayment}
                  variant="card"
                  options={[
                    { value: "cash", label: "Cash", description: "Paid in full now" },
                    { value: "credit", label: "Credit (udhaar)", description: "Added to customer balance" },
                    { value: "bank", label: "Bank transfer", description: "Record reference no." },
                  ]}
                />
                <SegmentedControl
                  value={range}
                  onChange={setRange}
                  aria-label="Report range"
                  options={[
                    { value: "day", label: "Today" },
                    { value: "week", label: "This week" },
                    { value: "month", label: "This month" },
                  ]}
                />
              </Demo>
            </div>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="display" title="Badges & cards">
            <Demo title="Badges" className="flex flex-wrap items-center gap-2">
              <Badge>Draft</Badge>
              <Badge tone="primary">Per kg</Badge>
              <Badge tone="success" dot>Paid</Badge>
              <Badge tone="warning" dot>Partially paid</Badge>
              <Badge tone="danger" dot>Overdue</Badge>
              <Badge tone="info" icon="truck">In transit</Badge>
              <span className="mx-2 h-5 w-px bg-line" />
              <StockBadge qty={500} reorderLevel={50} />
              <StockBadge qty={30} reorderLevel={50} />
              <StockBadge qty={0} reorderLevel={50} />
            </Demo>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Today's sales" value={formatMoney(186450)} icon="receipt" change={{ value: "12%", direction: "up" }} hint="vs yesterday" />
              <StatCard label="Cash in hand" value={formatMoney(74200)} icon="wallet" tone="success" />
              <StatCard label="Receivable" value={formatMoney(395900)} icon="users" tone="warning" change={{ value: "3.1%", direction: "up", good: false }} />
              <StatCard label="Wire sold" value="2,418 kg" icon="scale" tone="info" hint="this week" />
            </div>
            <Card className="max-w-md">
              <CardHeader
                title="Bill #1042"
                description="Ahmed Builders · 10 Nov 2026"
                actions={<Badge tone="warning" dot>Credit</Badge>}
              />
              <CardBody>
                <DescriptionList
                  items={[
                    { label: "GI Wire No. 12 — 12.50 kg × 490", value: formatMoney(6125) },
                    { label: "Binding Wire No. 20 — 40.00 kg × 455", value: formatMoney(18200) },
                    { label: "Wire Nails 3\" — 2 × 720", value: formatMoney(1440) },
                    { label: "Total", value: formatMoney(25765), emphasis: true },
                  ]}
                />
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm" leftIcon="printer">Print</Button>
                <Button size="sm" leftIcon="wallet">Receive payment</Button>
              </CardFooter>
            </Card>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="table" title="Data table" description="Search, sort, select, paginate, row actions and a totals footer. Numeric columns align right in monospaced digits.">
            <div className="flex items-center gap-3">
              <Switch checked={loading} onCheckedChange={setLoading} label="Show loading state" />
            </div>
            <DataTable
              data={customers}
              columns={custColumns}
              getRowId={(c) => c.id}
              selectable
              loading={loading}
              searchPlaceholder="Search customers"
              pageSize={4}
              toolbar={<Button size="sm" leftIcon="plus">Add customer</Button>}
              bulkActions={(ids, clear) => (
                <Button size="sm" variant="outline" leftIcon="download" onClick={() => { toast({ title: `Exported ${ids.length} customers` }); clear(); }}>
                  Export
                </Button>
              )}
              rowActions={(c) => (
                <DropdownMenu
                  trigger={(t) => <IconButton icon="more" label={`Actions for ${c.name}`} size="sm" {...t} />}
                  items={[
                    { label: "View ledger", icon: "eye", onSelect: () => {} },
                    { label: "Receive payment", icon: "wallet", onSelect: () => toast({ title: "Payment form would open" }) },
                    { type: "divider" },
                    { label: "Delete", icon: "trash", danger: true, onSelect: () => setConfirm(true) },
                  ]}
                />
              )}
            />
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="overlays" title="Overlays" description="Modal for short tasks, Drawer for add/edit forms, ConfirmDialog before deleting. All close with Esc and keep focus inside.">
            <Demo title="Open one" className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => setModal(true)}>Open modal</Button>
              <Button variant="outline" onClick={() => setDrawer(true)}>Open drawer</Button>
              <Button variant="danger" onClick={() => setConfirm(true)}>Delete…</Button>
              <DropdownMenu
                align="start"
                trigger={(t) => <Button variant="outline" rightIcon="chevron-down" {...t}>Dropdown</Button>}
                items={[
                  { type: "label", label: "Export as" },
                  { label: "PDF", icon: "download", onSelect: () => toast({ title: "PDF exported" }) },
                  { label: "Excel", icon: "download", onSelect: () => toast({ title: "Excel exported" }) },
                  { type: "divider" },
                  { label: "Print", icon: "printer", shortcut: "Ctrl P", onSelect: () => {} },
                ]}
              />
              <Tooltip content="Tooltips show on hover and keyboard focus">
                <Button variant="ghost" leftIcon="info">Hover me</Button>
              </Tooltip>
            </Demo>
            <Demo title="Toasts" className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => toast({ title: "Bill saved", description: "Bill #1043 for Rs 25,765" })}>Success</Button>
              <Button variant="outline" onClick={() => toast({ title: "Stock running low", description: "GI Wire No. 12 is below 50 kg", tone: "warning" })}>Warning</Button>
              <Button variant="outline" onClick={() => toast({ title: "Could not save", description: "Check your connection and try again", tone: "danger" })}>Error</Button>
              <Button
                variant="outline"
                onClick={() => toast({ title: "Item deleted", tone: "info", action: { label: "Undo", onClick: () => toast({ title: "Restored" }) } })}
              >
                With undo
              </Button>
            </Demo>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="feedback" title="Feedback">
            <div className="grid gap-3 md:grid-cols-2">
              <Alert tone="info" title="Rates updated">New wire rates apply to bills created from today.</Alert>
              <Alert tone="success" title="Backup complete">Your data was backed up at 9:00 AM.</Alert>
              <Alert tone="warning" title="4 items are low on stock" action={<Button size="sm" variant="outline">View items</Button>}>
                Create a purchase order before they run out.
              </Alert>
              <Alert tone="danger" title="Payment failed" onClose={() => {}}>
                The bank reference could not be verified.
              </Alert>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Demo title="Empty state">
                <EmptyState
                  icon="box"
                  title="No items yet"
                  description="Add your first item to start tracking stock."
                  action={<Button leftIcon="plus">Add item</Button>}
                  className="py-6"
                />
              </Demo>
              <Demo title="Loading" className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-muted">
                  <Spinner /> Loading items…
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="flex items-center gap-2 text-sm text-muted">
                  Shortcut: <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>
                </div>
              </Demo>
            </div>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="navigation" title="Navigation" description="AppShell (sidebar + top bar) wraps every screen — see the example Inventory page.">
            <Demo title="Tabs" className="flex flex-col gap-4">
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: "all", label: "All bills", count: 128 },
                  { value: "paid", label: "Paid", count: 96 },
                  { value: "due", label: "Due", count: 32 },
                ]}
              />
            </Demo>
            <Demo title="Pagination & breadcrumbs" className="flex flex-col gap-5">
              <Pagination page={page} pageCount={12} onPageChange={setPage} total={115} pageSize={10} />
              <Breadcrumbs items={[{ label: "Home", href: "#" }, { label: "Customers", href: "#" }, { label: "Ahmed Builders" }]} />
            </Demo>
          </Section>

          {/* ------------------------------------------------ */}
          <Section id="icons" title="Icons" description={`${iconNames.length} built-in stroke icons — <Icon name="box" />. No icon package needed.`}>
            <Demo title="Icon set" className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
              {iconNames.map((n) => (
                <div key={n} className="flex flex-col items-center gap-1.5 rounded-md p-2 text-fg hover:bg-surface-2">
                  <Icon name={n} size={20} />
                  <span className="text-center font-mono text-[10px] text-muted">{n}</span>
                </div>
              ))}
            </Demo>
          </Section>
        </main>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Receive payment"
        description="Ahmed Builders · balance due Rs 145,000"
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={() => { setModal(false); toast({ title: "Payment recorded" }); }}>Save payment</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Amount" required>
            <MoneyInput value={50000} onValueChange={() => {}} />
          </Field>
          <Field label="Method">
            <Select options={[{ value: "cash", label: "Cash" }, { value: "bank", label: "Bank transfer" }, { value: "cheque", label: "Cheque" }]} />
          </Field>
          <Field label="Note" className="sm:col-span-2">
            <Textarea placeholder="Optional" rows={2} />
          </Field>
        </div>
      </Modal>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Add supplier"
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawer(false)}>Cancel</Button>
            <Button onClick={() => { setDrawer(false); toast({ title: "Supplier added" }); }}>Add supplier</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Business name" required>
            <Input placeholder="e.g. Punjab Steel Mills" />
          </Field>
          <Field label="Contact person">
            <Input />
          </Field>
          <Field label="Phone">
            <Input inputMode="tel" placeholder="03xx xxxxxxx" />
          </Field>
          <Field label="Opening balance" hint="Amount you already owe this supplier">
            <MoneyInput value={null} onValueChange={() => {}} />
          </Field>
        </div>
      </Drawer>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 600));
          toast({ title: "Deleted", tone: "danger" });
        }}
        danger
        title="Delete this customer?"
        description="Their bills stay in reports, but you won't be able to add new sales for them."
        confirmLabel="Delete customer"
      />
    </div>
  );
}
