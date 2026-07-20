"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooter } from "@/components/site-footer";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortal =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#050505]">
      <SiteSidebar />
      <div className="flex min-h-screen min-w-0 flex-col pl-56 sm:pl-60">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {!isPortal ? <SiteFooter /> : null}
      </div>
    </div>
  );
}
