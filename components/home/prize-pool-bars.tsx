"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { formatPrizeAmount, PRIZE_POOL } from "@/lib/prize-pool";

const tones = [
  "from-[#39FF14] to-[#2ad60f]",
  "from-[#2ee010] to-[#1fa80a]",
  "from-[#1a8f08] to-[#156b0a]",
];

export function PrizePoolBars() {
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(listRef, { once: true, margin: "-8% 0px" });
  const [liquidOn, setLiquidOn] = useState(false);
  const tbd = !PRIZE_POOL.announced;

  useEffect(() => {
    if (!inView) return;
    const lastDelay = (PRIZE_POOL.places.length - 1) * 0.14;
    const fillDuration = 0.78;
    const ms = Math.ceil((lastDelay + fillDuration + 0.15) * 1000);
    const id = window.setTimeout(() => setLiquidOn(true), ms);
    return () => window.clearTimeout(id);
  }, [inView]);

  return (
    <ul ref={listRef} className="mt-5 space-y-4">
      {PRIZE_POOL.places.map((p, i) => {
        const grad = tones[i] ?? tones[2]!;
        const barWidth = tbd ? Math.max(p.barPct * 0.35, 18) : p.barPct;
        return (
          <li key={p.rankShort} className="flex items-center gap-3 sm:gap-4">
            <span className="flex w-8 shrink-0 items-center font-[family-name:var(--font-bebas)] text-lg tracking-wide text-slate-400 sm:w-9 sm:text-xl">
              {p.rankShort}
            </span>
            <div
              className={`relative h-11 min-w-0 flex-1 overflow-hidden rounded-lg border bg-black/60 ${
                tbd ? "border-dashed border-white/15" : "border-white/10"
              }`}
            >
              <motion.div
                className="absolute inset-y-0 left-0 overflow-hidden rounded-md"
                initial={{ width: "0%" }}
                animate={inView ? { width: `${barWidth}%` } : { width: "0%" }}
                transition={{
                  duration: 0.78,
                  delay: i * 0.14,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <div
                  className={`relative h-full w-full min-w-[4rem] bg-gradient-to-r ${grad} ${
                    tbd ? "opacity-40" : ""
                  }`}
                >
                  {liquidOn && !tbd ? (
                    <>
                      <div
                        className="prize-pool-bar-liquid pointer-events-none absolute inset-0 rounded-md"
                        aria-hidden
                      />
                      <div
                        className="prize-pool-bar-liquid-shine pointer-events-none absolute inset-0 rounded-md"
                        aria-hidden
                      />
                    </>
                  ) : null}
                </div>
              </motion.div>
              {tbd ? (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                  TBA
                </span>
              ) : null}
            </div>
            <span
              className={`shrink-0 font-[family-name:var(--font-bebas)] tracking-wide sm:text-xl ${
                tbd
                  ? "text-2xl text-slate-500"
                  : "text-lg text-white"
              }`}
            >
              {formatPrizeAmount(p.amount, PRIZE_POOL.currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
