import type { GameId } from "@/lib/games";

export type OfficialDocument = {
  id: string;
  file: string;
  title: string;
  description: string;
};

/** Formální dokumenty ke stažení (PDF v `public/dokumenty`; zdroj .docx v `dokumenty-zdroj/`). */
export const OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  {
    id: "obecna-pravidla",
    file: "obecna-pravidla-esportarena-tsv-cs2.pdf",
    title: "Obecná pravidla turnaje (CS2)",
    description:
      "Formát zápasů MR12, kvalifikace a playoff na FACEIT, časové povinnosti, prodloužení a rámec ESPORTARENA TSV.",
  },
  {
    id: "obecna-pravidla-lol",
    file: "obecna-pravidla-lol.pdf",
    title: "Obecná pravidla turnaje (LOL)",
    description:
      "Formát zápasů, registrace týmů, časové povinnosti a rámec ESPORTARENA TSV pro League of Legends.",
  },
  {
    id: "pravidla-registrace",
    file: "pravidla-registrace.pdf",
    title: "Pravidla registrace",
    description:
      "Studentský status, Discord, chování v turnaji, průběh zápasů a sankce — text z registračního rámce.",
  },
  {
    id: "souhlas-zakonneho-zastupce",
    file: "souhlas-zakonneho-zastupce.pdf",
    title: "Souhlas zákonného zástupce",
    description:
      "Šablona pro nezletilé: vyplnit, podepsat a před začátkem turnaje zaslat na jiri@esportarena.cz (dle pokynů v dokumentu).",
  },
];

export function documentsForVariant(
  variant: "all" | "rules" | "consent"
): OfficialDocument[] {
  if (variant === "all") return OFFICIAL_DOCUMENTS;
  if (variant === "consent") {
    return OFFICIAL_DOCUMENTS.filter((d) => d.id === "souhlas-zakonneho-zastupce");
  }
  return OFFICIAL_DOCUMENTS.filter((d) => d.id !== "souhlas-zakonneho-zastupce");
}

/** PDF podle disciplíny — CS2 a LoL mají navíc vlastní „Obecná pravidla“. */
export function documentsForGame(gameId: GameId): OfficialDocument[] {
  const registration = OFFICIAL_DOCUMENTS.filter((d) => d.id === "pravidla-registrace");
  const cs2pdf = OFFICIAL_DOCUMENTS.filter((d) => d.id === "obecna-pravidla");
  const lolpdf = OFFICIAL_DOCUMENTS.filter((d) => d.id === "obecna-pravidla-lol");

  switch (gameId) {
    case "cs2":
      return [...cs2pdf, ...registration];
    case "lol":
      return [...lolpdf, ...registration];
    case "brawl_stars":
    case "fc26":
      return [...registration];
    default:
      return registration;
  }
}
