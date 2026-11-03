"use client";

import { usePathname } from "next/navigation";

/** Pages where the big "Invest. Trade. Grow." band above the footer is hidden. */
const HIDDEN_ON = ["/login", "/register", "/forgot-password", "/reset-password"];

export function FooterCta({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (HIDDEN_ON.some((p) => path.startsWith(p))) return null;
  return <>{children}</>;
}