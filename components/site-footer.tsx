import Link from "next/link";
import { SITE_COPY, ANNOUNCEMENTS_HREF } from "@/lib/site-copy";
import { SiteSocialLinks } from "@/components/site-social-links";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#050505] py-12 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between lg:flex-nowrap sm:gap-12 sm:px-6">
        <div className="sm:max-w-xs">
          <p className="font-[family-name:var(--font-bebas)] text-2xl tracking-[0.14em] text-white">
            ESPORTARENA TSV
          </p>
          <p className="mt-2 max-w-md text-sm leading-relaxed">
            Portál ligy ESPORTARENA TSV — turnaj pro základní, střední, vyšší odborné a vysoké
            školy v Česku i na Slovensku. Čtyři herní disciplíny, jedna registrace studentů,
            pravidla podle her. Propojení s IT vzděláváním (sítě, správa, multimédia).
          </p>
          <SiteSocialLinks className="mt-4" />
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-semibold text-white">Turnaj</p>
          <Link
            href="/hry"
            className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Herní disciplíny
          </Link>
          <Link
            href="/o-nas"
            className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            O nás
          </Link>
          <Link
            href="/kontakt"
            className="text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Kontakt
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Podpora</p>
          <Link
            href="/podpora"
            className="inline-block text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Centrum podpory
          </Link>
          <p className="max-w-xs pt-1 text-xs leading-relaxed text-slate-500">
            Časté dotazy, účet, týmy a technická nápověda.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Novinky</p>
          <Link
            href={ANNOUNCEMENTS_HREF}
            className="inline-block text-[#39FF14] underline-offset-4 hover:underline"
          >
            Oznámení na webu
          </Link>
          <p className="max-w-xs pt-1 text-xs leading-relaxed text-slate-500">
            {SITE_COPY.announcementsPrimary}
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-white">Pravidla a dokumenty</p>
          <Link
            href="/pravidla"
            className="inline-block text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Pravidla podle her
          </Link>
          <Link
            href="/dokumenty"
            className="mt-2 inline-block text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Dokumenty ke stažení
          </Link>
          <Link
            href="/gdpr"
            className="mt-2 inline-block text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Ochrana údajů (GDPR)
          </Link>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} EsportArena Plzeň · Sezóna 4
      </p>
    </footer>
  );
}
