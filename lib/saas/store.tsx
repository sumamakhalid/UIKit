"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { businessTypes } from "./catalog";
import { addDays, seedState } from "./seed";
import { ROOT_DOMAIN } from "./urls";
import type {
  Announcement,
  AuditEvent,
  AuditKind,
  BillingCycle,
  BusinessType,
  FeatureKey,
  Invoice,
  Member,
  MemberRole,
  Plan,
  SaasState,
  Session,
  Tenant,
  TenantSettings,
  TenantStatus,
} from "./types";

/*
 * Demo store. Everything lives in the browser:
 *   - data in localStorage (per origin)
 *   - the login session in a cookie shared across subdomains
 * In production replace each action with an API call — the shapes match what a backend returns.
 */

const DATA_KEY = "inventory-saas-demo";
const SESSION_COOKIE = "saas_session";
const VERSION = 1;

export const TODAY = "2026-11-11";

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString().slice(0, 19);

function readCookie(name: string) {
  try {
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]!) : null;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string) {
  try {
    const domain = ROOT_DOMAIN && window.location.hostname.endsWith(ROOT_DOMAIN) ? `; domain=.${ROOT_DOMAIN}` : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${domain}`;
  } catch {}
}

/* ------------------------------------------------------------------ */
/* Derived numbers                                                      */
/* ------------------------------------------------------------------ */

/** What a tenant pays per month (yearly ÷ 12). Trials and suspended tenants count as 0. */
export function monthlyValue(t: Tenant, plans: Plan[]) {
  if (t.status === "trial" || t.status === "suspended") return 0;
  const p = plans.find((x) => x.id === t.planId);
  if (!p) return 0;
  return t.cycle === "yearly" ? Math.round(p.priceYearly / 12) : p.priceMonthly;
}

/** Meter colour for usage vs a plan limit. Being exactly at a small limit (1 of 1 branch) is normal. */
export function usageTone(used: number, max: number): "ink" | "warning" | "danger" {
  if (used > max) return "danger";
  if (max > 2 && used / max >= 0.8) return "warning";
  return "ink";
}

export function daysLeft(dateIso: string | undefined) {
  if (!dateIso) return 0;
  return Math.max(0, Math.round((Date.parse(dateIso + "T00:00:00Z") - Date.parse(TODAY + "T00:00:00Z")) / 86400000));
}

/* ------------------------------------------------------------------ */
/* Context                                                              */
/* ------------------------------------------------------------------ */

export interface NewTenantInput {
  name: string;
  slug: string;
  type: BusinessType;
  ownerName: string;
  ownerEmail: string;
  planId: string;
  cycle: BillingCycle;
  trial: boolean;
  city: string;
}

interface SaasApi {
  state: SaasState;
  /** True once saved data has been read from the browser */
  ready: boolean;
  session: Session;
  actorName: string;

  // session
  signInSuper: () => void;
  signInTenant: (slug: string, memberId?: string) => void;
  signOut: () => void;
  impersonate: (slug: string) => void;
  stopImpersonating: () => void;

  // tenants
  createTenant: (input: NewTenantInput) => Tenant;
  updateTenant: (id: string, patch: Partial<Omit<Tenant, "settings">> & { settings?: Partial<TenantSettings> }, note?: string) => void;
  setTenantStatus: (id: string, status: TenantStatus, reason?: string) => void;
  changePlan: (id: string, planId: string, cycle?: BillingCycle) => void;
  extendTrial: (id: string, days: number) => void;

  // plans
  savePlan: (plan: Plan) => void;
  archivePlan: (id: string, archived: boolean) => void;

  // billing
  markInvoicePaid: (id: string) => void;
  sendReminder: (id: string) => void;

  // members
  inviteMember: (tenantId: string, name: string, email: string, role: MemberRole) => void;
  setMemberRole: (id: string, role: MemberRole) => void;
  removeMember: (id: string) => void;

  // support
  saveAnnouncement: (a: Omit<Announcement, "id" | "createdAt"> & { id?: string }) => void;
  log: (kind: AuditKind, action: string, tenantId?: string) => void;
  resetDemo: () => void;
}

const Ctx = createContext<SaasApi | null>(null);

export function SaasProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SaasState>(seedState);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load saved demo data + session once in the browser.
  useEffect(() => {
    let next = seedState;
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SaasState;
        if (parsed.version === VERSION) next = parsed;
      }
    } catch {}
    const rawSession = readCookie(SESSION_COOKIE);
    let session: Session = { kind: "guest" };
    try {
      if (rawSession) session = JSON.parse(rawSession) as Session;
    } catch {}
    setState({ ...next, session });
    setReady(true);
  }, []);

  // Save on every change after load.
  useEffect(() => {
    if (!ready) return;
    try {
      const { session, ...data } = state;
      localStorage.setItem(DATA_KEY, JSON.stringify({ ...data, session: { kind: "guest" } }));
      writeCookie(SESSION_COOKIE, JSON.stringify(session));
    } catch {}
  }, [state, ready]);

  const session = state.session;
  const actorName = session.kind === "super" ? "Super admin" : session.kind === "tenant" ? session.name : "Guest";

  const update = useCallback((fn: (s: SaasState) => SaasState) => setState((s) => fn(s)), []);

  const withLog = (s: SaasState, kind: AuditKind, action: string, tenantId?: string, actor?: string): SaasState => {
    const a = actor ?? (s.session.kind === "super" ? "Super admin" : s.session.kind === "tenant" ? s.session.name : "System");
    const ev: AuditEvent = { id: uid("a"), at: nowIso(), actor: a, kind, action, tenantId };
    return { ...s, audit: [ev, ...s.audit].slice(0, 500) };
  };

  const tenantName = (s: SaasState, id: string) => s.tenants.find((t) => t.id === id)?.name ?? "tenant";

  const api = useMemo<SaasApi>(
    () => ({
      state,
      ready,
      session,
      actorName,

      signInSuper: () => update((s) => ({ ...s, session: { kind: "super", name: "Platform owner", email: "owner@yourapp.com" } })),
      signInTenant: (slug, memberId) =>
        update((s) => {
          const t = s.tenants.find((x) => x.slug === slug);
          if (!t) return s;
          const m = s.members.find((x) => (memberId ? x.id === memberId : x.tenantId === t.id && x.role === "owner"));
          if (!m) return s;
          return { ...s, session: { kind: "tenant", tenantSlug: slug, memberId: m.id, name: m.name, role: m.role } };
        }),
      signOut: () => update((s) => ({ ...s, session: { kind: "guest" } })),
      impersonate: (slug) =>
        update((s) => {
          if (s.session.kind !== "super") return s;
          const t = s.tenants.find((x) => x.slug === slug);
          return withLog({ ...s, session: { ...s.session, impersonating: slug } }, "support", `Logged in as ${t?.name ?? slug}`, t?.id);
        }),
      stopImpersonating: () =>
        update((s) => (s.session.kind === "super" ? { ...s, session: { ...s.session, impersonating: undefined } } : s)),

      createTenant: (input) => {
        const plan = stateRef.current.plans.find((p) => p.id === input.planId)!;
        const tpl = businessTypes[input.type];
        const id = uid("t");
        const t: Tenant = {
          id,
          slug: input.slug,
          name: input.name.trim(),
          shortName: input.name
            .split(/\s+/)
            .map((w) => w[0])
            .join("")
            .slice(0, 3)
            .toUpperCase(),
          type: input.type,
          accent: "lime",
          ownerName: input.ownerName.trim(),
          ownerEmail: input.ownerEmail.trim(),
          planId: plan.id,
          cycle: input.cycle,
          status: input.trial ? "trial" : "active",
          createdAt: TODAY,
          trialEndsAt: input.trial ? addDays(TODAY, 14) : undefined,
          usage: { users: 1, items: 0, billsThisMonth: 0, branches: 1 },
          settings: {
            currency: "Rs",
            weightUnit: "kg",
            weightDecimals: 2,
            pieceUnit: "pcs",
            phone: "",
            address: "",
            city: input.city,
            enabled: [...tpl.features],
            ...tpl.defaults,
          },
        };
        const owner: Member = { id: `${id}-m0`, tenantId: id, name: t.ownerName, email: t.ownerEmail, role: "owner", status: "invited" };
        update((s) => {
          let n: SaasState = { ...s, tenants: [t, ...s.tenants], members: [owner, ...s.members] };
          if (!input.trial) {
            const inv: Invoice = {
              id: uid("inv"),
              number: `INV-${1000 + s.invoices.length + 1}`,
              tenantId: id,
              planId: plan.id,
              amount: input.cycle === "yearly" ? plan.priceYearly : plan.priceMonthly,
              issuedAt: TODAY,
              dueAt: addDays(TODAY, 7),
              status: "due",
            };
            n = { ...n, invoices: [inv, ...n.invoices] };
          }
          return withLog(n, "tenant", `Created ${t.name} on ${plan.name}${input.trial ? " (14-day trial)" : ""}`, id);
        });
        return t;
      },

      updateTenant: (id, patch, note) =>
        update((s) =>
          withLog(
            {
              ...s,
              tenants: s.tenants.map((t) =>
                t.id === id ? { ...t, ...patch, settings: patch.settings ? { ...t.settings, ...patch.settings } : t.settings } : t,
              ),
            },
            "settings",
            note ?? `Updated ${tenantName(s, id)}`,
            id,
          ),
        ),

      setTenantStatus: (id, status, reason) =>
        update((s) => {
          const label = { active: "Activated", suspended: "Suspended", past_due: "Marked past due", trial: "Moved to trial" }[status];
          return withLog(
            { ...s, tenants: s.tenants.map((t) => (t.id === id ? { ...t, status } : t)) },
            "tenant",
            `${label} ${tenantName(s, id)}${reason ? ` — ${reason}` : ""}`,
            id,
          );
        }),

      changePlan: (id, planId, cycle) =>
        update((s) => {
          const plan = s.plans.find((p) => p.id === planId);
          return withLog(
            {
              ...s,
              tenants: s.tenants.map((t) =>
                t.id === id ? { ...t, planId, cycle: cycle ?? t.cycle, status: t.status === "trial" ? "trial" : t.status === "suspended" ? t.status : "active" } : t,
              ),
            },
            "billing",
            `Moved ${tenantName(s, id)} to ${plan?.name ?? planId}${cycle ? ` (${cycle})` : ""}`,
            id,
          );
        }),

      extendTrial: (id, days) =>
        update((s) =>
          withLog(
            { ...s, tenants: s.tenants.map((t) => (t.id === id ? { ...t, trialEndsAt: addDays(t.trialEndsAt ?? TODAY, days) } : t)) },
            "support",
            `Extended trial of ${tenantName(s, id)} by ${days} days`,
            id,
          ),
        ),

      savePlan: (plan) =>
        update((s) => {
          const exists = s.plans.some((p) => p.id === plan.id);
          return withLog(
            { ...s, plans: exists ? s.plans.map((p) => (p.id === plan.id ? plan : p)) : [...s.plans, plan] },
            "plan",
            `${exists ? "Updated" : "Created"} plan ${plan.name}`,
          );
        }),

      archivePlan: (id, archived) =>
        update((s) =>
          withLog(
            { ...s, plans: s.plans.map((p) => (p.id === id ? { ...p, archived } : p)) },
            "plan",
            `${archived ? "Archived" : "Restored"} plan ${s.plans.find((p) => p.id === id)?.name}`,
          ),
        ),

      markInvoicePaid: (id) =>
        update((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          if (!inv) return s;
          let n: SaasState = { ...s, invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: "paid", paidAt: TODAY } : i)) };
          // Clear past-due once nothing is owed.
          const stillOwes = n.invoices.some((i) => i.tenantId === inv.tenantId && (i.status === "overdue" || i.status === "due"));
          if (!stillOwes) n = { ...n, tenants: n.tenants.map((t) => (t.id === inv.tenantId && t.status === "past_due" ? { ...t, status: "active" } : t)) };
          return withLog(n, "billing", `Marked ${inv.number} as paid`, inv.tenantId);
        }),

      sendReminder: (id) =>
        update((s) => {
          const inv = s.invoices.find((i) => i.id === id);
          return withLog(s, "billing", `Sent payment reminder for ${inv?.number}`, inv?.tenantId);
        }),

      inviteMember: (tenantId, name, email, role) =>
        update((s) => {
          const m: Member = { id: uid("m"), tenantId, name, email, role, status: "invited" };
          return withLog(
            {
              ...s,
              members: [...s.members, m],
              tenants: s.tenants.map((t) => (t.id === tenantId ? { ...t, usage: { ...t.usage, users: t.usage.users + 1 } } : t)),
            },
            "user",
            `Invited ${name} as ${role}`,
            tenantId,
          );
        }),

      setMemberRole: (id, role) =>
        update((s) => {
          const m = s.members.find((x) => x.id === id);
          return withLog({ ...s, members: s.members.map((x) => (x.id === id ? { ...x, role } : x)) }, "user", `Changed ${m?.name} to ${role}`, m?.tenantId);
        }),

      removeMember: (id) =>
        update((s) => {
          const m = s.members.find((x) => x.id === id);
          if (!m) return s;
          return withLog(
            {
              ...s,
              members: s.members.filter((x) => x.id !== id),
              tenants: s.tenants.map((t) => (t.id === m.tenantId ? { ...t, usage: { ...t.usage, users: Math.max(1, t.usage.users - 1) } } : t)),
            },
            "user",
            `Removed ${m.name}`,
            m.tenantId,
          );
        }),

      saveAnnouncement: (a) =>
        update((s) => {
          const exists = a.id && s.announcements.some((x) => x.id === a.id);
          const item: Announcement = { ...a, id: a.id ?? uid("n"), createdAt: TODAY } as Announcement;
          return withLog(
            { ...s, announcements: exists ? s.announcements.map((x) => (x.id === a.id ? { ...x, ...a } : x)) : [item, ...s.announcements] },
            "support",
            `${exists ? "Updated" : "Published"} announcement “${a.title}”`,
          );
        }),

      log: (kind, action, tenantId) => update((s) => withLog(s, kind, action, tenantId)),

      resetDemo: () => setState((s) => ({ ...seedState, session: s.session })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, ready],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSaas() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSaas must be used inside <SaasProvider>");
  return ctx;
}

/** The tenant for a slug plus its plan, members and helpers. */
export function useTenant(slug: string) {
  const { state } = useSaas();
  const tenant = state.tenants.find((t) => t.slug === slug) ?? null;
  const plan = tenant ? (state.plans.find((p) => p.id === tenant.planId) ?? null) : null;
  const members = tenant ? state.members.filter((m) => m.tenantId === tenant.id) : [];
  const invoices = tenant ? state.invoices.filter((i) => i.tenantId === tenant.id) : [];
  const can = (feature: FeatureKey) => Boolean(plan?.features.includes(feature));
  return { tenant, plan, members, invoices, can };
}
