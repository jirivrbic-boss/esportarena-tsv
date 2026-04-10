import Link from "next/link";
import { GlassCard } from "@/components/glass-card";
import { GlowButton } from "@/components/glow-button";
import type { AboutCard } from "@/lib/cms-defaults";

export function HomeAboutSection({ cards }: { cards: AboutCard[] }) {
  const list = cards.length ? cards : [];
  const delays = [0, 0.06, 0.12];
  return (
    <section className="border-t border-white/10 bg-[#060606] py-16">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {list.map((card, i) => (
          <GlassCard
            key={`${card.title}-${i}`}
            delay={delays[i] ?? i * 0.05}
            className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}
          >
            <h3 className="font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
              {card.title}
            </h3>
            {i === 2 ? (
              <p className="mt-2 text-sm font-medium text-[#39FF14] whitespace-pre-line">
                {card.body}
              </p>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-slate-400 whitespace-pre-line">
                {card.body}
              </p>
            )}
            {i === 2 ? (
              <GlowButton href="/registrace" className="mt-4 !text-xs">
                Účet kapitána
              </GlowButton>
            ) : null}
          </GlassCard>
        ))}
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
  );
}
