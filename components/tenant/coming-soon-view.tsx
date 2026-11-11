"use client";

import { Button, Card, EmptyState, PageHeader, type IconName } from "@/components/ui";
import { useCurrentTenant } from "@/components/saas/tenant-frame";
import { UpgradeModal } from "@/components/saas/upgrade-modal";
import { useLinkTo } from "@/lib/saas/link-base";
import type { FeatureKey } from "@/lib/saas/types";
import { useState } from "react";

const sections: Record<string, { title: string; subtitle: string; icon: IconName; feature?: FeatureKey; text: string }> = {
  sales: { title: "Sales / POS", subtitle: "Make bills fast", icon: "cart", text: "Weight × rate lines, cash or credit, print on thermal printers." },
  purchases: { title: "Purchases", subtitle: "Stock in from suppliers", icon: "truck", feature: "purchases", text: "Record supplier bills and update stock and costs in one step." },
  customers: { title: "Customers", subtitle: "Balances & khata", icon: "users", text: "Credit customers, balances and payment reminders on WhatsApp." },
  suppliers: { title: "Suppliers", subtitle: "Who you buy from", icon: "layers", text: "Supplier ledger, what you owe and payment history." },
  ledger: { title: "Ledger & payments", subtitle: "Day book", icon: "wallet", text: "Cash in, cash out, bank and every payment in one place." },
  reports: { title: "Reports", subtitle: "Profit & stock value", icon: "chart", feature: "reports", text: "Profit by item, stock valuation, sales by day and by customer." },
};

export function ComingSoonView({ section }: { section: string }) {
  const to = useLinkTo();
  const { plan } = useCurrentTenant();
  const [open, setOpen] = useState(true);
  const s = sections[section];

  if (!s) {
    return (
      <Card>
        <EmptyState
          icon="search"
          title="Page not found"
          description="This page doesn’t exist in your panel."
          action={<Button onClick={() => (location.href = to(""))}>Go to dashboard</Button>}
        />
      </Card>
    );
  }

  const locked = s.feature && !plan.features.includes(s.feature);

  return (
    <>
      <PageHeader title={s.title} subtitle={s.subtitle} />
      <Card className="mt-8">
        <EmptyState
          icon={s.icon}
          title={locked ? `${s.title} is on bigger plans` : "This screen is next on the build list"}
          description={s.text}
          action={
            locked ? (
              <Button arrow onClick={() => (location.href = to("/billing"))}>
                See plans
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => (location.href = to("/inventory"))}>
                Open inventory
              </Button>
            )
          }
          className="py-20"
        />
      </Card>
      {locked && (
        <UpgradeModal
          open={open}
          onClose={() => setOpen(false)}
          title={`${s.title} isn’t in ${plan.name}`}
          reason={`Upgrade your plan to use ${s.title.toLowerCase()}.`}
        />
      )}
    </>
  );
}
