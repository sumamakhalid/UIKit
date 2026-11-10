import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "./icon";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** Round arrow badge at the end, like "Weekly →" */
  arrow?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  accent: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "bg-surface-2 text-fg hover:bg-primary-soft",
  outline: "border border-line bg-surface text-fg hover:border-line-strong hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
  danger: "bg-danger text-danger-fg hover:brightness-95 focus-visible:ring-danger-ring",
  link: "h-auto! px-0! text-fg underline underline-offset-4 decoration-line-strong hover:decoration-fg active:scale-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

const iconSize: Record<ButtonSize, number> = { sm: 15, md: 17, lg: 18 };
const arrowBox: Record<ButtonSize, string> = { sm: "size-6 -mr-2", md: "size-7 -mr-3", lg: "size-8 -mr-4" };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, leftIcon, rightIcon, arrow, fullWidth, className, children, disabled, type = "button", ...rest },
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
      {arrow && !loading && (
        <span
          aria-hidden="true"
          className={cn(
            "ml-1 flex shrink-0 items-center justify-center rounded-full",
            arrowBox[size],
            variant === "primary" ? "bg-primary-fg text-primary" : "bg-primary text-primary-fg",
          )}
        >
          <Icon name="arrow-right" size={iconSize[size] - 3} strokeWidth={2.2} />
        </span>
      )}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Required for screen readers, also shown as a tooltip */
  label: string;
  variant?: Exclude<ButtonVariant, "link"> | "soft";
  size?: ButtonSize;
}

const squareSizes: Record<ButtonSize, string> = { sm: "size-8", md: "size-10", lg: "size-12" };
const iconVariants: Record<NonNullable<IconButtonProps["variant"]>, string> = {
  ...variants,
  soft: "bg-surface-2 text-fg hover:bg-primary-soft",
} as Record<NonNullable<IconButtonProps["variant"]>, string>;

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
      className={cn(base, iconVariants[variant], squareSizes[size], "shrink-0", className)}
      {...rest}
    >
      <Icon name={icon} size={iconSize[size]} />
    </button>
  );
});
