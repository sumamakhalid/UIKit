# Inventory UI Kit (Next.js + Tailwind v4)

**Look: "Lime"** — soft grey canvas, white rounded cards, black pill actions and one bright accent
(lime by default) for whatever is active. Big light numbers, rounded bar and dot charts, an icon rail menu.

Reusable components for the stock, sales & accounts web system. No UI library to install —
the kit *is* the library, living in `components/ui/`. Only dependencies: Next.js, React, Tailwind.

## Run it

```bash
npm install
npm run dev
```

- http://localhost:3000/ — the Dashboard (stock & sales overview) built with the kit
- http://localhost:3000/ui-kit — every component with live examples (switch accent + dark mode at the top)
- http://localhost:3000/inventory — a complete Inventory screen built with the kit (add/edit drawer, stock-in modal, delete confirm, toasts)

## Use it

```tsx
import { Button, DataTable, Field, WeightInput, MoneyInput, useToast } from "@/components/ui";
```

| File | Components |
| --- | --- |
| `button.tsx` | Button, IconButton |
| `input.tsx` | Field, Input, Textarea |
| `number-input.tsx` | NumberInput, WeightInput (kg), MoneyInput (Rs) |
| `select.tsx` | Select (native), SearchSelect (searchable) |
| `choice.tsx` | Checkbox, Switch, RadioGroup, SegmentedControl |
| `display.tsx` | Badge, Delta (↗ change chip), StockBadge, Card (+Header/Body/Footer), StatCard (white / accent / info / ink), Alert, EmptyState, Avatar, Tooltip, Kbd, Divider, DescriptionList |
| `overlay.tsx` | Modal, ConfirmDialog, Drawer, DropdownMenu, ToastProvider / useToast |
| `navigation.tsx` | Tabs (chips), Pagination, Breadcrumbs, PageHeader (two-tone title), ThemeToggle, WorkspacePill, DateChip, AppShell (icon rail + top bar) |
| `charts.tsx` | BarChart (pill bars + value bubble), DotChart (weekly dots), Meter, StepDots |
| `widgets.tsx` | PillButton, PillSelect, DateRangePicker, Checklist, ReminderCard, SectionLabel |
| `data-table.tsx` | DataTable (search, sort, select, bulk actions, row actions, totals footer, pagination, loading) |
| `spinner.tsx` / `icon.tsx` | Spinner, Skeleton / Icon (50+ built-in icons) |

Helpers in `lib/utils.ts`: `formatMoney(12500)` → `Rs 12,500`, `formatWeight(12.5)` → `12.50 kg`,
`formatQty(qty, "weight" | "unit")`, `formatCompact(1245800)` → `12.5L`, `round()` for kg × rate maths.

`components/app/app-frame.tsx` is the shell every screen uses (menu, quick actions, date chip).

## Give it to a new business

1. `lib/config.ts` — business name, currency, weight unit, decimals, brand preset.
2. `app/globals.css` — pick an accent preset (`lime`, `mint`, `sky`, `peach`, `lilac`) in `lib/config.ts`,
   or add a new `[data-brand="…"]` block with the client's colour. Every component follows the tokens.
3. `lib/nav.ts` — the sidebar menu.

`lib/sample-data.ts` is demo data only — replace it with your API (Laravel / NestJS).
