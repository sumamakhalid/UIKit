"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  Drawer,
  Field,
  Input,
  MoneyInput,
  NumberInput,
  PageHeader,
  SegmentedControl,
  Switch,
  useToast,
} from "@/components/ui";
import { PlanCard } from "@/components/saas/plan-cards";
import { featureLabels } from "@/lib/saas/catalog";
import { monthlyValue, useSaas } from "@/lib/saas/store";
import type { BillingCycle, FeatureKey, Plan } from "@/lib/saas/types";
import { slugify } from "@/lib/saas/urls";
import { formatMoney } from "@/lib/utils";

const blank: Plan = {
  id: "",
  name: "",
  tagline: "",
  priceMonthly: 0,
  priceYearly: 0,
  limits: { users: 3, items: 500, bills: 2000, branches: 1 },
  features: ["sellByWeight", "creditCustomers"],
};

export default function PlansPage() {
  const toast = useToast();
  const { state, savePlan, archivePlan } = useSaas();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [editing, setEditing] = useState<Plan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const tenantsOn = (id: string) => state.tenants.filter((t) => t.planId === id);

  const open = (p: Plan | null) => {
    setIsNew(!p);
    setEditing(p ? structuredClone(p) : structuredClone(blank));
    setErrors({});
  };

  const save = () => {
    if (!editing) return;
    const e: typeof errors = {};
    if (!editing.name.trim()) e.name = "Name the plan";
    if (!editing.priceMonthly) e.price = "Set a monthly price";
    setErrors(e);
    if (Object.keys(e).length) return;
    const id = isNew ? slugify(editing.name) || `plan-${Date.now()}` : editing.id;
    if (isNew && state.plans.some((p) => p.id === id)) return setErrors({ name: "A plan with this name exists" });
    savePlan({ ...editing, id, name: editing.name.trim() });
    setEditing(null);
    toast({ title: isNew ? "Plan created" : "Plan saved", description: "Existing tenants keep their price until their next invoice." });
  };

  const setLimit = (k: keyof Plan["limits"], v: number | null) =>
    setEditing((p) => (p ? { ...p, limits: { ...p.limits, [k]: Math.max(1, v ?? 1) } } : p));

  const toggleFeature = (f: FeatureKey, on: boolean) =>
    setEditing((p) => (p ? { ...p, features: on ? [...p.features, f] : p.features.filter((x) => x !== f) } : p));

  return (
    <>
      <PageHeader
        title="Plans"
        subtitle="What businesses pay for"
        actions={
          <>
            <SegmentedControl
              aria-label="Show prices"
              value={cycle}
              onChange={setCycle}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
            <Button size="lg" arrow onClick={() => open(null)}>
              New plan
            </Button>
          </>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.plans.map((p) => {
          const on = tenantsOn(p.id);
          const mrr = on.reduce((s, t) => s + monthlyValue(t, state.plans), 0);
          return (
            <PlanCard
              key={p.id}
              plan={p}
              cycle={cycle}
              action={
                <div className="flex flex-col gap-3">
                  <p className="text-center text-sm">
                    <b className="tabular-nums">{on.length}</b> businesses · <b className="tabular-nums">{formatMoney(mrr)}</b> MRR
                  </p>
                  <div className="flex gap-2">
                    <Button fullWidth variant={p.highlight ? "accent" : "primary"} onClick={() => open(p)}>
                      Edit
                    </Button>
                    <Button
                      fullWidth
                      variant="outline"
                      disabled={!p.archived && on.length > 0}
                      title={!p.archived && on.length > 0 ? "Move businesses off this plan first" : undefined}
                      onClick={() => {
                        archivePlan(p.id, !p.archived);
                        toast({ title: p.archived ? "Plan restored" : "Plan archived", description: p.archived ? undefined : "New businesses can’t pick it." });
                      }}
                    >
                      {p.archived ? "Restore" : "Archive"}
                    </Button>
                  </div>
                </div>
              }
            />
          );
        })}
      </div>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        width="lg"
        title={isNew ? "New plan" : `Edit ${editing?.name}`}
        description="Limits are checked in the tenant panel — e.g. adding an item past the limit asks them to upgrade."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>{isNew ? "Create plan" : "Save plan"}</Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" required error={errors.name}>
                <Input data-autofocus value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Business" />
              </Field>
              <Field label="Tagline">
                <Input value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="Who it’s for" />
              </Field>
              <Field label="Monthly price" required error={errors.price}>
                <MoneyInput
                  value={editing.priceMonthly || null}
                  onValueChange={(v) => setEditing({ ...editing, priceMonthly: v ?? 0, priceYearly: editing.priceYearly || (v ?? 0) * 10 })}
                />
              </Field>
              <Field label="Yearly price" hint={editing.priceMonthly ? `${formatMoney(editing.priceMonthly * 12 - editing.priceYearly)} cheaper than 12 months` : undefined}>
                <MoneyInput value={editing.priceYearly || null} onValueChange={(v) => setEditing({ ...editing, priceYearly: v ?? 0 })} />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-[13px] font-semibold">Limits</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Team members">
                  <NumberInput value={editing.limits.users} onValueChange={(v) => setLimit("users", v)} min={1} stepper />
                </Field>
                <Field label="Items">
                  <NumberInput value={editing.limits.items} onValueChange={(v) => setLimit("items", v)} min={1} step={100} />
                </Field>
                <Field label="Bills per month">
                  <NumberInput value={editing.limits.bills} onValueChange={(v) => setLimit("bills", v)} min={1} step={500} />
                </Field>
                <Field label="Branches">
                  <NumberInput value={editing.limits.branches} onValueChange={(v) => setLimit("branches", v)} min={1} stepper />
                </Field>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-semibold">Features</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(featureLabels) as FeatureKey[]).map((f) => (
                  <Checkbox
                    key={f}
                    checked={editing.features.includes(f)}
                    onChange={(e) => toggleFeature(f, e.target.checked)}
                    label={featureLabels[f].label}
                    description={featureLabels[f].description}
                  />
                ))}
              </div>
            </div>

            <Switch
              checked={Boolean(editing.highlight)}
              onCheckedChange={(v) => setEditing({ ...editing, highlight: v })}
              label="Mark as most popular"
              description="Shown in black with a badge on the pricing page."
            />
          </div>
        )}
      </Drawer>
    </>
  );
}
