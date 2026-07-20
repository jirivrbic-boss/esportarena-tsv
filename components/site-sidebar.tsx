"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { PortalSidebarNav } from "@/components/portal-sidebar-nav";
import { SiteSocialLinks } from "@/components/site-social-links";
import { GlowButton } from "@/components/glow-button";
import { isClientAdminEmail } from "@/lib/admin-client";
import { sidebarNavForPath } from "@/lib/portal-hub";
import { TOURNAMENT_BRAND_LOGO } from "@/lib/tournament-game-logos";

export function SiteSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { items, brandHref, brandTitle, brandSubtitle } = sidebarNavForPath(pathname);
  const isPortal =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const showAdmin = Boolean(user && isClientAdminEmail(user.email));
  const portalHref = showAdmin ? "/admin" : "/dashboard";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-dvh w-56 flex-col border-r border-white/10 bg-[#080808] sm:w-60">
      <Link
        href={brandHref}
        className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-4"
      >
        <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/10">
          <Image
            src={TOURNAMENT_BRAND_LOGO}
            alt=""
            fill
            className="object-contain p-0.5"
            sizes="36px"
            priority
          />
        </div>
        <div className="leading-tight">
          <span className="font-[family-name:var(--font-bebas)] text-lg tracking-wider text-white">
            {brandTitle}
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-[#39FF14]">
            {brandSubtitle}
          </span>
        </div>
      </Link>

      <PortalSidebarNav items={items} />

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-widest text-slate-600">
          Sledujte nás
        </p>
        <SiteSocialLinks compact />
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 p-3">
        {user ? (
          <>
            {!isPortal ? (
              <Link
                href={portalHref}
                className="rounded-md px-2 py-1.5 text-center text-xs font-medium text-[#39FF14] transition-colors hover:bg-[#39FF14]/10"
              >
                {showAdmin ? "Admin přehled" : "Kapitánský přehled"}
              </Link>
            ) : null}
            {!isPortal ? (
              <Link
                href="/dashboard/profil"
                className="rounded-md px-2 py-1.5 text-center text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                Profil kapitána
              </Link>
            ) : null}
            {isPortal ? (
              <Link
                href="/"
                className="rounded-md px-2 py-1.5 text-center text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
              >
                Veřejná úvodní stránka
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border border-red-500/45 bg-red-950/50 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-red-200 shadow-[0_0_0_1px_rgba(0,0,0,0.3)_inset] transition-colors hover:border-red-400/70 hover:bg-red-950/80 hover:text-white"
            >
              Odhlásit se
            </button>
          </>
        ) : (
          <>
            <GlowButton href="/prihlaseni" variant="ghost" className="w-full !justify-center !text-xs">
              Přihlášení
            </GlowButton>
            <GlowButton href="/registrace" className="w-full !justify-center !text-xs">
              Registrace kapitána
            </GlowButton>
          </>
        )}
      </div>
    </aside>
  );
}
