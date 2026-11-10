import type { HTMLAttributes, ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

const badgeTones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted border-line",
  primary: "bg-primary-soft text-primary border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
};

const dotTones: Record<Tone, string> = {
  neutral: "bg-subtle",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
  icon?: IconName;
  size?: "sm" | "md";
}

export function Badge({ tone = "neutral", dot, icon, size = "md", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-xs",
        badgeTones[tone],
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotTones[tone])} />}
      {icon && <Icon name={icon} size={12} strokeWidth={2.2} />}
      {children}
    </span>
  );
}

/** Stock status from quantity and re-order level. */
export function stockStatus(qty: number, reorderLevel: number): { label: string; tone: Tone } {
  if (qty <= 0) return { label: "Out of stock", tone: "danger" };
  if (qty <= reorderLevel) return { label: "Low stock", tone: "warning" };
  return { label: "In stock", tone: "success" };
}

export function StockBadge({ qty, reorderLevel, size }: { qty: number; reorderLevel: number; size?: "sm" | "md" }) {
  const s = stockStatus(qty, reorderLevel);
  return (
    <Badge tone={s.tone} dot size={size}>
      {s.label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-surface shadow-sm", className)} {...rest} />;
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4", className)}>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold text-fg">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 rounded-b-lg border-t border-line bg-surface-2/50 px-5 py-3", className)}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* StatCard — dashboard KPI tile                                       */
/* ------------------------------------------------------------------ */

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: IconName;
  tone?: Tone;
  /** e.g. { value: "12.5%", direction: "up", good: true } */
  change?: { value: string; direction: "up" | "down"; good?: boolean };
  hint?: ReactNode;
  className?: string;
}

const iconTones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

export function StatCard({ label, value, icon, tone = "primary", change, hint, className }: StatCardProps) {
  const good = change ? (change.good ?? change.direction === "up") : false;
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-semibold text-muted">{label}</p>
        {icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-md", iconTones[tone])}>
            <Icon name={icon} size={16} />
          </span>
        )}
      </div>
      <p className="mt-2 font-mono text-xl font-semibold sm:text-2xl tracking-tight text-fg tabular-nums">{value}</p>
      {(change || hint) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {change && (
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-success" : "text-danger")}>
              <Icon name={change.direction === "up" ? "trend-up" : "trend-down"} size={13} strokeWidth={2.2} />
              {change.value}
            </span>
          )}
          {hint && <span className="text-muted">{hint}</span>}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Alert                                                               */
/* ------------------------------------------------------------------ */

const alertIcons: Record<Tone, IconName> = {
  neutral: "info",
  primary: "info",
  success: "check-circle",
  warning: "alert",
  danger: "x-circle",
  info: "info",
};

export interface AlertProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ tone = "info", title, children, action, onClose, className }: AlertProps) {
  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-3.5", badgeTones[tone], tone === "neutral" ? "" : "border-current/15", className)}
    >
      <Icon name={alertIcons[tone]} size={18} className="mt-px shrink-0" />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cn("text-fg/80", title && "mt-0.5")}>{children}</div>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="-m-1 h-fit rounded p-1 opacity-70 hover:opacity-100"
        >
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* EmptyState                                                          */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-subtle">
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-3 text-[15px] font-bold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

const avatarColors = [
  "bg-primary-soft text-primary",
  "bg-success-soft text-success",
  "bg-warning-soft text-warning",
  "bg-info-soft text-info",
  "bg-danger-soft text-danger",
];

export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const hash = [...name].reduce((h, c) => h + c.charCodeAt(0), 0);
  return (
    <span
      title={name}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        avatarColors[hash % avatarColors.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tooltip (CSS only — hover & keyboard focus)                         */
/* ------------------------------------------------------------------ */

export function Tooltip({
  content,
  side = "top",
  children,
}: {
  content: ReactNode;
  side?: "top" | "bottom";
  children: ReactNode;
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-md bg-fg px-2 py-1 text-xs font-medium whitespace-nowrap text-bg opacity-0 shadow-md transition-opacity delay-150",
          "group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {content}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Small bits                                                          */
/* ------------------------------------------------------------------ */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line-strong bg-surface-2 px-1 font-mono text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}

export function Divider({ label, className }: { label?: ReactNode; className?: string }) {
  if (!label) return <hr className={cn("border-line", className)} />;
  return (
    <div className={cn("flex items-center gap-3 text-xs font-semibold tracking-wide text-subtle uppercase", className)}>
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Label/value pair for detail views and invoice summaries. */
export function DescriptionList({
  items,
  className,
}: {
  items: { label: ReactNode; value: ReactNode; emphasis?: boolean }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-line text-sm", className)}>
      {items.map((it, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2">
          <dt className="text-muted">{it.label}</dt>
          <dd className={cn("text-right font-mono tabular-nums", it.emphasis ? "text-base font-bold text-fg" : "font-medium text-fg")}>
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
