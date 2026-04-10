"use client";

import { GlassCard } from "@/components/glass-card";
import type { RuleSection } from "@/lib/cms-defaults";

export function RulesBody({ sections }: { sections: RuleSection[] }) {
  return (
    <div className="mt-10 space-y-6">
      {sections.map((s, i) => (
        <GlassCard key={`${s.title}-${i}`} delay={i * 0.05}>
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
