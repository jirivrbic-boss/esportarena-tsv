"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { isClientAdminEmail } from "@/lib/admin-client";

const captainNav = [
  { href: "/dashboard", label: "Přehled", exact: true },
  { href: "/dashboard/tymy", label: "Týmy" },
  { href: "/dashboard/turnaje", label: "Turnaje" },
  { href: "/dashboard/oznameni", label: "Oznámení" },
  { href: "/dashboard/pravidla", label: "Pravidla" },
  { href: "/dashboard/hledam", label: "Hledám tým / hráče" },
  { href: "/dashboard/profil", label: "Profil kapitána" },
];

export function CaptainSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const admin = isClientAdminEmail(user?.email);
  const nav = admin
    ? [
        { href: "/admin", label: "Přehled administrace", exact: false },
        ...captainNav,
      ]
    : captainNav;

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
            : item.href === "/admin"
              ? pathname === "/admin" || pathname.startsWith("/admin/")
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`) ||
                (item.href === "/dashboard/tymy" &&
                  pathname.startsWith("/dashboard/tym")) ||
                (item.href === "/dashboard/turnaje" &&
                  (pathname === "/dashboard/turnaje" ||
                    pathname.startsWith("/dashboard/turnaje/")));
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
