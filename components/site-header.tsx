"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { GlowButton } from "@/components/glow-button";
import { isClientAdminEmail } from "@/lib/admin-client";

const publicLinks = [
  { href: "/", label: "Domů" },
  { href: "/turnaje", label: "Turnaje" },
  { href: "/oznameni", label: "Oznámení" },
  { href: "/dokumenty", label: "Dokumenty" },
  { href: "/hledam", label: "Hledám tým" },
  { href: "/tym/registrace", label: "Registrace týmu" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const showAdmin = Boolean(user && isClientAdminEmail(user.email));

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/10 bg-black/40 sm:h-10 sm:w-10">
            <Image
              src="/fotky/tournament%20logo.png"
              alt="ESPORTARENA TSV"
              fill
              className="object-contain p-1"
              sizes="40px"
              priority
            />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-[family-name:var(--font-bebas)] text-xl tracking-[0.12em] text-white">
              ESPORTARENA
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-[#39FF14]">
              TSV · S4
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {publicLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-[#39FF14]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={showAdmin ? "/admin" : "/dashboard"}
                className="hidden text-sm font-medium text-[#39FF14] hover:underline sm:inline"
              >
                Přehled
              </Link>
              <Link
                href="/dashboard/profil"
                className="hidden text-sm text-slate-300 hover:text-white sm:inline"
              >
                Profil
              </Link>
              <GlowButton
                variant="ghost"
                className="!px-3 !py-2 !text-xs"
                onClick={() => void signOut()}
              >
                Odhlásit
              </GlowButton>
            </>
          ) : (
            <>
              <GlowButton href="/prihlaseni" variant="ghost" className="!px-3 !py-2 !text-xs">
                Přihlášení
              </GlowButton>
              <GlowButton href="/registrace" className="hidden !px-3 !py-2 !text-xs sm:inline-flex">
                Registrace kapitána
              </GlowButton>
            </>
          )}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-[#39FF14] transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-[#39FF14] transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-[#39FF14] transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-[#080808] md:hidden"
          >
            <nav className="flex flex-col px-4 py-4">
              {publicLinks.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={closeMenu}
                    className={`rounded-md px-3 py-3 text-sm font-medium ${
                      active
                        ? "bg-[#39FF14]/10 text-[#39FF14]"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              {user ? (
                <Link
                  href={showAdmin ? "/admin" : "/dashboard"}
                  onClick={closeMenu}
                  className="mt-2 rounded-md px-3 py-3 text-sm font-medium text-[#39FF14] hover:bg-white/5"
                >
                  Přehled
                </Link>
              ) : null}
              {!user ? (
                <Link
                  href="/registrace"
                  onClick={closeMenu}
                  className="mt-2 rounded-md px-3 py-3 text-sm font-medium text-[#39FF14] hover:bg-white/5"
                >
                  Registrace kapitána
                </Link>
              ) : null}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
