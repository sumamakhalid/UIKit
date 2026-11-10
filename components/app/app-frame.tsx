"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppShell, DateChip, IconButton, Tooltip } from "@/components/ui";
import { appConfig } from "@/lib/config";
import { nav } from "@/lib/nav";

/** The shell every screen of this app uses: workspace pill, quick actions, rail menu. */
export function AppFrame({ active, children }: { active: string; children: ReactNode }) {
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).replace(/^(\w+) /, "$1, "));
  }, []);

  return (
    <AppShell
      brand={{ name: appConfig.businessName, short: appConfig.shortName, subtitle: "Inventory & accounts" }}
      nav={nav}
      activeHref={active}
      user={{ name: "Sumama Khalid", role: "Owner" }}
      topbar={
        <div className="flex items-center gap-2 pl-2">
          <Tooltip content="Scan barcode" side="bottom">
            <IconButton icon="barcode" label="Scan barcode" variant="outline" />
          </Tooltip>
          <Tooltip content="Sync" side="bottom">
            <IconButton icon="refresh" label="Sync" variant="outline" />
          </Tooltip>
          <Tooltip content="New bill" side="bottom">
            <IconButton icon="receipt" label="New bill" variant="outline" />
          </Tooltip>
        </div>
      }
      topbarEnd={
        <>
          <IconButton icon="star" label="Favourites" variant="soft" className="hidden sm:inline-flex" />
          <IconButton icon="sparkles" label="Ask assistant" variant="soft" className="hidden sm:inline-flex" />
          {today && <DateChip label={today} count={5} />}
        </>
      }
      railFooter={
        <>
          <IconButton icon="expand" label="Full screen" variant="outline" />
          <IconButton icon="logout" label="Log out" variant="primary" />
        </>
      }
    >
      {children}
    </AppShell>
  );
}
