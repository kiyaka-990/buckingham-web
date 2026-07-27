"use client";

import { usePathname } from "next/navigation";

/** Hides storefront chrome (navbar, footer, overlays) on admin routes. */
export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
