"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { PortalSidebarNav } from "@/components/portal-sidebar-nav";
import { CAPTAIN_SIDEBAR_NAV } from "@/lib/portal-hub";
import { TOURNAMENT_BRAND_LOGO } from "@/lib/tournament-game-logos";

export function CaptainSidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="sticky top-0 flex w-56 shrink-0 flex-col self-stretch border-r border-white/10 bg-[#080808] sm:w-60">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 border-b border-white/10 px-4 py-4"
      >
        <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/10">
          <Image
            src={TOURNAMENT_BRAND_LOGO}
            alt=""
            fill
            className="object-contain p-0.5"
            sizes="36px"
          />
        </div>
        <div className="leading-tight">
          <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wider text-white">
            KAPITÁN
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-[#39FF14]">
            Portál
          </span>
        </div>
      </Link>
      <PortalSidebarNav items={CAPTAIN_SIDEBAR_NAV} />
      <div className="flex flex-col gap-2 border-t border-white/10 p-3">
        <Link
          href="/"
          className="rounded-md px-2 py-1.5 text-center text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          Veřejná úvodní stránka
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg border border-red-500/45 bg-red-950/50 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-red-200 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset] transition-colors hover:border-red-400/70 hover:bg-red-950/80 hover:text-white"
        >
          Odhlásit se
        </button>
      </div>
    </aside>
  );
}
