"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalNavItem } from "@/lib/portal-hub";

function isNavActive(pathname: string, item: PortalNavItem): boolean {
  if (item.exact) return pathname === item.href;
  if (item.matchPrefix) {
    return (
      pathname === item.matchPrefix ||
      pathname.startsWith(`${item.matchPrefix}/`)
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function PortalSidebarNav({ items }: { items: PortalNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
      {items.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href + item.label}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-[#39FF14]/15 text-[#39FF14]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
