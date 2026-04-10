import { RULES_SECTIONS } from "@/lib/rules-data";

export type CmsSlug = "home" | "pravidla" | "oznameni";

export type RuleSection = { title: string; body: string };
export type AboutCard = { title: string; body: string };

export type HomeCms = {
  heroTagline: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroPoweredBy: string;
  aboutCards: AboutCard[];
};

export type PravidlaCms = {
  sections: RuleSection[];
};

export type OznameniCms = {
  intro: string;
};

const DEFAULT_ABOUT_CARDS: AboutCard[] = [
  {
    title: "Pro koho",
    body:
      "Střední školy (SŠ), vysoké školy (VŠ) a nově i základní školy (ZŠ). Turnaj je vázán na IT vzdělávání — profesionální přístup k organizaci a pravidům.",
  },
  {
    title: "Automatizace",
    body:
      "Faceit ELO pro férové nasazení, notifikace pro administrátory a e-maily pro kapitány. Schválené týmy získají odkaz do Faceit kvalifikace.",
  },
  {
    title: "Komunikace",
    body:
      "Oficiální komunikace výhradně přes Discord — ne WhatsApp.",
  },
];

export const CMS_DEFAULTS: Record<CmsSlug, HomeCms | PravidlaCms | OznameniCms> = {
  home: {
    heroTagline: "Counter-Strike 2 · České školy",
    heroTitle: "ESPORTARENA",
    heroTitleAccent: "TSV",
    heroSubtitle: "Sezóna 4 · Prize pool 120 000 Kč",
    heroPoweredBy: "Powered by Cougar & EsportArena Plzeň",
    aboutCards: DEFAULT_ABOUT_CARDS,
  },
  pravidla: {
    sections: RULES_SECTIONS.map((s) => ({ title: s.title, body: s.body })),
  },
  oznameni: {
    intro: "Aktuality od pořadatelů.",
  },
};
