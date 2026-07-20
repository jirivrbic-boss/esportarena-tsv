import Image from "next/image";
import {
  formatMoney,
  formatPrizeAmount,
  PRIZE_POOL,
  PRIZE_POOL_TBD_MESSAGE,
} from "@/lib/prize-pool";
import { getTournamentGameLogo } from "@/lib/tournament-game-logos";
import { PrizePoolBars } from "@/components/home/prize-pool-bars";
import { publicFotky } from "@/lib/public-assets";

/** Rozdělení výher — layout inspirovaný turnajovými weby, barvy ESPORTARENA TSV. */
export function HomePrizePool() {
  const tbd = !PRIZE_POOL.announced;
  const totalFmt =
    PRIZE_POOL.total != null
      ? formatMoney(PRIZE_POOL.total, PRIZE_POOL.currency)
      : null;
  const highlight =
    PRIZE_POOL.overlayAmountHighlight != null
      ? formatMoney(PRIZE_POOL.overlayAmountHighlight, PRIZE_POOL.currency)
      : null;

  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-[#040404] py-16 sm:py-24"
      aria-labelledby="prize-pool-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(57,255,20,0.06),transparent_50%),radial-gradient(ellipse_at_90%_80%,rgba(57,255,20,0.04),transparent_40%)]" />
      <div className="pointer-events-none absolute bottom-6 right-8 hidden font-mono text-[10px] uppercase tracking-widest text-white/10 sm:block">
        ESPORTARENA · S{PRIZE_POOL.season}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="prize-pool-heading" className="sr-only">
          Prize pool a rozdělení výher
        </h2>

        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#39FF14]">
            Sezóna {PRIZE_POOL.season}
          </p>
          <p className="mt-2 font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
            PRIZE <span className="text-[#39FF14]">POOL</span>
          </p>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            {PRIZE_POOL_TBD_MESSAGE}
          </p>
        </div>

        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Levý sloupec: agent + překryvný text */}
          <div className="relative min-h-[min(52vh,520px)] overflow-hidden rounded-2xl border border-white/10 bg-[#060606] lg:min-h-[480px]">
            <div className="pointer-events-none absolute left-4 top-4 z-10 h-2 w-2 bg-[#39FF14] shadow-[0_0_12px_#39FF14]" />
            <div className="pointer-events-none absolute right-6 top-8 h-1 w-8 bg-[#39FF14]/40" />

            <div className="absolute inset-0 flex items-end justify-center overflow-hidden pt-8 pb-[28%] sm:pb-[26%] sm:pt-10 lg:pb-[24%] lg:pt-12">
              <Image
                src={publicFotky("agent.png")}
                alt=""
                width={900}
                height={900}
                className="h-[min(88%,420px)] w-auto max-w-[100%] origin-bottom object-contain object-bottom opacity-95 sm:h-[min(92%,460px)] sm:max-w-[105%] sm:-translate-y-1 lg:h-[min(96%,500px)] lg:max-w-[110%] lg:-translate-y-2"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
                draggable={false}
              />
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-6 sm:bottom-6">
              <div className="border border-white/15 bg-black/80 px-4 py-4 backdrop-blur-md sm:px-5 sm:py-5">
                {tbd ? (
                  <p className="font-[family-name:var(--font-bebas)] text-xl leading-snug tracking-wide text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.35)] sm:text-2xl">
                    {PRIZE_POOL.overlayTbdLine}
                  </p>
                ) : (
                  <p className="font-[family-name:var(--font-bebas)] text-xl leading-tight tracking-wide text-white sm:text-2xl md:text-3xl">
                    <span className="text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.35)]">
                      {highlight}
                    </span>{" "}
                    <span className="text-white">{PRIZE_POOL.overlaySentenceAfter}</span>
                  </p>
                )}
                {tbd ? null : (
                  <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:text-sm">
                    {PRIZE_POOL.registrationNote}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pravý sloupec: TBA celkem + hry + rozdělení */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Celkový prize pool
            </p>
            {tbd ? (
              <p
                className="mt-2 font-[family-name:var(--font-bebas)] text-6xl leading-none tracking-wide text-[#39FF14]/90 drop-shadow-[0_0_24px_rgba(57,255,20,0.2)] sm:text-7xl md:text-8xl"
                aria-label="Prize pool zatím nebyl oznámen"
              >
                ?
              </p>
            ) : (
              <p className="mt-2 font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-[#39FF14] drop-shadow-[0_0_24px_rgba(57,255,20,0.25)] sm:text-6xl md:text-7xl">
                {totalFmt}
              </p>
            )}
            {tbd ? (
              <p className="mt-2 text-sm text-slate-500">{PRIZE_POOL.registrationNote}</p>
            ) : null}

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Prize pool podle hry
            </p>
            <ul className="mt-4 space-y-3">
              {PRIZE_POOL.games.map((game) => (
                <li
                  key={game.gameId}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#39FF14]/25"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 p-1.5">
                    <Image
                      src={getTournamentGameLogo(game.gameId)}
                      alt=""
                      width={40}
                      height={40}
                      className="h-auto max-h-9 w-auto max-w-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{game.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{game.note}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Prize pool
                    </p>
                    <p
                      className="font-[family-name:var(--font-bebas)] text-3xl leading-none tracking-wide text-[#39FF14]/80"
                      aria-label={`Prize pool pro ${game.label} zatím nebyl oznámen`}
                    >
                      {formatPrizeAmount(null, PRIZE_POOL.currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-white">
              {tbd ? "Plánované rozdělení (TBA)" : "Výhry podle umístění"}
            </p>
            {tbd ? (
              <p className="mt-2 text-xs text-slate-500">
                Rozdělení výher podle umístění doplníme spolu s oznámením prize poolu.
              </p>
            ) : null}

            <PrizePoolBars />
          </div>
        </div>
      </div>
    </section>
  );
}
