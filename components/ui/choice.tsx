"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/* ------------------------------------------------------------------ */
/* Checkbox                                                            */
/* ------------------------------------------------------------------ */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate = false, className, disabled, ...rest },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inner.current as HTMLInputElement);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cn("inline-flex items-start gap-2.5", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer", className)}>
      <span className="relative mt-px inline-flex">
        <input ref={inner} type="checkbox" disabled={disabled} className="peer sr-only" {...rest} />
        <span
          aria-hidden="true"
          className={cn(
            "relative flex size-[18px] items-center justify-center rounded-[5px] border border-line-strong bg-surface text-primary-fg shadow-sm transition-colors",
            "peer-checked:border-primary peer-checked:bg-primary peer-indeterminate:border-primary peer-indeterminate:bg-primary",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-ring",
            "[&>svg]:opacity-0 peer-checked:[&>svg.check]:opacity-100 peer-indeterminate:[&>svg.dash]:opacity-100 peer-indeterminate:[&>svg.check]:opacity-0!",
          )}
        >
          <Icon name="check" size={13} strokeWidth={3} className="check absolute" />
          <Icon name="minus" size={13} strokeWidth={3} className="dash absolute" />
        </span>
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium leading-5 text-fg">{label}</span>}
          {description && <span className="text-xs text-muted">{description}</span>}
        </span>
      )}
    </label>
  );
});

/* ------------------------------------------------------------------ */
/* Switch                                                              */
/* ------------------------------------------------------------------ */

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Switch({ checked, onCheckedChange, label, description, disabled, id, className }: SwitchProps) {
  return (
    <label className={cn("inline-flex items-start gap-3", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative mt-px inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full transition-colors",
          "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
          checked ? "bg-primary" : "bg-line-strong",
        )}
      >
        <span
          className={cn(
            "inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[2px]",
          )}
        />
      </button>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className="text-sm font-medium leading-5 text-fg">{label}</span>}
          {description && <span className="text-xs text-muted">{description}</span>}
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* RadioGroup                                                          */
/* ------------------------------------------------------------------ */

export interface RadioOption<V extends string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<V extends string> {
  name: string;
  value: V;
  onChange: (value: V) => void;
  options: RadioOption<V>[];
  /** "card" renders bordered tiles — good for plan/type choices */
  variant?: "plain" | "card";
  className?: string;
}

export function RadioGroup<V extends string>({ name, value, onChange, options, variant = "plain", className }: RadioGroupProps<V>) {
  return (
    <div role="radiogroup" className={cn(variant === "card" ? "grid gap-2 sm:grid-cols-2" : "flex flex-col gap-2.5", className)}>
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label
            key={o.value}
            className={cn(
              "flex items-start gap-2.5",
              o.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              variant === "card" &&
                cn(
                  "rounded-lg border p-3.5 transition-colors",
                  checked ? "border-fg bg-accent-soft" : "border-line bg-surface hover:bg-surface-2",
                ),
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                "mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full border bg-surface shadow-sm transition-colors",
                "peer-focus-visible:ring-4 peer-focus-visible:ring-ring",
                checked ? "border-primary" : "border-line-strong",
              )}
            >
              <span className={cn("size-2 rounded-full bg-primary transition-transform", checked ? "scale-100" : "scale-0")} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium leading-5 text-fg">{o.label}</span>
              {o.description && <span className="text-xs text-muted">{o.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SegmentedControl — e.g. "By weight | By unit", "Day | Week | Month" */
/* ------------------------------------------------------------------ */

export interface SegmentedControlProps<V extends string> {
  value: V;
  onChange: (value: V) => void;
  options: { value: V; label: ReactNode }[];
  size?: "sm" | "md";
  fullWidth?: boolean;
  "aria-label"?: string;
  className?: string;
}

export function SegmentedControl<V extends string>({
  value,
  onChange,
  options,
  size = "md",
  fullWidth,
  className,
  ...aria
}: SegmentedControlProps<V>) {
  return (
    <div
      role="radiogroup"
      className={cn("inline-flex rounded-full bg-surface-2 p-1", fullWidth && "flex w-full", className)}
      {...aria}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors",
              "focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
              size === "sm" ? "h-7 px-3 text-xs" : "h-9 px-4 text-[13px]",
              active ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
