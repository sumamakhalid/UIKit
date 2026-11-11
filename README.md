# StockDesk — multi-tenant inventory SaaS (Next.js + Tailwind v4)

A SaaS front end with two panels, built on the Inventory UI Kit:

| Who | Where | What they can do |
| --- | --- | --- |
| **Super admin** (you) | `/admin` or `admin.yourapp.com` | Platform dashboard (MRR, trials, past due), tenants list, 3-step onboarding wizard, tenant detail, suspend / reactivate, change plan, extend trial, plans & limits editor, invoices & subscriptions, **log in as a business** (impersonation, logged), announcements, audit log |
| **Tenant admin** (shop owner / staff) | `/t/<slug>` or `<slug>.yourapp.com` | Dashboard, inventory (plan item limit), team & roles (seat limit), plan & billing (upgrade, pay invoice), settings (profile, brand colour, units, features), trial / overdue / suspended screens |

Landing page with pricing at `/`, demo sign-in at `/login`.

**Demo data only.** Everything lives in the browser (`lib/saas/store.tsx`): data in localStorage, the session in a cookie.
Each action in the store is where an API call goes when you add the backend — the types in `lib/saas/types.ts` are the tables.

### Subdomains

`middleware.ts` rewrites `admin.<root>` → `/admin` and `<slug>.<root>` → `/t/<slug>`. Turn it on with an env variable:

```
NEXT_PUBLIC_ROOT_DOMAIN=yourapp.com
```

Without it (and on `*.netlify.app`) the path URLs work. Locally you can test with `NEXT_PUBLIC_ROOT_DOMAIN=localhost`
and open `http://khalid-wire.localhost:3000`. On Netlify, wildcard subdomains need a custom domain, a paid plan and a
request to Netlify support; until then use the `/t/<slug>` links.

| Folder | What |
| --- | --- |
| `app/admin/*` | Super admin pages |
| `app/t/[tenant]/*` | Tenant pages |
| `components/saas/*` | Admin & tenant frames, banners, plan cards, upgrade modal |
| `components/tenant/*` | Tenant screens (dashboard, inventory, team, billing, settings) |
| `components/admin/*` | Onboarding wizard, shared admin bits |
| `lib/saas/*` | Types, seed data, business templates, store, URL helpers |

---


**Look: "Lime"** — soft grey canvas, white rounded cards, black pill actions and one bright accent
(lime by default) for whatever is active. Big light numbers, rounded bar and dot charts, an icon rail menu.

Reusable components for the stock, sales & accounts web system. No UI library to install —
the kit *is* the library, living in `components/ui/`. Only dependencies: Next.js, React, Tailwind.

## Run it

```bash
npm install
npm run dev
```

- http://localhost:3000/ — landing page → open super admin or any demo shop
- http://localhost:3000/ui-kit — every component with live examples (switch accent + dark mode at the top)
- http://localhost:3000/t/khalid-wire — a shop panel (dashboard, inventory, team, billing, settings)

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

`components/saas/tenant-frame.tsx` and `admin-frame.tsx` are the shells every screen uses.

## Give it to a new business

1. `lib/config.ts` — business name, currency, weight unit, decimals, brand preset.
2. `app/globals.css` — pick an accent preset (`lime`, `mint`, `sky`, `peach`, `lilac`) in `lib/config.ts`,
   or add a new `[data-brand="…"]` block with the client's colour. Every component follows the tokens.
3. The menus live in `components/saas/tenant-frame.tsx` and `admin-frame.tsx`.

`lib/sample-data.ts` is demo data only — replace it with your API (Laravel / NestJS).
