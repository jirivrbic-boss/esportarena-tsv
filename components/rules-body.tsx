"use client";

import { GlassCard } from "@/components/glass-card";
import { RULES_SECTIONS } from "@/lib/rules-data";

export function RulesBody() {
  return (
    <div className="mt-10 space-y-6">
      {RULES_SECTIONS.map((s, i) => (
        <GlassCard key={s.title} delay={i * 0.05}>
          <h2 className="font-[family-name:var(--font-bebas)] text-2xl text-[#39FF14]">
            {s.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">
            {s.body}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
