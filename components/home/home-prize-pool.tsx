import Image from "next/image";
import { PRIZE_POOL, formatMoney } from "@/lib/prize-pool";

/** Rozdělení výher — layout inspirovaný turnajovými weby, barvy ESPORTARENA TSV. */
export function HomePrizePool() {
  const totalFmt = formatMoney(PRIZE_POOL.total, PRIZE_POOL.currency);
  const highlight = formatMoney(
    PRIZE_POOL.overlayAmountHighlight,
    PRIZE_POOL.currency
  );

  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-[#040404] py-16 sm:py-24"
      aria-labelledby="prize-pool-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(57,255,20,0.06),transparent_50%),radial-gradient(ellipse_at_90%_80%,rgba(57,255,20,0.04),transparent_40%)]" />
      <div className="pointer-events-none absolute bottom-6 right-8 hidden font-mono text-[10px] uppercase tracking-widest text-white/10 sm:block">
        ESPORTARENA · S4
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <h2
          id="prize-pool-heading"
          className="sr-only"
        >
          Prize pool a rozdělení výher
        </h2>
        <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Levý sloupec: agent + překryvný text */}
          <div className="relative min-h-[min(52vh,520px)] overflow-hidden rounded-2xl border border-white/10 bg-[#060606] lg:min-h-[480px]">
            <div className="pointer-events-none absolute left-4 top-4 z-10 h-2 w-2 bg-[#39FF14] shadow-[0_0_12px_#39FF14]" />
            <div className="pointer-events-none absolute right-6 top-8 h-1 w-8 bg-[#39FF14]/40" />

            <div className="absolute inset-0 flex items-end justify-center pb-0 pt-12">
              <Image
                src="/fotky/agent.png"
                alt=""
                width={900}
                height={900}
                className="h-[min(85%,420px)] w-auto max-w-none object-contain object-bottom opacity-95 sm:h-[min(88%,480px)] lg:h-[min(92%,520px)]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
                draggable={false}
              />
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 sm:inset-x-6 sm:bottom-6">
              <div className="border border-white/15 bg-black/80 px-4 py-4 backdrop-blur-md sm:px-5 sm:py-5">
                <p className="font-[family-name:var(--font-bebas)] text-xl leading-tight tracking-wide text-white sm:text-2xl md:text-3xl">
                  <span className="text-[#39FF14] drop-shadow-[0_0_12px_rgba(57,255,20,0.35)]">
                    {highlight}
                  </span>{" "}
                  <span className="text-white">
                    {PRIZE_POOL.overlaySentenceAfter}
                  </span>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:text-sm">
                  {PRIZE_POOL.registrationNote}
                </p>
              </div>
            </div>
          </div>

          {/* Pravý sloupec: celkový fond + horizontální bary */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Celkový prize pool
            </p>
            <p className="mt-2 font-[family-name:var(--font-bebas)] text-5xl leading-none tracking-wide text-[#39FF14] drop-shadow-[0_0_24px_rgba(57,255,20,0.25)] sm:text-6xl md:text-7xl">
              {totalFmt}
            </p>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Výhry podle umístění
            </p>

            <ul className="mt-5 space-y-4">
              {PRIZE_POOL.places.map((p, i) => {
                const tones = [
                  "from-[#39FF14] to-[#2ad60f]",
                  "from-[#2ee010] to-[#1fa80a]",
                  "from-[#1a8f08] to-[#156b0a]",
                  "from-[#156b0a] to-[#0f4d08]",
                ];
                const grad = tones[i] ?? tones[3]!;
                return (
                  <li
                    key={p.rankShort}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <span className="flex w-8 shrink-0 items-center font-[family-name:var(--font-bebas)] text-lg tracking-wide text-slate-400 sm:w-9 sm:text-xl">
                      {p.rankShort}
                    </span>
                    <div className="relative h-11 min-w-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/60">
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${grad} opacity-95`}
                        style={{ width: `${p.barPct}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-[family-name:var(--font-bebas)] text-lg tracking-wide text-white sm:text-xl">
                      {formatMoney(p.amount, PRIZE_POOL.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
