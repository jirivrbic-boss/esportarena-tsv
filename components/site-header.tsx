"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { GlowButton } from "@/components/glow-button";

const links = [
  { href: "/", label: "Domů" },
  { href: "/pravidla", label: "Pravidla" },
  { href: "/hledam", label: "Hledám tým / hráče" },
  { href: "/tym/registrace", label: "Registrace týmu" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
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
          {links.map((l) => {
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
                href="/profil"
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
              <GlowButton href="/registrace" className="!px-3 !py-2 !text-xs">
                Registrace kapitána
              </GlowButton>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
