/**
 * Per-business settings. Change these when you hand the system to a new client.
 * Colours live in app/globals.css (pick a [data-brand] preset or add one).
 */
export const appConfig = {
  businessName: "Khalid Wire Store",
  shortName: "KWS",
  /** Accent preset from globals.css: lime (default), mint, sky, peach, lilac */
  brand: "lime" as "lime" | "mint" | "sky" | "peach" | "lilac",
  locale: "en-PK",
  currency: "Rs",
  /** Unit used for items sold by weight */
  weightUnit: "kg",
  /** Decimal places shown for weights (3 = grams precision) */
  weightDecimals: 2,
  /** Unit used for items sold per piece */
  pieceUnit: "pcs",
};

export type AppConfig = typeof appConfig;
