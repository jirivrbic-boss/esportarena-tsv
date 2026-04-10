export const RULES_SECTIONS = [
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
] as const;
