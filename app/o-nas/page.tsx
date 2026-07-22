import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard } from "@/components/glass-card";
import { getPageContent } from "@/lib/get-cms-page";
import type { HomeCms } from "@/lib/cms-defaults";
import { ABOUT_JOIN, ABOUT_ORGANIZER, ABOUT_SEASON } from "@/lib/site-info";
import { SITE_COPY } from "@/lib/site-copy";
import { pageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = pageMetadata({
  title: "O nás",
  description:
    "Kdo pořádá ESPORTARENA TSV a jak propojujeme studentský esport s IT vzděláváním.",
  path: "/o-nas",
});

const EXTRA_SECTIONS = [ABOUT_ORGANIZER, ABOUT_SEASON, ABOUT_JOIN] as const;

export default async function ONasPage() {
  const cms = (await getPageContent("home")) as HomeCms;

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        O nás
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-300">
        {cms.heroTagline} — {cms.heroTitle}{" "}
        <span className="text-[#39FF14]">{cms.heroTitleAccent}</span>
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
        {cms.heroSubtitle}. {cms.heroPoweredBy}.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cms.aboutCards.map((card, i) => (
          <GlassCard key={card.title} delay={i * 0.05}>
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400 whitespace-pre-line">
              {card.body}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid gap-6">
        {EXTRA_SECTIONS.map((section, i) => (
          <GlassCard key={section.title} delay={0.15 + i * 0.05}>
            <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{section.body}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-6" delay={0.3}>
        <h2 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
          Oficiální komunikace
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          {SITE_COPY.announcementsPrimary} {SITE_COPY.noWhatsApp}
        </p>
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/oznameni" className="text-[#39FF14] underline-offset-2 hover:underline">
            Oznámení na webu
          </Link>
          <Link href="/hry" className="text-[#39FF14] underline-offset-2 hover:underline">
            Herní disciplíny
          </Link>
          <Link href="/kontakt" className="text-[#39FF14] underline-offset-2 hover:underline">
            Kontakt
          </Link>
          <Link href="/dokumenty" className="text-[#39FF14] underline-offset-2 hover:underline">
            Dokumenty
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
