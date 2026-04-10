"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { GlassCard } from "@/components/glass-card";

const seasons = [
  {
    season: "Sezóna 1",
    first: "SPŠ MV Praha (Sokolov)",
    second: "Gymnázium Třeboň",
    third: "SPŠ Mladá Boleslav",
  },
  {
    season: "Sezóna 2",
    first: "SPŠEK Rakovník",
    second: "SPŠ MV Praha (Sokolov)",
    third: "SPŠ Teplice",
  },
  {
    season: "Sezóna 3",
    first: "VUT Brno",
    second: "VŠB Ostrava",
    third: "FEKT VUT Brno",
  },
];

export function HallOfFame() {
  return (
    <section className="border-t border-white/10 bg-[#080808] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-bebas)] text-4xl tracking-[0.08em] text-white sm:text-5xl">
              SÍŇ <span className="text-[#39FF14]">SLÁVY</span>
            </h2>
            <p className="mt-2 text-slate-400">
              Předchozí šampioni studentského formátu — od středních škol po
              univerzity.
            </p>
          </div>
          <div className="relative mx-auto flex w-full max-w-[220px] shrink-0 justify-center sm:max-w-[260px] lg:mx-0 lg:max-w-[280px]">
            <div className="absolute inset-0 scale-125 rounded-full bg-[#39FF14]/[0.08] blur-3xl" />
            <motion.div
              className="relative w-full"
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/fotky/pohar.png"
                alt="Trofej pro vítěze turnaje"
                width={560}
                height={560}
                className="h-auto w-full object-contain [filter:drop-shadow(0_0_32px_rgba(57,255,20,0.22))]"
                sizes="280px"
                draggable={false}
              />
            </motion.div>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {seasons.map((s, i) => (
            <GlassCard key={s.season} delay={i * 0.08}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#39FF14]">
                {s.season}
              </p>
              <p className="mt-4 text-sm text-slate-500">1. místo</p>
              <p className="text-lg font-semibold text-white">{s.first}</p>
              <p className="mt-3 text-sm text-slate-500">2. místo</p>
              <p className="text-base text-slate-300">{s.second}</p>
              <p className="mt-3 text-sm text-slate-500">3. místo</p>
              <p className="text-base text-slate-400">{s.third}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
