"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";

/* ------------------------------------------------------------------ */
/* Field: label + control + hint/error                                 */
/* ------------------------------------------------------------------ */

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** Optional element shown at the right of the label row (e.g. a link) */
  labelAside?: ReactNode;
  className?: string;
  /** A single form control. Field wires up id, aria-describedby and invalid for you. */
  children: ReactElement<{ id?: string; invalid?: boolean; "aria-describedby"?: string; required?: boolean }>;
}

export function Field({ label, hint, error, required, labelAside, className, children }: FieldProps) {
  const autoId = useId();
  const id = children.props.id ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        invalid: Boolean(error) || children.props.invalid,
        "aria-describedby": describedBy,
        required: required ?? children.props.required,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {(label || labelAside) && (
        <div className="flex items-baseline justify-between gap-2">
          {label && (
            <label htmlFor={id} className="text-[13px] font-semibold text-fg">
              {label}
              {required && <span className="ml-0.5 text-danger">*</span>}
            </label>
          )}
          {labelAside && <div className="text-xs text-muted">{labelAside}</div>}
        </div>
      )}
      {control}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-danger">
          <Icon name="alert" size={13} /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared control frame                                                */
/* ------------------------------------------------------------------ */

export const controlFrame =
  "flex w-full items-center rounded-md border bg-surface text-sm text-fg shadow-sm transition-[border-color,box-shadow] " +
  "border-line-strong hover:border-fg " +
  "focus-within:border-fg focus-within:ring-4 focus-within:ring-ring kit-control";

export const invalidFrame =
  "border-danger! hover:border-danger focus-within:ring-danger-ring! focus-within:border-danger!";

export const controlSizes = { sm: "h-8 text-[13px]", md: "h-10", lg: "h-12 text-[15px]" } as const;

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  invalid?: boolean;
  size?: keyof typeof controlSizes;
  /** Icon on the left */
  icon?: IconName;
  /** Text or node before the value, e.g. "Rs" */
  leading?: ReactNode;
  /** Text or node after the value, e.g. "kg" */
  trailing?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, size = "md", icon, leading, trailing, className, wrapperClassName, ...rest },
  ref,
) {
  return (
    <div className={cn(controlFrame, controlSizes[size], invalid && invalidFrame, wrapperClassName)}>
      {icon && <Icon name={icon} size={16} className="ml-3 shrink-0 text-subtle" />}
      {leading && <span className="ml-3 shrink-0 text-[13px] font-medium text-muted">{leading}</span>}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-full w-full min-w-0 rounded-md bg-transparent px-3 outline-none placeholder:text-subtle disabled:cursor-not-allowed",
          (icon || leading) && "pl-2",
          trailing && "pr-2",
          className,
        )}
        {...rest}
      />
      {trailing && <span className="mr-3 shrink-0 text-[13px] font-medium text-muted">{trailing}</span>}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Textarea                                                            */
/* ------------------------------------------------------------------ */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 3, ...rest },
  ref,
) {
  return (
    <div className={cn(controlFrame, "items-stretch", invalid && invalidFrame)}>
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        className={cn(
          "w-full resize-y rounded-md bg-transparent px-3 py-2.5 outline-none placeholder:text-subtle disabled:cursor-not-allowed",
          className,
        )}
        {...rest}
      />
    </div>
  );
});
