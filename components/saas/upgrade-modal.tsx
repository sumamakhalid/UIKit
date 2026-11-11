"use client";

import { Button, Modal } from "@/components/ui";
import { useLinkTo } from "@/lib/saas/link-base";
import { useCurrentTenant } from "./tenant-frame";

/** Shown when a tenant hits a plan limit or opens a feature their plan doesn't include. */
export function UpgradeModal({ open, onClose, title, reason }: { open: boolean; onClose: () => void; title: string; reason: string }) {
  const to = useLinkTo();
  const { role } = useCurrentTenant();
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={reason}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Not now
          </Button>
          {role === "owner" ? (
            <Button arrow onClick={() => (location.href = to("/billing"))}>
              See plans
            </Button>
          ) : (
            <Button onClick={onClose}>Ask the owner</Button>
          )}
        </>
      }
    />
  );
}
