import type { HTMLAttributes, ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

export type Tone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "info";

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

const badgeTones: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary text-primary-fg",
  accent: "bg-accent text-accent-fg",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

const dotTones: Record<Tone, string> = {
  neutral: "bg-subtle",
  primary: "bg-primary-fg",
  accent: "bg-accent-fg",
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
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
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

/**
 * Change chip — the small "↗ 12%" pill. Good news is lime, bad news is red.
 * `good` defaults to true when the direction is up.
 */
export function Delta({
  value,
  direction = "up",
  good,
  className,
}: {
  value: ReactNode;
  direction?: "up" | "down";
  good?: boolean;
  className?: string;
}) {
  const isGood = good ?? direction === "up";
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-[11px] font-semibold whitespace-nowrap tabular-nums",
        isGood ? "bg-accent text-accent-fg" : "bg-danger-soft text-danger",
        className,
      )}
    >
      <Icon name={direction === "up" ? "arrow-up-right" : "arrow-down-right"} size={11} strokeWidth={2.4} />
      {value}
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
  return <div className={cn("rounded-lg bg-surface shadow-sm", className)} {...rest} />;
}

/** The little accent square in front of card titles. */
export function Marker({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("inline-block size-3.5 shrink-0 rounded-[4px] bg-accent", className)} />;
}

export function CardHeader({
  title,
  description,
  actions,
  marker = true,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Show the accent square before the title */
  marker?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 px-5 pt-5 pb-2", className)}>
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
          {marker && <Marker />}
          {title}
        </h3>
        {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-end gap-2 border-t border-line px-5 py-3.5", className)} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* StatCard — the big-number tile                                      */
/* ------------------------------------------------------------------ */

export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Small text after the value: "%", "kg", "bills" */
  unit?: ReactNode;
  icon?: IconName;
  /** Card fill: default white, accent (lime), info (soft blue), ink (black) */
  variant?: "default" | "accent" | "info" | "ink";
  change?: { value: string; direction: "up" | "down"; good?: boolean };
  /** Footnote under the number, e.g. "±0.2% from last week" */
  hint?: ReactNode;
  /** Number size */
  size?: "md" | "lg";
  className?: string;
  children?: ReactNode;
}

const statVariants = {
  default: "bg-surface text-fg",
  accent: "bg-accent text-accent-fg",
  info: "bg-info-soft text-fg",
  ink: "bg-primary text-primary-fg",
};

export function StatCard({ label, value, unit, icon, variant = "default", change, hint, size = "md", className, children }: StatCardProps) {
  const quiet = variant === "default" || variant === "info" ? "text-muted" : "opacity-75";
  return (
    <div className={cn("flex flex-col rounded-lg p-5 shadow-sm", statVariants[variant], className)}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-[13px] font-medium", quiet)}>{label}</p>
        <div className="flex items-center gap-1.5">
          {change && <Delta {...change} />}
          {icon && (
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                variant === "default" ? "bg-surface-2" : variant === "ink" ? "bg-primary-fg/10" : "bg-black/5",
              )}
            >
              <Icon name={icon} size={16} />
            </span>
          )}
        </div>
      </div>
      <p
        className={cn(
          "mt-3 flex items-baseline gap-1 font-normal tracking-[-0.04em] tabular-nums",
          size === "lg" ? "text-[52px] leading-[0.95]" : "text-[38px] leading-none",
        )}
      >
        {value}
        {unit && <span className={cn("font-normal tracking-normal", size === "lg" ? "text-2xl" : "text-xl")}>{unit}</span>}
      </p>
      {children}
      {hint && <p className={cn("mt-auto pt-4 text-xs", quiet)}>{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Alert                                                               */
/* ------------------------------------------------------------------ */

const alertIcons: Record<Tone, IconName> = {
  neutral: "info",
  primary: "info",
  accent: "sparkles",
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
      className={cn("flex gap-3 rounded-lg p-4", badgeTones[tone], className)}
    >
      <Icon name={alertIcons[tone]} size={18} className="mt-px shrink-0" />
      <div className="min-w-0 flex-1 text-sm">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={cn("opacity-90", title && "mt-0.5")}>{children}</div>}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-1 h-fit rounded-full p-1 opacity-70 hover:opacity-100">
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
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-fg">
        <Icon name={icon} size={24} />
      </span>
      <p className="mt-4 text-base font-semibold text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar                                                              */
/* ------------------------------------------------------------------ */

const avatarColors = [
  "bg-accent text-accent-fg",
  "bg-primary text-primary-fg",
  "bg-info-soft text-info",
  "bg-warning-soft text-warning",
  "bg-surface-2 text-fg",
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
  side?: "top" | "bottom" | "right";
  children: ReactNode;
}) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 rounded-full bg-primary px-2.5 py-1 text-xs font-medium whitespace-nowrap text-primary-fg opacity-0 shadow-md transition-opacity delay-150",
          "group-hover/tt:opacity-100 group-focus-within/tt:opacity-100",
          side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
          side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
          side === "right" && "top-1/2 left-full ml-3 -translate-y-1/2",
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
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line bg-surface-2 px-1 text-[11px] font-medium text-muted">
      {children}
    </kbd>
  );
}

export function Divider({ label, className }: { label?: ReactNode; className?: string }) {
  if (!label) return <hr className={cn("border-line", className)} />;
  return (
    <div className={cn("flex items-center gap-3 text-xs font-semibold text-subtle", className)}>
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
        <div key={i} className="flex items-center justify-between gap-4 py-2.5">
          <dt className="text-muted">{it.label}</dt>
          <dd className={cn("text-right tabular-nums", it.emphasis ? "text-lg font-semibold text-fg" : "font-medium text-fg")}>
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Legend item: a coloured dot and a label ("● Sales  ● Purchases"). */
export function LegendDot({ label, className, dotClassName }: { label: ReactNode; className?: string; dotClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-fg", className)}>
      <span className={cn("size-3.5 rounded-full bg-accent", dotClassName)} />
      {label}
    </span>
  );
}
