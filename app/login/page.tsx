"use client";

import { useState } from "react";
import { Button, Divider, Field, Input, SearchSelect } from "@/components/ui";
import { appConfig } from "@/lib/config";
import { useSaas } from "@/lib/saas/store";
import { adminUrl, tenantUrl } from "@/lib/saas/urls";

/**
 * Demo sign-in. The form shows the real shape (email + password);
 * the demo buttons below sign in without checking anything.
 * Replace with your auth provider (NextAuth / Laravel Sanctum / Supabase).
 */
export default function LoginPage() {
  const { state, signInSuper, signInTenant } = useSaas();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [slug, setSlug] = useState<string | null>("khalid-wire");

  const submit = () => {
    const member = state.members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    if (email.trim().toLowerCase() === "owner@yourapp.com") {
      signInSuper();
      return setTimeout(() => (location.href = adminUrl()), 50);
    }
    if (!member) return setError("No account with this email. Use the demo buttons below.");
    const t = state.tenants.find((x) => x.id === member.tenantId)!;
    signInTenant(t.slug, member.id);
    setTimeout(() => (location.href = tenantUrl(t.slug)), 50);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow-md">
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-accent-fg">{appConfig.platformShort}</span>
          <span className="text-lg font-bold">{appConfig.platformName}</span>
        </a>
        <h1 className="mt-8 text-[32px] leading-tight font-medium tracking-[-0.03em]">Sign in</h1>
        <p className="text-sm text-muted">to your shop or the admin panel</p>

        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="Email" error={error}>
            <Input type="email" autoComplete="email" value={email} onChange={(e) => (setEmail(e.target.value), setError(""))} placeholder="you@example.com" />
          </Field>
          <Field label="Password" labelAside={<a href="#" className="hover:underline">Forgot?</a>}>
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          <Button type="submit" size="lg" fullWidth arrow>
            Sign in
          </Button>
        </form>

        <Divider label="Demo" className="my-6" />
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <SearchSelect
              className="flex-1"
              value={slug}
              onChange={setSlug}
              options={state.tenants.map((t) => ({ value: t.slug, label: t.name, description: t.ownerName }))}
            />
            <Button
              variant="accent"
              disabled={!slug}
              onClick={() => {
                if (!slug) return;
                signInTenant(slug);
                setTimeout(() => (location.href = tenantUrl(slug)), 50);
              }}
            >
              Owner
            </Button>
          </div>
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              signInSuper();
              setTimeout(() => (location.href = adminUrl()), 50);
            }}
          >
            Sign in as super admin
          </Button>
        </div>
      </div>
    </div>
  );
}
