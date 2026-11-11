import type { IconName } from "@/components/ui/icon";
import type { Accent, BusinessType, FeatureKey, MemberRole, TenantSettings } from "./types";

/** Business-type templates: what a new tenant starts with. Everything stays editable later. */
export const businessTypes: Record<
  BusinessType,
  { label: string; description: string; icon: IconName; categories: string[]; defaults: Partial<TenantSettings>; features: FeatureKey[] }
> = {
  hardware: {
    label: "Hardware / wire",
    description: "Sell by kg and by piece, rate lists, credit customers",
    icon: "scale",
    categories: ["GI wire", "Binding wire", "Barbed wire", "Nails", "Tools"],
    defaults: { weightUnit: "kg", weightDecimals: 2 },
    features: ["sellByWeight", "creditCustomers", "purchases"],
  },
  grocery: {
    label: "Grocery / kiryana",
    description: "Loose items by weight, packed items by piece, fast billing",
    icon: "cart",
    categories: ["Flour & rice", "Pulses", "Spices", "Oil & ghee", "Beverages"],
    defaults: { weightUnit: "kg", weightDecimals: 3 },
    features: ["sellByWeight", "creditCustomers", "purchases"],
  },
  pharmacy: {
    label: "Pharmacy",
    description: "Batches and expiry dates, strips and boxes",
    icon: "plus",
    categories: ["Tablets", "Syrups", "Injections", "Surgical", "Baby care"],
    defaults: { pieceUnit: "pcs" },
    features: ["batchExpiry", "purchases"],
  },
  clothing: {
    label: "Clothing",
    description: "Sizes and colours as variants, seasonal stock",
    icon: "tag",
    categories: ["Men", "Women", "Kids", "Unstitched", "Accessories"],
    defaults: { pieceUnit: "pcs" },
    features: ["variants", "purchases"],
  },
  electronics: {
    label: "Electronics",
    description: "Serial / IMEI numbers, warranty tracking",
    icon: "layers",
    categories: ["Mobiles", "Accessories", "Appliances", "Repairs"],
    defaults: { pieceUnit: "pcs" },
    features: ["serials", "purchases", "creditCustomers"],
  },
  general: {
    label: "General store",
    description: "A plain setup that fits any shop",
    icon: "box",
    categories: ["General"],
    defaults: {},
    features: ["purchases"],
  },
};

export const featureLabels: Record<FeatureKey, { label: string; description: string }> = {
  sellByWeight: { label: "Sell by weight", description: "kg × rate items with decimal quantities" },
  creditCustomers: { label: "Credit (udhaar) customers", description: "Customer balances and payment reminders" },
  purchases: { label: "Purchases & suppliers", description: "Stock in, supplier ledger" },
  reports: { label: "Reports", description: "Profit, stock valuation, day book" },
  multiBranch: { label: "Multiple branches", description: "Separate stock per branch, transfers" },
  batchExpiry: { label: "Batches & expiry", description: "Track batch numbers and expiry dates" },
  variants: { label: "Variants", description: "Sizes and colours per item" },
  serials: { label: "Serial numbers", description: "IMEI / serial per unit sold" },
  apiAccess: { label: "API access", description: "Connect other software" },
  prioritySupport: { label: "Priority support", description: "Phone and WhatsApp support" },
};

export const roleInfo: Record<MemberRole, { label: string; description: string; can: string[] }> = {
  owner: { label: "Owner", description: "Full access, billing and team", can: ["sell", "stock", "reports", "team", "billing", "settings"] },
  manager: { label: "Manager", description: "Runs the shop, no billing", can: ["sell", "stock", "reports", "team"] },
  cashier: { label: "Cashier", description: "Makes bills and receives payments", can: ["sell"] },
  viewer: { label: "Viewer", description: "Read-only access to stock and reports", can: ["reports"] },
};

export const permissionLabels: Record<string, string> = {
  sell: "Make bills",
  stock: "Edit stock & rates",
  reports: "See reports",
  team: "Manage team",
  billing: "Plan & billing",
  settings: "Business settings",
};

export const accents: { value: Accent; label: string; hex: string }[] = [
  { value: "lime", label: "Lime", hex: "#d4f15a" },
  { value: "mint", label: "Mint", hex: "#8ff0c8" },
  { value: "sky", label: "Sky", hex: "#a6d8ff" },
  { value: "peach", label: "Peach", hex: "#ffc59a" },
  { value: "lilac", label: "Lilac", hex: "#d6c6ff" },
];
