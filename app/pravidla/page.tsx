import { GlassCard } from "@/components/glass-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pravidla · ESPORTARENA TSV S4",
  description:
    "Oficiální pravidla studentského turnaje CS2 — kvalifikace, AFK, disconnect, knife round, BO3.",
};

const sections = [
  {
    title: "Formát kvalifikací",
    body: `Kvalifikace probíhají v systému Faceit dle oficiálního hubu po schválení týmu na této platformě. Playoff kvalifikací je typicky BO3 (best of three), pokud není v rozvrhu uvedeno jinak. Výchozí mapový pool a veto řídí administrace turnaje a bude zveřejněno na Discordu.`,
  },
  {
    title: "AFK a neomluvená neúčast",
    body: `Tým musí být připraven v naplánovaný čas zápasu. Opakované AFK nebo nedostavení se bez omluvy včas může vést k kontumační výhře soupeři nebo vyloučení z turnaje. Omluvy a přebookování řeší pouze administrace na Discordu.`,
  },
  {
    title: "Disconnect (DC)",
    body: `Při pádu klienta nebo výpadku spojení platí pravidla daného kola podle pokynů admina v zápase. Standardně se pokračuje po obnově spojení; pokud hráč nemůže pokračovat, rozhoduje admin s ohledem na integritu zápasu a časový harmonogram.`,
  },
  {
    title: "Knife round",
    body: `Strana (CT/T) nebo první výběr mapy může být určena knife roundem dle instrukcí v dané fázi turnaje. Pokud knife round není vyžadován, rozhoduje domluva dle bracketu nebo pokyn admina.`,
  },
  {
    title: "Stížnosti a důkazy",
    body: `Veškeré spory hlaste výhradně přes oficiální Discord s důkazy (demo, záznam, screenshot). Rozhodnutí hlavního admina je konečné.`,
  },
  {
    title: "Soupiska a identita",
    body: `Hráči musí odpovídat zadaným údajům a dokladům o studiu. Zástup není povolen bez schválení administrace.`,
  },
];

export default function PravidlaPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white sm:text-5xl">
        Pravidla turnaje
      </h1>
      <p className="mt-3 text-slate-400">
        Stručný oficiální rámec pro CS2 část ESPORTARENA TSV — Sezóna 4. Detailní
        rozvrh a případné výjimky vždy na{" "}
        <strong className="text-[#39FF14]">Discordu</strong>.
      </p>
      <div className="mt-10 space-y-6">
        {sections.map((s, i) => (
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
    </main>
  );
}
