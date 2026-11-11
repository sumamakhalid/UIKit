import { businessTypes } from "./catalog";
import type { Tenant } from "./types";
import { products as wireProducts, type Product } from "@/lib/sample-data";

/** Sample stock for each business type so every demo tenant has something to show. */
const names: Partial<Record<Tenant["type"], Record<string, [string, number, "weight" | "unit"][]>>> = {
  grocery: {
    "Flour & rice": [["Chakki Atta", 120, "weight"], ["Basmati Rice", 380, "weight"], ["Sella Rice", 320, "weight"]],
    Pulses: [["Daal Masoor", 290, "weight"], ["Daal Chana", 260, "weight"], ["Kala Chana", 240, "weight"]],
    Spices: [["Red Chilli Powder", 900, "weight"], ["Haldi", 700, "weight"], ["Garam Masala 50g", 140, "unit"]],
    "Oil & ghee": [["Cooking Oil 5L", 2650, "unit"], ["Banaspati Ghee 1kg", 560, "unit"]],
    Beverages: [["Tea 950g", 1650, "unit"], ["Cola 1.5L", 190, "unit"]],
  },
  pharmacy: {
    Tablets: [["Panadol 500mg (strip)", 35, "unit"], ["Brufen 400mg (strip)", 60, "unit"], ["Augmentin 625 (pack)", 720, "unit"]],
    Syrups: [["Cough Syrup 120ml", 210, "unit"], ["ORS sachet", 25, "unit"]],
    Injections: [["Insulin pen", 1850, "unit"]],
    Surgical: [["Surgical mask (box)", 450, "unit"], ["Bandage roll", 60, "unit"]],
    "Baby care": [["Baby wipes 72", 380, "unit"], ["Diapers M (pack)", 1950, "unit"]],
  },
  clothing: {
    Men: [["Shalwar Kameez — White", 3200, "unit"], ["Kurta — Navy", 2400, "unit"]],
    Women: [["Lawn 3-piece", 4800, "unit"], ["Embroidered Shirt", 3600, "unit"]],
    Kids: [["Kids Kurta", 1200, "unit"]],
    Unstitched: [["Wash & Wear (per m)", 650, "unit"]],
    Accessories: [["Dupatta — Chiffon", 900, "unit"]],
  },
  electronics: {
    Mobiles: [["Galaxy A-series", 64000, "unit"], ["Redmi Note", 52000, "unit"]],
    Accessories: [["Fast charger 25W", 1800, "unit"], ["Earbuds", 3500, "unit"], ["Power bank 10k", 4200, "unit"]],
    Appliances: [["Air fryer 4L", 18500, "unit"]],
    Repairs: [["Screen guard", 400, "unit"]],
  },
  general: {
    General: [["Soap bar", 150, "unit"], ["Detergent 1kg", 520, "unit"], ["Matchbox (pack)", 60, "unit"], ["Biscuits", 50, "unit"]],
  },
};

export function productsFor(t: Tenant): Product[] {
  if (t.type === "hardware") return wireProducts;
  const map = names[t.type] ?? {};
  let i = 0;
  return Object.entries(map).flatMap(([category, list]) =>
    list.map(([name, rate, sellBy]) => {
      i++;
      const stock = sellBy === "weight" ? [180, 42.5, 0, 260, 95][i % 5]! : [48, 6, 0, 120, 22][i % 5]!;
      return {
        id: `${t.slug}-${i}`,
        sku: `${category.slice(0, 2).toUpperCase()}-${String(i).padStart(3, "0")}`,
        name,
        category,
        sellBy,
        rate,
        cost: Math.round(rate * 0.85),
        stock,
        reorderLevel: sellBy === "weight" ? 50 : 10,
        updatedAt: "2026-11-09",
      };
    }),
  );
}

export function categoriesFor(t: Tenant) {
  return businessTypes[t.type].categories;
}
