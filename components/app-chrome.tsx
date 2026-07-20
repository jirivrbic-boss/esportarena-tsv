"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { SiteSidebar } from "@/components/site-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { TOURNAMENT_BRAND_LOGO } from "@/lib/tournament-game-logos";

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const isPortal =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-[#050505]">
      <header className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-white/10 bg-[#050505]/92 px-3 backdrop-blur-xl safe-px lg:hidden">
        <button
          type="button"
          aria-expanded={navOpen}
          aria-controls="site-sidebar"
          aria-label={navOpen ? "Zavřít menu" : "Otevřít menu"}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5"
          onClick={() => setNavOpen((o) => !o)}
        >
          <span
            className={`block h-0.5 w-5 rounded-full bg-[#39FF14] transition-transform ${
              navOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-[#39FF14] transition-opacity ${
              navOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 rounded-full bg-[#39FF14] transition-transform ${
              navOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40">
            <Image
              src={TOURNAMENT_BRAND_LOGO}
              alt=""
              fill
              className="object-contain p-0.5"
              sizes="32px"
              priority
            />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="block truncate font-[family-name:var(--font-bebas)] text-lg tracking-[0.12em] text-white">
              ESPORTARENA
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#39FF14]">
              TSV · S4
            </span>
          </div>
        </Link>
      </header>

      {navOpen ? (
        <button
          type="button"
          aria-label="Zavřít menu"
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <SiteSidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-h-[calc(100dvh-3.5rem)] min-w-0 flex-col lg:min-h-screen lg:pl-60">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        {!isPortal ? <SiteFooter /> : null}
      </div>
    </div>
  );
}
