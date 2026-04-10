"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const nav = [
  { href: "/dashboard", label: "Přehled", exact: true },
  { href: "/dashboard/oznameni", label: "Oznámení" },
  { href: "/dashboard/pravidla", label: "Pravidla" },
  { href: "/dashboard/hledam", label: "Hledám tým / hráče" },
  { href: "/dashboard/tym/registrace", label: "Registrace týmu" },
  { href: "/dashboard/profil", label: "Profil kapitána" },
];

export function CaptainSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-[#080808] md:w-60 md:border-b-0 md:border-r">
      <Link
        href="/"
        className="flex items-center gap-2 border-b border-white/10 px-4 py-4"
      >
        <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-white/10">
          <Image
            src="/fotky/tournament%20logo.png"
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
      <nav className="flex flex-1 flex-row flex-wrap gap-1 p-2 md:flex-col md:flex-nowrap">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:py-2 ${
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
      <div className="flex flex-wrap gap-2 border-t border-white/10 p-3">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-white md:block"
        >
          Veřejná úvodní stránka
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-xs font-medium text-red-400 hover:text-red-300"
        >
          Odhlásit se
        </button>
      </div>
    </aside>
  );
}
