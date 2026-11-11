import type { ReactNode } from "react";
import { headers } from "next/headers";
import { TenantFrame } from "@/components/saas/tenant-frame";

export default async function TenantLayout({ children, params }: { children: ReactNode; params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  // "" when reached through <slug>.<root> (see middleware.ts), otherwise "/t/<slug>"
  const base = (await headers()).get("x-tenant-base") ?? `/t/${tenant}`;
  return (
    <TenantFrame slug={tenant} base={base}>
      {children}
    </TenantFrame>
  );
}
