"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PRIZE_POOL, formatMoney } from "@/lib/prize-pool";

const tones = [
  "from-[#39FF14] to-[#2ad60f]",
  "from-[#2ee010] to-[#1fa80a]",
  "from-[#1a8f08] to-[#156b0a]",
];

export function PrizePoolBars() {
  const listRef = useRef<HTMLUListElement>(null);
  const inView = useInView(listRef, { once: true, margin: "-8% 0px" });
  const [liquidOn, setLiquidOn] = useState(false);

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
        return (
          <li
            key={p.rankShort}
            className="flex items-center gap-3 sm:gap-4"
          >
            <span className="flex w-8 shrink-0 items-center font-[family-name:var(--font-bebas)] text-lg tracking-wide text-slate-400 sm:w-9 sm:text-xl">
              {p.rankShort}
            </span>
            <div className="relative h-11 min-w-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/60">
              <motion.div
                className="absolute inset-y-0 left-0 overflow-hidden rounded-md"
                initial={{ width: "0%" }}
                animate={inView ? { width: `${p.barPct}%` } : { width: "0%" }}
                transition={{
                  duration: 0.78,
                  delay: i * 0.14,
                  ease: [0.33, 1, 0.68, 1],
                }}
              >
                <div
                  className={`relative h-full w-full min-w-[8rem] bg-gradient-to-r ${grad}`}
                >
                  {liquidOn ? (
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
            </div>
            <span className="shrink-0 font-[family-name:var(--font-bebas)] text-lg tracking-wide text-white sm:text-xl">
              {formatMoney(p.amount, PRIZE_POOL.currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
