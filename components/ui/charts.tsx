import type { ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { Delta } from "./display";

export interface ChartPoint {
  label: string;
  value: number;
  /** Text for the hover title, defaults to "label: value" */
  title?: string;
}

/* ------------------------------------------------------------------ */
/* BarChart — rounded pill bars, one highlighted with a value bubble    */
/* ------------------------------------------------------------------ */

export interface BarChartProps {
  data: ChartPoint[];
  /** Index of the bar with the marker + bubble. Defaults to the highest bar. Pass -1 for none. */
  highlight?: number;
  /** Extra bars to paint in the accent colour (e.g. the current period) */
  accent?: number[];
  /** "soft" grey bars (default) or "ink" black bars */
  variant?: "soft" | "ink";
  height?: number;
  /** Format values on the axis and in the bubble */
  format?: (value: number) => string;
  /** Show every n-th x label (1 = all) */
  xLabelEvery?: number;
  /** Hide the y axis */
  hideAxis?: boolean;
  /** Accessible summary, e.g. "Monthly sales, highest in March" */
  label: string;
  className?: string;
}

function niceMax(max: number) {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

export function BarChart({
  data,
  highlight,
  accent = [],
  variant = "soft",
  height = 200,
  format = (v) => formatNumber(v),
  xLabelEvery = 1,
  hideAxis,
  label,
  className,
}: BarChartProps) {
  const rawMax = Math.max(0, ...data.map((d) => d.value));
  const max = niceMax(rawMax);
  const hi = highlight ?? data.findIndex((d) => d.value === rawMax);
  const ticks = [max, max / 2, 0];

  return (
    <figure role="img" aria-label={label} className={cn("w-full", className)}>
      <div className="flex gap-3">
        {!hideAxis && (
          <div className="relative w-10 shrink-0 text-right text-[11px] text-muted tabular-nums" style={{ height }}>
            {ticks.map((t, i) => (
              <span key={i} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
                {format(t)}
              </span>
            ))}
          </div>
        )}
        <div className="relative min-w-0 flex-1" style={{ height }}>
          {/* top guide */}
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-line-strong/50" />
          <div className="absolute inset-0 flex items-end" style={{ gap: `max(4px, ${40 / data.length}%)` }}>
            {data.map((d, i) => {
              const pct = Math.max(6, (d.value / max) * 100);
              const isHi = i === hi;
              const isAccent = isHi || accent.includes(i);
              return (
                <div key={i} className="relative flex h-full min-w-0 flex-1 items-end" title={d.title ?? `${d.label}: ${format(d.value)}`}>
                  <div
                    className={cn(
                      "relative w-full animate-grow rounded-full",
                      isAccent ? "bg-accent" : variant === "ink" ? "bg-primary" : "bg-surface-2 dark:bg-primary-soft",
                    )}
                    style={{ height: `${pct}%`, animationDelay: `${i * 25}ms` }}
                  >
                    {isHi && (
                      <>
                        <span className="absolute top-1 left-1/2 aspect-square w-[70%] max-w-4 -translate-x-1/2 rounded-full border-2 border-surface bg-accent" />
                        <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-fg shadow-md tabular-nums">
                          {format(d.value)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <figcaption className="mt-2 flex gap-3">
        {!hideAxis && <span className="w-10 shrink-0" />}
        <span className="flex min-w-0 flex-1" style={{ gap: `max(4px, ${40 / data.length}%)` }}>
          {data.map((d, i) => (
            <span
              key={i}
              className={cn(
                "min-w-0 flex-1 overflow-visible text-center text-[11px] whitespace-nowrap text-muted",
                data.length > 8 && i % 2 === 1 && "max-sm:invisible",
              )}
            >
              {i % xLabelEvery === 0 ? d.label : ""}
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* DotChart — thin stems with a dot at each value (weekly view)         */
/* ------------------------------------------------------------------ */

export interface DotChartProps {
  data: ChartPoint[];
  height?: number;
  /** Chip over the highest dot, e.g. "278%" */
  peakChip?: ReactNode;
  format?: (value: number) => string;
  label: string;
  className?: string;
}

export function DotChart({ data, height = 140, peakChip, format = (v) => formatNumber(v), label, className }: DotChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const peak = data.findIndex((d) => d.value === max);
  return (
    <figure role="img" aria-label={label} className={cn("w-full", className)}>
      <div className="flex justify-between gap-1 pt-8" style={{ height: height + 32 }}>
        {data.map((d, i) => {
          const pct = 12 + (d.value / max) * 80;
          return (
            <div key={i} className="relative flex-1" title={d.title ?? `${d.label}: ${format(d.value)}`}>
              <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-surface-2 dark:bg-primary-soft" />
              <span
                className="absolute left-1/2 size-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/30"
                style={{ bottom: `${pct}%` }}
              />
              {i === peak && peakChip && (
                <span className="absolute left-1/2 -translate-x-1/2" style={{ bottom: `calc(${pct}% + 18px)` }}>
                  {typeof peakChip === "string" ? <Delta value={peakChip} /> : peakChip}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <figcaption className="mt-3 flex justify-between gap-1">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-xs font-semibold text-fg">
            {d.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Meter — a horizontal level bar (stock level, target progress)        */
/* ------------------------------------------------------------------ */

export function Meter({
  value,
  max = 100,
  tone = "accent",
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: "accent" | "ink" | "warning" | "danger";
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = { accent: "bg-accent", ink: "bg-primary", warning: "bg-warning", danger: "bg-danger" }[tone];
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2 dark:bg-primary-soft", className)}
    >
      <div className={cn("h-full rounded-full transition-[width] duration-500", fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Small row of dots — a step / page indicator (● ● ◉ ●). */
export function StepDots({ count, active, onChange, className }: { count: number; active: number; onChange?: (i: number) => void; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Step ${i + 1}`}
          aria-current={i === active || undefined}
          onClick={() => onChange?.(i)}
          className={cn(
            "rounded-full transition-all focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
            i === active ? "size-7 border-[6px] border-current bg-transparent" : "size-4 bg-current opacity-25 hover:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
