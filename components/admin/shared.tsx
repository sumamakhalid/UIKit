"use client";

import { Avatar, Badge } from "@/components/ui";
import { businessTypes } from "@/lib/saas/catalog";
import type { Tenant, TenantStatus } from "@/lib/saas/types";
import { tenantDisplayHost } from "@/lib/saas/urls";

export const statusInfo: Record<TenantStatus, { label: string; tone: "success" | "accent" | "danger" | "neutral" | "warning" }> = {
  active: { label: "Active", tone: "success" },
  trial: { label: "Trial", tone: "accent" },
  past_due: { label: "Past due", tone: "danger" },
  suspended: { label: "Suspended", tone: "neutral" },
};

export function StatusBadge({ status, size, className }: { status: TenantStatus; size?: "sm" | "md"; className?: string }) {
  const s = statusInfo[status];
  return (
    <Badge tone={s.tone} dot size={size} className={className}>
      {s.label}
    </Badge>
  );
}

/** Tenant name with avatar, address and type. */
export function TenantCell({ tenant, showType = true }: { tenant: Tenant; showType?: boolean }) {
  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <Avatar name={tenant.name} size={36} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{tenant.name}</p>
        <p className="truncate text-xs text-muted">
          {tenantDisplayHost(tenant.slug)}
          {showType && ` · ${businessTypes[tenant.type].label}`}
        </p>
      </div>
    </div>
  );
}

export function when(iso: string) {
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: iso.length > 10 ? "2-digit" : undefined, minute: iso.length > 10 ? "2-digit" : undefined });
}
