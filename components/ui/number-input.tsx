"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { appConfig } from "@/lib/config";
import { controlFrame, controlSizes, invalidFrame } from "./input";

export interface NumberInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  /** Decimal places allowed (0 for pieces, 2–3 for kg) */
  decimals?: number;
  min?: number;
  max?: number;
  leading?: ReactNode;
  trailing?: ReactNode;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  size?: keyof typeof controlSizes;
  id?: string;
  name?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
  /** Focus this input first when it opens inside a Modal/Drawer */
  "data-autofocus"?: boolean;
  className?: string;
  /** Show the +/− step buttons */
  stepper?: boolean;
  step?: number;
}

const toText = (v: number | null, decimals: number) => (v === null || Number.isNaN(v) ? "" : formatNumber(v, decimals));

/**
 * Numeric input for quantities, weights and money.
 * Shows "12,500.00" when idle, plain "12500" while typing, and always
 * reports a real number (or null when empty) through onValueChange.
 */
export function NumberInput({
  value,
  onValueChange,
  decimals = 0,
  min,
  max,
  leading,
  trailing,
  placeholder = "0",
  invalid,
  disabled,
  required,
  size = "md",
  id,
  name,
  className,
  stepper,
  step = 1,
  ...aria
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(() => toText(value, decimals));

  useEffect(() => {
    if (!focused) setText(toText(value, decimals));
  }, [value, decimals, focused]);

  const clamp = (n: number) => {
    let v = n;
    if (min !== undefined) v = Math.max(min, v);
    if (max !== undefined) v = Math.min(max, v);
    return Number(v.toFixed(decimals));
  };

  const pattern = decimals > 0 ? new RegExp(`^-?\\d*(\\.\\d{0,${decimals}})?$`) : /^-?\d*$/;

  const handleChange = (raw: string) => {
    const cleaned = raw.replace(/,/g, "");
    if (!pattern.test(cleaned)) return;
    setText(cleaned);
    if (cleaned === "" || cleaned === "-" || cleaned === ".") onValueChange(null);
    else onValueChange(Number(cleaned));
  };

  const bump = (dir: 1 | -1) => {
    const next = clamp((value ?? 0) + dir * step);
    onValueChange(next);
    setText(focused ? String(next) : toText(next, decimals));
  };

  return (
    <div className={cn(controlFrame, controlSizes[size], invalid && invalidFrame, className)}>
      {stepper && (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
          onClick={() => bump(-1)}
          aria-label="Decrease"
          className="h-full shrink-0 rounded-l-md px-3 text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
        >
          −
        </button>
      )}
      {leading && <span className="ml-3 shrink-0 text-[13px] font-medium text-muted">{leading}</span>}
      <input
        id={id}
        name={name}
        type="text"
        inputMode={decimals > 0 ? "decimal" : "numeric"}
        autoComplete="off"
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        value={text}
        onFocus={(e) => {
          setFocused(true);
          setText(value === null ? "" : String(value));
          requestAnimationFrame(() => e.target.select());
        }}
        onBlur={() => {
          setFocused(false);
          if (value !== null) {
            const c = clamp(value);
            if (c !== value) onValueChange(c);
            setText(toText(c, decimals));
          } else setText("");
        }}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); bump(1); }
          if (e.key === "ArrowDown") { e.preventDefault(); bump(-1); }
        }}
        className={cn(
          "h-full w-full min-w-0 bg-transparent px-3 text-right font-mono tabular-nums outline-none placeholder:text-subtle disabled:cursor-not-allowed",
          leading && "pl-2",
          trailing && "pr-2",
        )}
        {...aria}
      />
      {trailing && <span className="mr-3 shrink-0 text-[13px] font-medium text-muted">{trailing}</span>}
      {stepper && (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
          onClick={() => bump(1)}
          aria-label="Increase"
          className="h-full shrink-0 rounded-r-md px-3 text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40"
        >
          +
        </button>
      )}
    </div>
  );
}

/** Convenience presets */
export function WeightInput(props: Omit<NumberInputProps, "decimals" | "trailing">) {
  return <NumberInput decimals={appConfig.weightDecimals} trailing={appConfig.weightUnit} min={0} {...props} />;
}

export function MoneyInput(props: Omit<NumberInputProps, "leading"> & { decimals?: number }) {
  return <NumberInput decimals={0} leading={appConfig.currency} min={0} {...props} />;
}
