import { businessTypes } from "./catalog";
import type { AuditEvent, BusinessType, Invoice, Member, Plan, SaasState, Tenant, TenantSettings } from "./types";

/** Demo data only — replace with your API. Dates are fixed so server and browser render the same. */

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For a single small shop",
    priceMonthly: 1500,
    priceYearly: 15000,
    limits: { users: 2, items: 300, bills: 1000, branches: 1 },
    features: ["sellByWeight", "creditCustomers"],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Most shops pick this",
    priceMonthly: 3500,
    priceYearly: 35000,
    limits: { users: 6, items: 3000, bills: 10000, branches: 1 },
    features: ["sellByWeight", "creditCustomers", "purchases", "reports", "batchExpiry", "variants", "serials"],
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Bigger shops and branches",
    priceMonthly: 7500,
    priceYearly: 75000,
    limits: { users: 25, items: 50000, bills: 100000, branches: 5 },
    features: [
      "sellByWeight",
      "creditCustomers",
      "purchases",
      "reports",
      "multiBranch",
      "batchExpiry",
      "variants",
      "serials",
      "apiAccess",
      "prioritySupport",
    ],
  },
];

function settings(type: BusinessType, city: string, extra: Partial<TenantSettings> = {}): TenantSettings {
  return {
    currency: "Rs",
    weightUnit: "kg",
    weightDecimals: 2,
    pieceUnit: "pcs",
    phone: "",
    address: "",
    city,
    enabled: [...businessTypes[type].features],
    ...businessTypes[type].defaults,
    ...extra,
  };
}

type Row = [slug: string, name: string, short: string, type: BusinessType, owner: string, plan: string, status: Tenant["status"], created: string, city: string, users: number, items: number, bills: number, accent: Tenant["accent"]];

const rows: Row[] = [
  ["khalid-wire", "Khalid Wire Store", "KWS", "hardware", "Sumama Khalid", "business", "active", "2026-03-04", "Lahore", 3, 16, 265, "lime"],
  ["al-madina-kiryana", "Al-Madina Kiryana", "AMK", "grocery", "Usman Tariq", "starter", "active", "2026-04-18", "Gujranwala", 2, 286, 940, "mint"],
  ["shifa-pharmacy", "Shifa Pharmacy", "SP", "pharmacy", "Dr. Hina Aslam", "pro", "active", "2026-02-11", "Faisalabad", 9, 4120, 6210, "sky"],
  ["zara-collection", "Zara Collection", "ZC", "clothing", "Ayesha Malik", "business", "past_due", "2026-05-27", "Lahore", 4, 1180, 1420, "peach"],
  ["smart-mobiles", "Smart Mobiles", "SM", "electronics", "Bilal Ahmed", "business", "trial", "2026-11-02", "Rawalpindi", 2, 140, 96, "lilac"],
  ["new-punjab-steel", "New Punjab Steel", "NPS", "hardware", "Rana Imran", "pro", "active", "2026-01-20", "Sialkot", 14, 820, 3890, "lime"],
  ["city-general-store", "City General Store", "CGS", "general", "Kamran Butt", "starter", "suspended", "2026-06-09", "Multan", 1, 120, 0, "mint"],
  ["fresh-mart", "Fresh Mart", "FM", "grocery", "Nadia Qureshi", "business", "trial", "2026-11-06", "Karachi", 3, 410, 210, "sky"],
  ["al-noor-hardware", "Al-Noor Hardware", "ANH", "hardware", "Faisal Noor", "starter", "active", "2026-08-15", "Gujrat", 2, 198, 610, "peach"],
  ["care-plus-pharmacy", "Care Plus Pharmacy", "CPP", "pharmacy", "Saad Javed", "business", "active", "2026-07-03", "Islamabad", 5, 2240, 2980, "lilac"],
];

export const tenants: Tenant[] = rows.map(([slug, name, shortName, type, ownerName, planId, status, createdAt, city, users, items, bills, accent], i) => ({
  id: `t${i + 1}`,
  slug,
  name,
  shortName,
  type,
  accent,
  ownerName,
  ownerEmail: `${ownerName.toLowerCase().replace(/^dr\. /, "").replace(/[^a-z]+/g, ".")}@example.com`,
  planId,
  cycle: i % 3 === 0 ? "yearly" : "monthly",
  status,
  createdAt,
  trialEndsAt: status === "trial" ? addDays(createdAt, 14) : undefined,
  usage: { users, items, billsThisMonth: bills, branches: 1 },
  settings: settings(type, city, slug === "khalid-wire" ? { phone: "0300 1234567", address: "Shop 12, Loha Market" } : {}),
}));

export function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const firstNames = ["Ali", "Sana", "Hamza", "Iqra", "Zain", "Maryam", "Owais", "Fatima", "Talha", "Rabia"];

