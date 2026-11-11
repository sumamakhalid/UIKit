"use client";

import type { ReactNode } from "react";
import { Button, Icon, Skeleton, type IconName } from "@/components/ui";
import { cn } from "@/lib/utils";

/** Full-page message used for sign-in gates, not-found and suspended screens. */
export function FullScreen({
  icon,
  title,
  children,
  actions,
  tone = "accent",
}: {
  icon: IconName;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: "accent" | "danger" | "ink";
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 text-center shadow-md">
        <span
          className={cn(
            "mx-auto flex size-14 items-center justify-center rounded-full",
            tone === "accent" && "bg-accent text-accent-fg",
            tone === "danger" && "bg-danger-soft text-danger",
            tone === "ink" && "bg-primary text-primary-fg",
          )}
        >
          <Icon name={icon} size={24} />
        </span>
        <h1 className="mt-5 text-2xl font-medium tracking-[-0.02em]">{title}</h1>
        {children && <div className="mt-2 text-sm text-muted">{children}</div>}
        {actions && <div className="mt-6 flex flex-col gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-surface">
      <div className="flex h-[76px] items-center gap-3 px-6">
        <Skeleton className="h-12 w-56 rounded-full!" />
        <Skeleton className="ml-auto size-10 rounded-full!" />
      </div>
      <div className="min-h-[calc(100dvh-76px)] rounded-tl-[36px] bg-bg p-8 lg:ml-[84px]">
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40 rounded-lg!" />
          <Skeleton className="h-40 rounded-lg!" />
          <Skeleton className="h-40 rounded-lg!" />
        </div>
      </div>
    </div>
  );
}

/** Thin strip above the top bar. */
export function Banner({
  tone,
  icon,
  children,
  action,
}: {
  tone: "ink" | "warning" | "danger" | "accent";
  icon: IconName;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-[13px] font-medium",
        tone === "ink" && "bg-primary text-primary-fg",
        tone === "warning" && "bg-warning-soft text-warning",
        tone === "danger" && "bg-danger text-danger-fg",
        tone === "accent" && "bg-accent text-accent-fg",
      )}
    >
      <Icon name={icon} size={15} />
      <span>{children}</span>
      {action && (
        <Button
          size="sm"
          variant={tone === "ink" ? "accent" : "primary"}
          className="h-7! px-3!"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
