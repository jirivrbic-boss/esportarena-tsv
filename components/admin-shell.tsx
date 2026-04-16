"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useAdminTempBypass } from "@/contexts/admin-temp-context";

const nav = [
  { href: "/admin", label: "Přehled", exact: true },
  { href: "/admin/turnaje", label: "Správa turnajů" },
  { href: "/admin/tymy", label: "Všechny týmy" },
  { href: "/admin#sprava-oznameni", label: "Oznámení", hash: true },
  { href: "/admin#tymy", label: "Čekající týmy", hash: true },
  { href: "/edit", label: "Úvodní stránka (CMS)" },
  { href: "/pravidla/edit", label: "Pravidla (CMS)" },
  { href: "/oznameni/edit", label: "Text oznámení (CMS)" },
  { href: "/dashboard", label: "Kapitánský portál" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const adminTemp = useAdminTempBypass();

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 flex-col">
      {adminTemp ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/35 bg-amber-950/55 px-4 py-2 text-xs text-amber-100">
          <span>
            <strong className="text-amber-50">Dočasný náhled</strong> — menu a
            stránky bez role admina. Zápis dat přes API funguje až po přihlášení
            účtem z ADMIN_EMAILS / super admin.
          </span>
          <button
            type="button"
            className="shrink-0 rounded-md border border-amber-400/40 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-50 hover:bg-amber-900/50"
            onClick={() =>
              void (async () => {
                await fetch("/api/auth/admin-temp-revoke", { method: "POST" });
                router.refresh();
                window.location.assign("/");
              })()
            }
          >
            Zrušit náhled
          </button>
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-[#080808] md:w-64 md:border-b-0 md:border-r">
        <Link
          href="/admin"
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
              ADMIN
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-[#39FF14]">
              Portál · S4
            </span>
          </div>
        </Link>
        <nav className="flex flex-1 flex-row flex-wrap gap-1 p-2 md:flex-col md:flex-nowrap">
          {nav.map((item) => {
            const active =
              item.hash === true
                ? false
                : item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href + item.label}
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
      <div className="min-w-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
