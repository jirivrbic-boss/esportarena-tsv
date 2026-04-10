export type OfficialDocument = {
  id: string;
  file: string;
  title: string;
  description: string;
};

/** Formální dokumenty ke stažení (PDF v /public/dokumenty; zdroj .docx v /dokumenty-zdroj). */
export const OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  {
    id: "obecna-pravidla",
    file: "obecna-pravidla-esportarena-tsv-cs2.pdf",
    title: "Obecná pravidla turnaje (CS2)",
    description:
      "Formát zápasů MR12, kvalifikace a playoff na FACEIT, časové povinnosti, prodloužení a rámec ESPORTARENA TSV.",
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
