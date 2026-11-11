"use client";

import { useEffect, useState } from "react";
import { Button, Drawer, Field, Icon, Input, RadioGroup, SegmentedControl, StepDots, Switch } from "@/components/ui";
import { businessTypes } from "@/lib/saas/catalog";
import { useSaas, type NewTenantInput } from "@/lib/saas/store";
import type { BillingCycle, BusinessType, Tenant } from "@/lib/saas/types";
import { isValidSlug, slugify, tenantDisplayHost } from "@/lib/saas/urls";
import { cn, formatMoney } from "@/lib/utils";

const empty: NewTenantInput = {
  name: "",
  slug: "",
  type: "hardware",
  ownerName: "",
  ownerEmail: "",
  planId: "business",
  cycle: "monthly",
  trial: true,
  city: "",
};

const steps = ["Business", "Owner", "Plan"];

export function NewTenantDrawer({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (t: Tenant) => void }) {
  const { state, createTenant } = useSaas();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewTenantInput>(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewTenantInput, string>>>({});

  useEffect(() => {
    if (open) {
      setStep(0);
      setForm(empty);
      setSlugTouched(false);
      setErrors({});
    }
  }, [open]);

  const set = <K extends keyof NewTenantInput>(k: K, v: NewTenantInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (s: number) => {
    const e: typeof errors = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = "Enter the business name";
      if (!isValidSlug(form.slug)) e.slug = "3–40 letters, numbers or dashes; not a reserved word";
      else if (state.tenants.some((t) => t.slug === form.slug)) e.slug = "This address is taken";
    }
    if (s === 1) {
      if (!form.ownerName.trim()) e.ownerName = "Enter the owner’s name";
      if (!/^\S+@\S+\.\S+$/.test(form.ownerEmail)) e.ownerEmail = "Enter a valid email";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < steps.length - 1) setStep(step + 1);
    else {
      const t = createTenant(form);
      onCreated(t);
    }
  };

  const plans = state.plans.filter((p) => !p.archived);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title="Add a business"
      description={`Step ${step + 1} of ${steps.length} — ${steps[step]}`}
      footer={
        <>
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <Button arrow onClick={next}>
            {step < steps.length - 1 ? "Continue" : form.trial ? "Start trial" : "Create business"}
          </Button>
        </>
      }
    >
      <StepDots count={steps.length} active={step} onChange={(i) => i < step && setStep(i)} className="mb-6 text-fg" />

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Field label="Business name" required error={errors.name}>
            <Input
              data-autofocus
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
              }}
              placeholder="e.g. Khalid Wire Store"
            />
          </Field>
          <Field label="Address" required error={errors.slug} hint={`Opens at ${tenantDisplayHost(form.slug || "your-shop")}`}>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
              trailing={`.${tenantDisplayHost("").slice(1)}`}
              placeholder="your-shop"
            />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Lahore" />
          </Field>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Type of business</span>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(businessTypes) as BusinessType[]).map((k) => {
                const t = businessTypes[k];
                const on = form.type === k;
                return (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set("type", k)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3.5 text-left transition-colors focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
                      on ? "border-fg bg-accent-soft" : "border-line bg-surface hover:bg-surface-2",
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", on ? "bg-accent text-accent-fg" : "bg-surface-2")}>
                      <Icon name={t.icon} size={17} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{t.label}</span>
                      <span className="block text-xs text-muted">{t.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field label="Owner name" required error={errors.ownerName}>
            <Input data-autofocus value={form.ownerName} onChange={(e) => set("ownerName", e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Owner email" required error={errors.ownerEmail} hint="They get an email to set a password and sign in.">
            <Input type="email" value={form.ownerEmail} onChange={(e) => set("ownerEmail", e.target.value)} placeholder="owner@example.com" />
          </Field>
          <div className="rounded-lg bg-surface-2 p-4 text-sm">
            <p className="font-semibold">What they start with</p>
            <p className="mt-1 text-muted">
              {businessTypes[form.type].label} template — categories {businessTypes[form.type].categories.slice(0, 3).join(", ")}
              {businessTypes[form.type].categories.length > 3 ? "…" : ""}. Everything can be changed later.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <SegmentedControl<BillingCycle>
            fullWidth
            aria-label="Billing cycle"
            value={form.cycle}
            onChange={(v) => set("cycle", v)}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <RadioGroup
            name="plan"
            variant="card"
            className="sm:grid-cols-1!"
            value={form.planId}
            onChange={(v) => set("planId", v)}
            options={plans.map((p) => ({
              value: p.id,
              label: `${p.name} — ${formatMoney(form.cycle === "yearly" ? p.priceYearly : p.priceMonthly)}/${form.cycle === "yearly" ? "year" : "month"}`,
              description: `${p.limits.users} users · ${p.limits.items.toLocaleString()} items · ${p.tagline}`,
            }))}
          />
          <Switch
            checked={form.trial}
            onCheckedChange={(v) => set("trial", v)}
            label="Start with a 14-day free trial"
            description="No invoice until the trial ends."
          />
        </div>
      )}
    </Drawer>
  );
}
