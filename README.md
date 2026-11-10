# Inventory UI Kit (Next.js + Tailwind v4)

Reusable components for the stock, sales & accounts web system. No UI library to install —
the kit *is* the library, living in `components/ui/`. Only dependencies: Next.js, React, Tailwind.

## Run it

```bash
npm install
npm run dev
```

- http://localhost:3000/ui-kit — every component with live examples (switch brand + dark mode at the top)
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
| `display.tsx` | Badge, StockBadge, Card (+Header/Body/Footer), StatCard, Alert, EmptyState, Avatar, Tooltip, Kbd, Divider, DescriptionList |
| `overlay.tsx` | Modal, ConfirmDialog, Drawer, DropdownMenu, ToastProvider / useToast |
| `navigation.tsx` | Tabs, Pagination, Breadcrumbs, PageHeader, ThemeToggle, AppShell |
| `data-table.tsx` | DataTable (search, sort, select, bulk actions, row actions, totals footer, pagination, loading) |
| `spinner.tsx` / `icon.tsx` | Spinner, Skeleton / Icon (50+ built-in icons) |

Helpers in `lib/utils.ts`: `formatMoney(12500)` → `Rs 12,500`, `formatWeight(12.5)` → `12.50 kg`,
`formatQty(qty, "weight" | "unit")`, `round()` for kg × rate maths.

## Give it to a new business

1. `lib/config.ts` — business name, currency, weight unit, decimals, brand preset.
2. `app/globals.css` — pick a brand preset (`steel`, `emerald`, `maroon`, `copper`) or add a new
   `[data-brand="…"]` block with the client's colour. Every component follows the tokens.
3. `lib/nav.ts` — the sidebar menu.

`lib/sample-data.ts` is demo data only — replace it with your API (Laravel / NestJS).
# UIKit
