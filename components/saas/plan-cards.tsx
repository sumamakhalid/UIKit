"use client";

import type { ReactNode } from "react";
import { Badge, Icon } from "@/components/ui";
import { featureLabels } from "@/lib/saas/catalog";
import type { BillingCycle, FeatureKey, Plan } from "@/lib/saas/types";
import { cn, formatMoney, formatNumber } from "@/lib/utils";

const allFeatures = Object.keys(featureLabels) as FeatureKey[];

export function planPrice(plan: Plan, cycle: BillingCycle) {
  return cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
}

/** One pricing card. `action` renders the button at the bottom. */
export function PlanCard({
  plan,
  cycle,
  current,
  action,
  footnote,
  compact,
}: {
  plan: Plan;
  cycle: BillingCycle;
  current?: boolean;
  action?: ReactNode;
  footnote?: ReactNode;
  compact?: boolean;
}) {
  const dark = plan.highlight;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg p-6 shadow-sm",
        dark ? "bg-primary text-primary-fg" : "bg-surface text-fg",
        current && "ring-4 ring-accent",
        plan.archived && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold">{plan.name}</p>
          <p className={cn("text-[13px]", dark ? "opacity-70" : "text-muted")}>{plan.tagline}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {current && <Badge tone="accent">Current</Badge>}
          {plan.highlight && !current && <Badge tone="accent">Most popular</Badge>}
          {plan.archived && <Badge>Archived</Badge>}
        </div>
      </div>
      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="text-[40px] leading-none tracking-[-0.04em] tabular-nums">{formatMoney(planPrice(plan, cycle))}</span>
        <span className={cn("text-sm", dark ? "opacity-70" : "text-muted")}>/{cycle === "yearly" ? "year" : "month"}</span>
      </p>
      {cycle === "yearly" && (
        <p className={cn("mt-1 text-xs", dark ? "opacity-70" : "text-muted")}>
          {formatMoney(Math.round(plan.priceYearly / 12))}/month · saves {formatMoney(plan.priceMonthly * 12 - plan.priceYearly)}
        </p>
      )}

      <dl className={cn("mt-5 grid grid-cols-2 gap-2 rounded-md p-3 text-xs", dark ? "bg-primary-fg/10" : "bg-surface-2")}>
        <div>
          <dt className={dark ? "opacity-70" : "text-muted"}>Team</dt>
          <dd className="text-sm font-semibold tabular-nums">{formatNumber(plan.limits.users)} users</dd>
        </div>
        <div>
          <dt className={dark ? "opacity-70" : "text-muted"}>Items</dt>
          <dd className="text-sm font-semibold tabular-nums">{formatNumber(plan.limits.items)}</dd>
        </div>
        <div>
          <dt className={dark ? "opacity-70" : "text-muted"}>Bills / month</dt>
          <dd className="text-sm font-semibold tabular-nums">{formatNumber(plan.limits.bills)}</dd>
        </div>
        <div>
          <dt className={dark ? "opacity-70" : "text-muted"}>Branches</dt>
          <dd className="text-sm font-semibold tabular-nums">{plan.limits.branches}</dd>
        </div>
      </dl>

      {!compact && (
        <ul className="mt-5 flex flex-col gap-2 text-[13px]">
          {allFeatures.map((f) => {
            const ok = plan.features.includes(f);
            return (
              <li key={f} className={cn("flex items-center gap-2", !ok && "opacity-45")}>
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    ok ? "bg-accent text-accent-fg" : dark ? "bg-primary-fg/10" : "bg-surface-2",
                  )}
                >
                  <Icon name={ok ? "check" : "minus"} size={12} strokeWidth={2.6} />
                </span>
                <span className={ok ? "" : "line-through"}>{featureLabels[f].label}</span>
              </li>
            );
          })}
        </ul>
      )}

      {(action || footnote) && (
        <div className="mt-auto pt-6">
          {action}
          {footnote && <p className={cn("mt-2 text-center text-xs", dark ? "opacity-70" : "text-muted")}>{footnote}</p>}
        </div>
      )}
    </div>
  );
}