export const members: Member[] = tenants.flatMap((t) =>
  Array.from({ length: t.usage.users }, (_, i): Member => {
    if (i === 0) return { id: `${t.id}-m0`, tenantId: t.id, name: t.ownerName, email: t.ownerEmail, role: "owner", status: "active", lastActive: "2026-11-10" };
    const name = `${firstNames[(i + t.id.length) % firstNames.length]} ${["Raza", "Khan", "Sheikh", "Mirza", "Chaudhry"][i % 5]}`;
    return {
      id: `${t.id}-m${i}`,
      tenantId: t.id,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      role: i === 1 ? "manager" : i % 3 === 0 ? "viewer" : "cashier",
      status: i === t.usage.users - 1 && i > 1 ? "invited" : "active",
      lastActive: i === t.usage.users - 1 && i > 1 ? undefined : "2026-11-09",
    };
  }),
);

const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];

export const invoices: Invoice[] = (() => {
  const out: Invoice[] = [];
  let n = 1001;
  for (const m of months) {
    for (const t of tenants) {
      if (t.createdAt.slice(0, 7) > m || t.status === "trial") continue;
      if (t.cycle === "yearly" && !m.endsWith("-" + t.createdAt.slice(5, 7)) && m !== "2026-11") continue;
      const plan = plans.find((p) => p.id === t.planId)!;
      const amount = t.cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
      const issuedAt = `${m}-01`;
      const last = m === "2026-11";
      let status: Invoice["status"] = "paid";
      if (last && t.status === "past_due") status = "overdue";
      else if (last && t.status === "suspended") status = "overdue";
      else if (last && (t.id === "t2" || t.id === "t9")) status = "due";
      if (m === "2026-10" && (t.status === "past_due" || t.status === "suspended")) status = "overdue";
      out.push({
        id: `inv${n}`,
        number: `INV-${n}`,
        tenantId: t.id,
        planId: t.planId,
        amount,
        issuedAt,
        dueAt: addDays(issuedAt, 7),
        status,
        paidAt: status === "paid" ? addDays(issuedAt, 3) : undefined,
      });
      n++;
    }
  }
  return out.reverse();
})();

export const audit: AuditEvent[] = [
  { id: "a1", at: "2026-11-10T16:42:00", actor: "Super admin", kind: "support", action: "Logged in as Khalid Wire Store", tenantId: "t1" },
  { id: "a2", at: "2026-11-10T14:05:00", actor: "System", kind: "billing", action: "Invoice INV-1047 marked overdue", tenantId: "t4" },
  { id: "a3", at: "2026-11-09T11:30:00", actor: "Nadia Qureshi", kind: "tenant", action: "Signed up — Fresh Mart (Business trial)", tenantId: "t8" },
  { id: "a4", at: "2026-11-08T18:12:00", actor: "Sumama Khalid", kind: "user", action: "Invited Iqra Sheikh as cashier", tenantId: "t1" },
  { id: "a5", at: "2026-11-07T09:50:00", actor: "Super admin", kind: "plan", action: "Changed Pro price to Rs 7,500" },
  { id: "a6", at: "2026-11-05T13:20:00", actor: "Super admin", kind: "tenant", action: "Suspended City General Store — unpaid for 60 days", tenantId: "t7" },
  { id: "a7", at: "2026-11-02T10:02:00", actor: "Bilal Ahmed", kind: "tenant", action: "Signed up — Smart Mobiles (Business trial)", tenantId: "t5" },
  { id: "a8", at: "2026-11-01T00:00:00", actor: "System", kind: "billing", action: "Issued 8 monthly invoices" },
  { id: "a9", at: "2026-10-28T15:44:00", actor: "Hina Aslam", kind: "settings", action: "Turned on batches & expiry", tenantId: "t3" },
  { id: "a10", at: "2026-10-20T12:10:00", actor: "Super admin", kind: "plan", action: "Moved Shifa Pharmacy to Pro", tenantId: "t3" },
];

export const seedState: SaasState = {
  version: 1,
  plans,
  tenants,
  members,
  invoices,
  audit,
  announcements: [
    {
      id: "n1",
      title: "New: print bills on 80mm thermal printers",
      body: "Go to Settings → Printing to pick your printer size.",
      tone: "info",
      audience: "all",
      createdAt: "2026-11-08",
      active: true,
    },
  ],
  session: { kind: "guest" },
};

/** Monthly recurring revenue history for the platform chart (Rs). Last value is computed live. */
export const mrrHistory = [
  { label: "Dec", value: 9500 },
  { label: "Jan", value: 11000 },
  { label: "Feb", value: 13500 },
  { label: "Mar", value: 15000 },
  { label: "Apr", value: 16500 },
  { label: "May", value: 18000 },
  { label: "Jun", value: 19000 },
  { label: "Jul", value: 20500 },
  { label: "Aug", value: 22000 },
  { label: "Sep", value: 23500 },
  { label: "Oct", value: 24500 },
];

export const signupsThisWeek = [
  { label: "M", value: 1 },
  { label: "T", value: 0 },
  { label: "W", value: 2 },
  { label: "T", value: 1 },
  { label: "F", value: 3 },
  { label: "S", value: 1 },
  { label: "S", value: 0 },
];
