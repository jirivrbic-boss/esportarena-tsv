import Image from "next/image";
import { PRIZE_POOL, formatMoney } from "@/lib/prize-pool";
import { PrizePoolBars } from "@/components/home/prize-pool-bars";

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

            <div className="absolute inset-0 flex items-end justify-center overflow-hidden pt-4 pb-[28%] sm:pb-[26%] lg:pb-[24%]">
              <Image
                src="/fotky/agent.png"
                alt=""
                width={900}
                height={900}
                className="h-[min(118%,560px)] w-auto max-w-[135%] origin-bottom object-contain object-bottom opacity-95 sm:h-[min(125%,640px)] sm:max-w-[145%] sm:-translate-y-5 lg:h-[min(132%,720px)] lg:max-w-[155%] lg:-translate-y-8"
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

            <PrizePoolBars />
          </div>
        </div>
      </div>
    </section>
  );
}
