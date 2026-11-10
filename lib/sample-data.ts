/** Demo data only — replace with your API. */

export type SellBy = "weight" | "unit";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  sellBy: SellBy;
  /** Sale rate per kg or per piece */
  rate: number;
  /** Purchase cost per kg or per piece */
  cost: number;
  stock: number;
  reorderLevel: number;
  updatedAt: string;
}

const wire = (no: number, type: string, cat: string, rate: number, stock: number, reorder = 50): Product => ({
  id: `${type}-${no}`.toLowerCase().replace(/\s+/g, "-"),
  sku: `${type.slice(0, 2).toUpperCase()}-${String(no).padStart(2, "0")}`,
  name: `${type} No. ${no}`,
  category: cat,
  sellBy: "weight",
  rate,
  cost: Math.round(rate * 0.88),
  stock,
  reorderLevel: reorder,
  updatedAt: "2026-11-09",
});

export const products: Product[] = [
  wire(8, "GI Wire", "GI wire", 470, 612.5),
  wire(10, "GI Wire", "GI wire", 480, 318.25),
  wire(12, "GI Wire", "GI wire", 490, 42.75),
  wire(14, "GI Wire", "GI wire", 505, 0),
  wire(16, "GI Wire", "GI wire", 520, 205.0),
  wire(18, "GI Wire", "GI wire", 540, 88.4),
  wire(20, "Binding Wire", "Binding wire", 455, 1120.0, 200),
  wire(22, "Binding Wire", "Binding wire", 465, 164.6, 200),
  wire(10, "Barbed Wire", "Barbed wire", 395, 730.0, 150),
  wire(12, "Barbed Wire", "Barbed wire", 405, 0, 150),
  wire(6, "MS Wire", "MS wire", 300, 1540.8, 300),
  wire(8, "MS Wire", "MS wire", 310, 266.3, 300),
  {
    id: "nails-2in",
    sku: "NL-2IN",
    name: "Wire Nails 2\" (box)",
    category: "Nails",
    sellBy: "unit",
    rate: 650,
    cost: 560,
    stock: 84,
    reorderLevel: 20,
    updatedAt: "2026-11-08",
  },
  {
    id: "nails-3in",
    sku: "NL-3IN",
    name: "Wire Nails 3\" (box)",
    category: "Nails",
    sellBy: "unit",
    rate: 720,
    cost: 615,
    stock: 12,
    reorderLevel: 20,
    updatedAt: "2026-11-08",
  },
  {
    id: "chain-link",
    sku: "CL-50",
    name: "Chain Link Fence Roll 50ft",
    category: "Fencing",
    sellBy: "unit",
    rate: 8900,
    cost: 7800,
    stock: 26,
    reorderLevel: 5,
    updatedAt: "2026-11-07",
  },
  {
    id: "cutter",
    sku: "TL-CUT",
    name: "Wire Cutter 8\"",
    category: "Tools",
    sellBy: "unit",
    rate: 1150,
    cost: 900,
    stock: 0,
    reorderLevel: 4,
    updatedAt: "2026-11-02",
  },
];

export const categories = [...new Set(products.map((p) => p.category))];

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

export const customers: Customer[] = [
  { id: "c1", name: "Walk-in customer", phone: "—", balance: 0 },
  { id: "c2", name: "Ahmed Builders", phone: "0300 1234567", balance: 145000 },
  { id: "c3", name: "Rana Poultry Farm", phone: "0321 7654321", balance: 38500 },
  { id: "c4", name: "Bilal Fencing Works", phone: "0333 1122334", balance: 0 },
  { id: "c5", name: "Zahid Construction", phone: "0345 9988776", balance: 212400 },
];
