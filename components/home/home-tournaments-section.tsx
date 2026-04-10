import Link from "next/link";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";

/** Úvodní stránka — náhled sekce turnajů (obsah doplníš v /turnaje a v administraci). */
export function HomeTournamentsSection() {
  return (
    <section
      className="relative border-t border-white/10 bg-[#050505] py-16 sm:py-20"
      aria-labelledby="home-tournaments-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(57,255,20,0.06),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="home-tournaments-heading"
          className="font-[family-name:var(--font-bebas)] text-center text-3xl uppercase tracking-[0.2em] text-white sm:text-4xl"
        >
          Turnaje
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500">
          Přehled probíhajících a chystaných turnajů — prize pool, pravidla a přihlášené
          týmy. Obsah přidává administrace; veřejný výpis najdeš na samostatné stránce.
        </p>
        <GlassCard className="mx-auto mt-10 max-w-xl text-center" delay={0}>
          <p className="text-sm text-slate-400">
            Kalendář turnajů se naplňuje postupně. Mezitím sleduj oznámení na webu a na{" "}
            <strong className="text-[#39FF14]">Discordu</strong>.
          </p>
          <GlowButton href="/turnaje" className="mt-6 !justify-center">
            Přejít na turnaje
          </GlowButton>
        </GlassCard>
      </div>
    </section>
  );
}
