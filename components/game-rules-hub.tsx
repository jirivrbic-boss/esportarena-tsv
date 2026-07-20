"use client";

import Link from "next/link";
import { GlassCard } from "@/components/glass-card";
import { GAMES } from "@/lib/games";
import { isSeasonActiveGame } from "@/lib/season-games";

type Props = {
  heading?: string;
  intro?: string;
};

export function GameRulesHub({
  heading = "Pravidla podle hry",
  intro = "Sezóna 4 je zaměřená na Counter-Strike 2 a League of Legends. U ostatních disciplín připravujeme pravidla a registraci na další sezónu.",
}: Props) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        {heading}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">{intro}</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {GAMES.map((g, i) => {
          const active = isSeasonActiveGame(g.id);
          return (
            <GlassCard
              key={g.id}
              delay={i * 0.06}
              className={active ? undefined : "border-amber-500/20 bg-amber-950/[0.08]"}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#39FF14]">
                  {g.shortLabel}
                </p>
                {active ? (
                  <span className="rounded-full bg-[#39FF14]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#39FF14]">
                    Sezóna 4
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                    Připravujeme
                  </span>
                )}
              </div>
              <h2 className="mt-2 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
                {g.label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {active
                  ? g.playerNickHint
                  : "Stránka pravidel a registrace se připravuje — klikni pro náhled."}
              </p>
              <Link
                href={`/pravidla/${g.id}`}
                className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline ${
                  active ? "text-[#39FF14]" : "text-amber-200"
                }`}
              >
                {active ? "Pravidla a dokumenty →" : "Zobrazit stav přípravy →"}
              </Link>
            </GlassCard>
          );
        })}
      </div>

      <p className="mt-12 text-center text-sm text-slate-500">
        Registrace týmů je v menu{" "}
        <Link href="/tym/registrace" className="text-[#39FF14] underline-offset-2 hover:underline">
          Registrace týmu
        </Link>{" "}
        (po přihlášení kapitána a dokončení profilu) — aktuálně pro CS2 a LoL.
      </p>
    </div>
  );
}
