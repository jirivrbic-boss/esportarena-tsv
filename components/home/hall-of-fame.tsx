"use client";

import { GlassCard } from "@/components/glass-card";

const seasons = [
  {
    season: "Sezóna 1",
    first: "SPŠ MV Praha (Sokolov)",
    second: "Gymnázium Třeboň",
    third: "Historické 3. místo — doplní pořadatel",
  },
  {
    season: "Sezóna 2",
    first: "SPŠEK Rakovník",
    second: "SPŠ MV Praha (Sokolov)",
    third: "Historické 3. místo — doplní pořadatel",
  },
  {
    season: "Sezóna 3",
    first: "VUT Brno",
    second: "VŠB Ostrava",
    third: "Historické 3. místo — doplní pořadatel",
  },
];

export function HallOfFame() {
  return (
    <section className="border-t border-white/10 bg-[#080808] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-[family-name:var(--font-bebas)] text-4xl tracking-[0.08em] text-white sm:text-5xl">
          SÍŇ <span className="text-[#39FF14]">SLÁVY</span>
        </h2>
        <p className="mt-2 max-w-xl text-slate-400">
          Předchozí šampioni studentského formátu — od středních škol po
          univerzity.
        </p>
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
