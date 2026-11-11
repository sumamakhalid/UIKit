"use client";

import { useState } from "react";
import { Badge, Button, Card, CardHeader, Field, Icon, Input, NumberInput, PageHeader, Select, Switch, useToast } from "@/components/ui";
import { useCurrentTenant } from "@/components/saas/tenant-frame";
import { accents, businessTypes, featureLabels } from "@/lib/saas/catalog";
import { useSaas } from "@/lib/saas/store";
import type { Accent, FeatureKey } from "@/lib/saas/types";
import { tenantDisplayHost } from "@/lib/saas/urls";
import { cn } from "@/lib/utils";

export function SettingsView() {
  const toast = useToast();
  const { tenant, plan, role } = useCurrentTenant();
  const { updateTenant } = useSaas();
  const readOnly = role !== "owner" && role !== "manager";

  const [profile, setProfile] = useState({
    name: tenant.name,
    shortName: tenant.shortName,
    phone: tenant.settings.phone,
    address: tenant.settings.address,
    city: tenant.settings.city,
  });
  const [units, setUnits] = useState({
    currency: tenant.settings.currency,
    weightUnit: tenant.settings.weightUnit,
    weightDecimals: tenant.settings.weightDecimals,
    pieceUnit: tenant.settings.pieceUnit,
  });
  const [nameError, setNameError] = useState("");

  const saveProfile = () => {
    if (!profile.name.trim()) return setNameError("Business name is required");
    setNameError("");
    updateTenant(
      tenant.id,
      {
        name: profile.name.trim(),
        shortName: profile.shortName.trim().slice(0, 3).toUpperCase() || tenant.shortName,
        settings: { phone: profile.phone, address: profile.address, city: profile.city },
      },
      "Updated business profile",
    );
    toast({ title: "Profile saved" });
  };

  const saveUnits = () => {
    updateTenant(tenant.id, { settings: units }, "Updated units & currency");
    toast({ title: "Units saved", description: "New bills use these units." });
  };

  const setAccent = (accent: Accent) => {
    updateTenant(tenant.id, { accent }, `Changed brand colour to ${accent}`);
  };

  const toggleFeature = (f: FeatureKey, on: boolean) => {
    const enabled = on ? [...tenant.settings.enabled, f] : tenant.settings.enabled.filter((x) => x !== f);
    updateTenant(tenant.id, { settings: { enabled } }, `${on ? "Turned on" : "Turned off"} ${featureLabels[f].label.toLowerCase()}`);
  };

  const tpl = businessTypes[tenant.type];

  return (
    <>
      <PageHeader title="Settings" subtitle={tenant.name} />

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {/* ---------- Profile ---------- */}
        <Card>
          <CardHeader title="Business profile" description="Printed on bills and receipts." />
          <div className="grid gap-4 px-5 pt-2 pb-5 sm:grid-cols-[1fr_120px]">
            <Field label="Business name" required error={nameError}>
              <Input disabled={readOnly} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </Field>
            <Field label="Short name" hint="Max 3 letters">
              <Input disabled={readOnly} value={profile.shortName} maxLength={3} onChange={(e) => setProfile({ ...profile, shortName: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input disabled={readOnly} inputMode="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="03xx xxxxxxx" />
            </Field>
            <Field label="City">
              <Input disabled={readOnly} value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Input disabled={readOnly} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
              <p className="text-xs text-muted">
                Your address: <span className="font-semibold text-fg">{tenantDisplayHost(tenant.slug)}</span>
              </p>
              {!readOnly && <Button onClick={saveProfile}>Save profile</Button>}
            </div>
          </div>
        </Card>

        {/* ---------- Branding ---------- */}
        <Card>
          <CardHeader title="Brand colour" description="Used for highlights across your panel." />
          <div className="px-5 pt-2 pb-5">
            <div role="radiogroup" aria-label="Brand colour" className="flex flex-wrap gap-3">
              {accents.map((a) => {
                const on = tenant.accent === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={readOnly}
                    onClick={() => setAccent(a.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg p-2 text-xs font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
                      on ? "bg-surface-2" : "hover:bg-surface-2",
                    )}
                  >
                    <span
                      className={cn("flex size-12 items-center justify-center rounded-full ring-1 ring-black/10", on && "ring-4 ring-fg")}
                      style={{ background: a.hex }}
                    >
                      {on && <Icon name="check" size={18} strokeWidth={2.6} className="text-[#111]" />}
                    </span>
                    {a.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 rounded-md bg-surface-2 p-4">
              <Button size="sm" variant="accent">
                Preview
              </Button>
              <Badge tone="accent">Active tab</Badge>
              <span className="inline-block h-2 w-24 rounded-full bg-accent" />
            </div>
          </div>
        </Card>

        {/* ---------- Units ---------- */}
        <Card>
          <CardHeader title="Units & currency" description={`Started from the ${tpl.label} template.`} />
          <div className="grid gap-4 px-5 pt-2 pb-5 sm:grid-cols-2">
            <Field label="Currency symbol">
              <Select
                disabled={readOnly}
                value={units.currency}
                onChange={(e) => setUnits({ ...units, currency: e.target.value })}
                options={[
                  { value: "Rs", label: "Rs — Pakistani rupee" },
                  { value: "AED", label: "AED — UAE dirham" },
                  { value: "SAR", label: "SAR — Saudi riyal" },
                  { value: "$", label: "$ — US dollar" },
                ]}
              />
            </Field>
            <Field label="Piece unit">
              <Select
                disabled={readOnly}
                value={units.pieceUnit}
                onChange={(e) => setUnits({ ...units, pieceUnit: e.target.value })}
                options={["pcs", "nos", "units", "boxes"].map((u) => ({ value: u, label: u }))}
              />
            </Field>
            <Field label="Weight unit">
              <Select
                disabled={readOnly}
                value={units.weightUnit}
                onChange={(e) => setUnits({ ...units, weightUnit: e.target.value })}
                options={["kg", "g", "mann", "lb"].map((u) => ({ value: u, label: u }))}
              />
            </Field>
            <Field label="Weight decimals" hint="2 = 10 g, 3 = 1 g precision">
              <NumberInput
                disabled={readOnly}
                value={units.weightDecimals}
                onValueChange={(v) => setUnits({ ...units, weightDecimals: Math.max(0, Math.min(3, v ?? 0)) })}
                min={0}
                max={3}
                stepper
              />
            </Field>
            {!readOnly && (
              <div className="flex justify-end sm:col-span-2">
                <Button onClick={saveUnits}>Save units</Button>
              </div>
            )}
          </div>
        </Card>

        {/* ---------- Features ---------- */}
        <Card>
          <CardHeader title="Features" description="Turn on what your shop uses. Some need a bigger plan." />
          <ul className="px-5 pb-3">
            {(Object.keys(featureLabels) as FeatureKey[]).map((f) => {
              const inPlan = plan.features.includes(f);
              return (
                <li key={f} className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
                  <Switch
                    checked={inPlan && tenant.settings.enabled.includes(f)}
                    onCheckedChange={(on) => toggleFeature(f, on)}
                    disabled={!inPlan || readOnly}
                    label={featureLabels[f].label}
                    description={featureLabels[f].description}
                  />
                  {!inPlan && <Badge tone="neutral">Upgrade</Badge>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
