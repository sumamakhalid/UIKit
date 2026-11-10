import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  fullWidth?: boolean;
  children?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow] duration-150 " +
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg shadow-sm hover:bg-primary-hover",
  secondary: "bg-primary-soft text-primary hover:bg-primary-soft/70",
  outline: "border border-line-strong bg-surface text-fg shadow-sm hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger text-danger-fg shadow-sm hover:brightness-95 focus-visible:ring-danger-ring",
  link: "h-auto! px-0! text-primary underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

const iconSize: Record<ButtonSize, number> = { sm: 15, md: 17, lg: 18 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, leftIcon, rightIcon, fullWidth, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {loading ? <Spinner size={iconSize[size]} /> : leftIcon && <Icon name={leftIcon} size={iconSize[size]} />}
      {children}
      {rightIcon && !loading && <Icon name={rightIcon} size={iconSize[size]} />}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required for screen readers, also shown as a tooltip */
  label: string;
  variant?: Exclude<ButtonVariant, "link">;
  size?: ButtonSize;
}

const squareSizes: Record<ButtonSize, string> = { sm: "size-8", md: "size-10", lg: "size-12" };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = "ghost", size = "md", className, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(base, variants[variant], squareSizes[size], "shrink-0", className)}
      {...rest}
    >
      <Icon name={icon} size={iconSize[size]} />
    </button>
  );
});
