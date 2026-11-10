import { appConfig } from "./config";

/** Join class names, skipping falsy values. */
export function cn(...classes: unknown[]): string {
  return classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
}

/** 12500 -> "12,500" */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(appConfig.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 12500 -> "Rs 12,500" */
export function formatMoney(value: number, decimals = 0): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}${appConfig.currency} ${formatNumber(Math.abs(value), decimals)}`;
}

/** 12.5 -> "12.50 kg" */
export function formatWeight(value: number, decimals = appConfig.weightDecimals): string {
  return `${formatNumber(value, decimals)} ${appConfig.weightUnit}`;
}

/** Quantity with the right unit for how the item is sold. */
export function formatQty(value: number, sellBy: "weight" | "unit"): string {
  return sellBy === "weight" ? formatWeight(value) : `${formatNumber(value)} ${appConfig.pieceUnit}`;
}

/** Round money/weight maths safely: round(12.345, 2) -> 12.35 */
export function round(value: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * f) / f;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

/** Short money for charts and tiles: 1245800 -> "12.5L", 95000 -> "95K", 31500000 -> "3.2Cr" (lakh / crore). */
export function formatCompact(value: number): string {
  const a = Math.abs(value);
  const fmt = (n: number, s: string) => `${n >= 100 ? Math.round(n) : Number(n.toFixed(1))}${s}`;
  if (a >= 1e7) return fmt(value / 1e7, "Cr");
  if (a >= 1e5) return fmt(value / 1e5, "L");
  if (a >= 1e3) return fmt(value / 1e3, "K");
  return formatNumber(value);
}
