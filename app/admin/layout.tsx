import type { ReactNode } from "react";
import { headers } from "next/headers";
import { AdminFrame } from "@/components/saas/admin-frame";

export const metadata = { title: "Super admin" };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // "" when reached through admin.<root> (see middleware.ts), otherwise "/admin"
  const base = (await headers()).get("x-admin-base") ?? "/admin";
  return <AdminFrame base={base}>{children}</AdminFrame>;
}
