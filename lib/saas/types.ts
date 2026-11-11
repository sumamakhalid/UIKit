/** Data model for the multi-tenant platform. Mirrors the tables a real backend would have. */

export type BusinessType = "hardware" | "grocery" | "pharmacy" | "clothing" | "electronics" | "general";
export type Accent = "lime" | "mint" | "sky" | "peach" | "lilac";

export type FeatureKey =
  | "sellByWeight"
  | "creditCustomers"
  | "purchases"
  | "reports"
  | "multiBranch"
  | "batchExpiry"
  | "variants"
  | "serials"
  | "apiAccess"
  | "prioritySupport";

export interface PlanLimits {
  /** Staff accounts including the owner */
  users: number;
  /** Items in inventory */
  items: number;
  /** Bills per month */
  bills: number;
  branches: number;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  /** Monthly price in Rs */
  priceMonthly: number;
  /** Yearly price in Rs (usually ~2 months free) */
  priceYearly: number;
  limits: PlanLimits;
  features: FeatureKey[];
  /** Shown as "Most popular" */
  highlight?: boolean;
  archived?: boolean;
}

export type TenantStatus = "trial" | "active" | "past_due" | "suspended";
export type BillingCycle = "monthly" | "yearly";

export interface TenantSettings {
  currency: string;
  weightUnit: string;
  weightDecimals: number;
  pieceUnit: string;
  phone: string;
  address: string;
  city: string;
  /** Features the tenant switched on (only those their plan allows take effect) */
  enabled: FeatureKey[];
}

export interface Tenant {
  id: string;
  /** Used in the subdomain: khalid-wire.yourapp.com */
  slug: string;
  name: string;
  shortName: string;
  type: BusinessType;
  accent: Accent;
  ownerName: string;
  ownerEmail: string;
  planId: string;
  cycle: BillingCycle;
  status: TenantStatus;
  createdAt: string; // ISO date
  trialEndsAt?: string;
  usage: { users: number; items: number; billsThisMonth: number; branches: number };
  settings: TenantSettings;
}

export type MemberRole = "owner" | "manager" | "cashier" | "viewer";

export interface Member {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: MemberRole;
  status: "active" | "invited";
  lastActive?: string;
}

export type InvoiceStatus = "paid" | "due" | "overdue" | "void";

export interface Invoice {
  id: string;
  number: string;
  tenantId: string;
  planId: string;
  amount: number;
  issuedAt: string;
  dueAt: string;
  status: InvoiceStatus;
  paidAt?: string;
}

export type AuditKind = "tenant" | "billing" | "plan" | "support" | "user" | "settings";

export interface AuditEvent {
  id: string;
  at: string; // ISO datetime
  actor: string;
  kind: AuditKind;
  action: string;
  /** Tenant it concerns, if any */
  tenantId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning";
  /** "all" or a plan id */
  audience: string;
  createdAt: string;
  active: boolean;
}

export type Session =
  | { kind: "guest" }
  | { kind: "super"; name: string; email: string; impersonating?: string /* tenant slug */ }
  | { kind: "tenant"; tenantSlug: string; memberId: string; name: string; role: MemberRole };

export interface SaasState {
  version: number;
  plans: Plan[];
  tenants: Tenant[];
  members: Member[];
  invoices: Invoice[];
  audit: AuditEvent[];
  announcements: Announcement[];
  session: Session;
}
