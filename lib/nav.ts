import type { NavSection } from "@/components/ui";

/** Sidebar menu for the whole app (rail icons on desktop, full list in the menu). */
export const nav: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: "asterisk" },
      { label: "Sales / POS", href: "/sales", icon: "cart" },
      { label: "Inventory", href: "/inventory", icon: "box", badge: 4 },
      { label: "Purchases", href: "/purchases", icon: "truck" },
    ],
  },
  {
    title: "Accounts",
    items: [
      { label: "Customers", href: "/customers", icon: "users" },
      { label: "Suppliers", href: "/suppliers", icon: "layers" },
      { label: "Ledger & payments", href: "/ledger", icon: "wallet" },
      { label: "Reports", href: "/reports", icon: "chart" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "UI kit", href: "/ui-kit", icon: "tag" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];
