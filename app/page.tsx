import { Hero } from "@/components/home/hero";
import { HallOfFame } from "@/components/home/hall-of-fame";
import { TwitchSection } from "@/components/home/twitch-section";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="border-t border-white/10 bg-[#060606] py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
          <GlassCard>
            <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              Pro koho
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Střední školy (SŠ), vysoké školy (VŠ) a nově i základní školy
              (ZŠ). Turnaj je vázán na IT vzdělávání — profesionální přístup k
              organizaci a pravidům.
            </p>
          </GlassCard>
          <GlassCard delay={0.06}>
            <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              Automatizace
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Faceit ELO pro férové nasazení, notifikace pro administrátory a
              e-maily pro kapitány. Schválené týmy získají odkaz do Faceit
              kvalifikace.
            </p>
          </GlassCard>
          <GlassCard delay={0.12} className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              Komunikace
            </h3>
            <p className="mt-2 text-sm font-medium text-[#39FF14]">
              Oficiální komunikace výhradně přes Discord — ne WhatsApp.
            </p>
            <GlowButton href="/registrace" className="mt-4 !text-xs">
              Účet kapitána
            </GlowButton>
          </GlassCard>
        </div>
        <p className="mx-auto mt-10 max-w-3xl px-4 text-center text-sm text-slate-500 sm:px-6">
          Potřebuješ doplnit soupisku nebo najít spoluhráče?{" "}
          <Link
            href="/hledam"
            className="text-[#39FF14] underline-offset-4 hover:underline"
          >
            Nástěnka LFG
          </Link>
          .
        </p>
      </section>
      <HallOfFame />
      <TwitchSection />
    </>
  );
}
