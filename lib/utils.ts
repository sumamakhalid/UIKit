import { appConfig } from "./config";

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
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
