"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";
import { controlFrame, controlSizes, invalidFrame } from "./input";

export interface Option<V extends string = string> {
  value: V;
  label: string;
  /** Second line in SearchSelect, e.g. "Stock: 240 kg" */
  description?: string;
  /** Right-aligned extra, e.g. the rate */
  meta?: ReactNode;
  disabled?: boolean;
}

/* ------------------------------------------------------------------ */
/* Select — native, fast, accessible. Use for short fixed lists.       */
/* ------------------------------------------------------------------ */

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: Option[];
  placeholder?: string;
  invalid?: boolean;
  size?: keyof typeof controlSizes;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, placeholder, invalid, size = "md", className, wrapperClassName, ...rest },
  ref,
) {
  return (
    <div className={cn(controlFrame, controlSizes[size], "relative", invalid && invalidFrame, wrapperClassName)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-full w-full cursor-pointer appearance-none rounded-md bg-transparent pr-9 pl-3 outline-none disabled:cursor-not-allowed",
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" size={16} className="pointer-events-none absolute right-3 text-subtle" />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* SearchSelect — type to filter. Use for items, customers, suppliers. */
/* ------------------------------------------------------------------ */

export interface SearchSelectProps {
  options: Option[];
  value: string | null;
  onChange: (value: string | null, option: Option | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: ReactNode;
  invalid?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  size?: keyof typeof controlSizes;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
  /** Extra row at the bottom, e.g. "+ Add new customer" */
  footer?: ReactNode;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No matches",
  invalid,
  disabled,
  clearable,
  size = "md",
  id,
  className,
  footer,
  ...aria
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    requestAnimationFrame(() => searchRef.current?.focus());
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (o: Option) => {
    if (o.disabled) return;
    onChange(o.value, o);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || (e.key.length === 1 && /\w/.test(e.key))) {
            setOpen(true);
            if (e.key.length === 1) setQuery(e.key);
          }
        }}
        className={cn(
          controlFrame,
          controlSizes[size],
          "justify-between gap-2 px-3 text-left focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          invalid && invalidFrame,
          open && "border-primary ring-3 ring-ring",
        )}
        {...aria}
      >
        <span className={cn("truncate", !selected && "text-subtle")}>{selected ? selected.label : placeholder}</span>
        <span className="flex items-center gap-1">
          {clearable && selected && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null, null);
              }}
              className="rounded p-0.5 text-subtle hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="x" size={14} />
            </span>
          )}
          <Icon name="chevrons-up-down" size={15} className="text-subtle" />
        </span>
      </button>

      {open && (
        <div className="absolute z-40 mt-1.5 w-full min-w-[240px] animate-pop-in overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Icon name="search" size={15} className="text-subtle" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) choose(filtered[active]); }
                else if (e.key === "Escape") { setOpen(false); }
              }}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">{emptyText}</li>}
            {filtered.map((o, i) => (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                data-index={i}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm",
                  i === active && "bg-surface-2",
                  o.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="flex w-4 shrink-0 justify-center text-primary">
                  {o.value === value && <Icon name="check" size={15} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{o.label}</span>
                  {o.description && <span className="block truncate text-xs text-muted">{o.description}</span>}
                </span>
                {o.meta && <span className="shrink-0 font-mono text-xs text-muted tabular-nums">{o.meta}</span>}
              </li>
            ))}
          </ul>
          {footer && <div className="border-t border-line p-1">{footer}</div>}
        </div>
      )}
    </div>
  );
}
