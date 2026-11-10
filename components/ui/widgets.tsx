"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Icon, type IconName } from "./icon";
import { Marker } from "./display";

/* ------------------------------------------------------------------ */
/* PillButton — white pill with an icon circle ("📅 Sep 02 – Sep 09 ⌄") */
/* ------------------------------------------------------------------ */

const pillBase =
  "inline-flex h-11 shrink-0 items-center gap-2.5 rounded-full pl-1.5 text-[13px] font-semibold text-fg transition-colors " +
  "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none";
const pillSurfaces = {
  /** white pill — use on the grey canvas */
  surface: "bg-surface hover:bg-surface-2",
  /** grey pill — use inside white cards */
  soft: "bg-surface-2 hover:bg-primary-soft",
};

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  chevron?: boolean;
  surface?: keyof typeof pillSurfaces;
}

export function PillButton({ icon, chevron = true, surface = "surface", className, children, type = "button", ...rest }: PillButtonProps) {
  return (
    <button type={type} className={cn(pillBase, pillSurfaces[surface], chevron ? "pr-3" : "pr-4", className)} {...rest}>
      <span className={cn("flex size-8 items-center justify-center rounded-full", surface === "surface" ? "bg-surface-2" : "bg-surface")}>
        <Icon name={icon} size={15} />
      </span>
      {children}
      {chevron && <Icon name="chevron-down" size={14} className="text-muted" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* PillSelect — the same pill around a native <select> ("🕒 24h ⌄")     */
/* ------------------------------------------------------------------ */

export interface PillSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  icon: IconName;
  options: { value: string; label: string }[];
  surface?: keyof typeof pillSurfaces;
}

export function PillSelect({ icon, options, surface = "surface", className, ...rest }: PillSelectProps) {
  return (
    <span className={cn(pillBase, pillSurfaces[surface], "relative pr-3 focus-within:ring-4 focus-within:ring-ring", className)}>
      <span className={cn("flex size-8 items-center justify-center rounded-full", surface === "surface" ? "bg-surface-2" : "bg-surface")}>
        <Icon name={icon} size={15} />
      </span>
      <select className="cursor-pointer appearance-none bg-transparent pr-5 outline-none" {...rest}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={14} className="pointer-events-none absolute right-3 text-muted" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* DateRangePicker — pill that opens From/To + quick presets           */
/* ------------------------------------------------------------------ */

export interface DateRange {
  from: string; // yyyy-mm-dd
  to: string;
}

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const pretty = (s: string) =>
  s ? new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).replace(/(\d+) (\w+)/, "$2 $1") : "…";

function presets(): { label: string; range: DateRange }[] {
  const today = new Date();
  const d = (n: number) => {
    const x = new Date(today);
    x.setDate(x.getDate() + n);
    return iso(x);
  };
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return [
    { label: "Today", range: { from: d(0), to: d(0) } },
    { label: "Last 7 days", range: { from: d(-6), to: d(0) } },
    { label: "Last 30 days", range: { from: d(-29), to: d(0) } },
    { label: "This month", range: { from: iso(monthStart), to: d(0) } },
  ];
}

export function DateRangePicker({
  value,
  onChange,
  surface = "surface",
  align = "end",
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  surface?: keyof typeof pillSurfaces;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(value);
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, value]);

  return (
    <div ref={ref} className="relative">
      <PillButton icon="calendar" surface={surface} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((o) => !o)}>
        <span className="tabular-nums">
          {pretty(value.from)} – {pretty(value.to)}
        </span>
      </PillButton>
      {open && (
        <div
          role="dialog"
          aria-label="Choose dates"
          className={cn(
            "absolute top-full z-40 mt-2 w-[300px] animate-pop-in rounded-lg border border-line bg-surface p-4 shadow-lg",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div className="flex flex-wrap gap-1.5">
            {presets().map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setDraft(p.range)}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-semibold",
                  draft.from === p.range.from && draft.to === p.range.to
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-line text-fg hover:bg-surface-2",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["from", "to"] as const).map((k) => (
              <label key={k} className="flex flex-col gap-1 text-xs font-semibold text-muted">
                {k === "from" ? "From" : "To"}
                <input
                  type="date"
                  value={draft[k]}
                  max={k === "from" ? draft.to : undefined}
                  min={k === "to" ? draft.from : undefined}
                  onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                  className="h-10 rounded-md border border-line-strong bg-surface px-2.5 text-sm text-fg outline-none focus:border-fg focus:ring-4 focus:ring-ring"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onChange(draft);
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ChecklistCard — today's tasks with round checks and value chips      */
/* ------------------------------------------------------------------ */

export interface ChecklistItem {
  id: string;
  label: ReactNode;
  meta?: ReactNode;
  /** Right side: a chip or short text */
  aside?: ReactNode;
  done: boolean;
}

export function Checklist({
  items,
  onToggle,
  className,
}: {
  items: ChecklistItem[];
  onToggle: (id: string, done: boolean) => void;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
          <button
            type="button"
            role="checkbox"
            aria-checked={it.done}
            onClick={() => onToggle(it.id, !it.done)}
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
              "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
              it.done ? "border-primary bg-primary text-primary-fg" : "border-line-strong bg-surface",
            )}
          >
            {it.done && <Icon name="check" size={13} strokeWidth={3} />}
          </button>
          <span className={cn("min-w-0 flex-1 truncate text-sm", it.done ? "text-muted line-through decoration-line-strong" : "font-medium text-fg")}>
            {it.label}
          </span>
          {it.meta && <span className="hidden shrink-0 text-xs text-muted sm:inline">{it.meta}</span>}
          {it.aside && <span className="shrink-0">{it.aside}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* ReminderCard — "RESTOCK NOW" call-out with a status bar              */
/* ------------------------------------------------------------------ */

export function ReminderCard({
  title,
  note,
  chip,
  status,
  action,
  className,
}: {
  /** Short uppercase call to action */
  title: ReactNode;
  /** Side note; wrap the key words in <b> */
  note?: ReactNode;
  /** Left chip in the status bar, e.g. "4 items" */
  chip?: ReactNode;
  /** Text in the status bar */
  status?: ReactNode;
  /** Round button at the end of the status bar */
  action?: { icon: IconName; label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col justify-between gap-6 rounded-lg bg-surface p-6 shadow-sm", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-2xl leading-[1.05] font-medium tracking-[-0.02em] uppercase sm:text-[28px]">{title}</p>
        {note && <p className="max-w-[180px] text-right text-[13px] leading-snug text-muted [&_b]:font-semibold [&_b]:text-fg">{note}</p>}
      </div>
      {(chip || status || action) && (
        <div className="flex items-center gap-3 rounded-full bg-surface-2 p-1.5">
          {chip && <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold tabular-nums">{chip}</span>}
          {status && <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted">{status}</span>}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              aria-label={action.label}
              title={action.label}
              className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-fg hover:bg-accent hover:text-accent-fg focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Icon name={action.icon} size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Card section title with the accent square — for custom cards. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-sm font-semibold text-fg", className)}>
      <Marker />
      {children}
    </p>
  );
}
