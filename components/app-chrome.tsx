"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (isDashboard) {
    return (
      <div className="flex min-h-screen flex-1 flex-col bg-[#050505]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
