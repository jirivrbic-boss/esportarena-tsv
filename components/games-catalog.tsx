import Image from "next/image";
import Link from "next/link";
import { GlassCard } from "@/components/glass-card";
import { GAMES } from "@/lib/games";
import { GAME_CATALOG } from "@/lib/site-info";
import { isSeasonActiveGame } from "@/lib/season-games";
import { getTournamentGameLogo } from "@/lib/tournament-game-logos";

export function GamesCatalog() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2">
      {GAMES.map((game, i) => {
        const active = isSeasonActiveGame(game.id);
        const catalog = GAME_CATALOG[game.id];
        return (
          <GlassCard
            key={game.id}
            delay={i * 0.05}
            className={active ? undefined : "border-amber-500/20 bg-amber-950/[0.08]"}
          >
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2">
                <Image
                  src={getTournamentGameLogo(game.id)}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#39FF14]">
                    {game.shortLabel}
                  </p>
                  {active ? (
                    <span className="rounded-full bg-[#39FF14]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#39FF14]">
                      Aktivní · S4
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                      Připravujeme
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-[family-name:var(--font-bebas)] text-2xl tracking-wide text-white">
                  {game.label}
                </h2>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {catalog.format}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">{catalog.description}</p>
            <p className="mt-3 text-xs text-slate-500">
              Herní identita: {game.playerNickLabel} — {game.playerNickHint}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link
                href={`/pravidla/${game.id}`}
                className={`text-sm font-semibold underline-offset-4 hover:underline ${
                  active ? "text-[#39FF14]" : "text-amber-200"
                }`}
              >
                Pravidla →
              </Link>
              {active ? (
                <Link
                  href="/turnaje"
                  className="text-sm font-semibold text-slate-400 underline-offset-4 hover:text-white hover:underline"
                >
                  Turnaje →
                </Link>
              ) : null}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
