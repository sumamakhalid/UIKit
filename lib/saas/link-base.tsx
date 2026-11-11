"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The URL prefix of the current panel: "/t/khalid-wire" or "/admin" in path mode,
 * "" on a subdomain (middleware already put us under the right route).
 */
const BaseCtx = createContext<string>("");

export function LinkBaseProvider({ base, children }: { base: string; children: ReactNode }) {
  return <BaseCtx.Provider value={base}>{children}</BaseCtx.Provider>;
}

/** to("/inventory") → "/t/khalid-wire/inventory" (path mode) or "/inventory" (subdomain) */
export function useLinkTo() {
  const base = useContext(BaseCtx);
  return (path = "") => {
    const p = path && !path.startsWith("/") ? "/" + path : path;
    return base + p || "/";
  };
}
