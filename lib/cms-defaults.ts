import { RULES_SECTIONS } from "@/lib/rules-data";
import { TOURNAMENT_SCHOOLS_BODY } from "@/lib/site-info";

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
    title: "Pro koho je turnaj",
    body:
      `${TOURNAMENT_SCHOOLS_BODY} Projekt navazuje na IT vzdělávání — férová pravidla, dokumentovaná registrace a novinky v Oznámeních na webu.`,
  },
  {
    title: "Čtyři disciplíny",
    body:
      "Counter-Strike 2, League of Legends, Brawl Stars a EA SPORTS FC 26. Každá hra má vlastní stránku pravidel — po přihlášení kapitána zakládáš tým zvlášť pro vybranou hru.",
  },
  {
    title: "Komunikace",
    body:
      "Oficiální informace zveřejňujeme v Oznámeních na webu (stejný obsah jde i na Discord). WhatsApp nepoužíváme.",
  },
];

export const CMS_DEFAULTS: Record<CmsSlug, HomeCms | PravidlaCms | OznameniCms> = {
  home: {
    heroTagline: "Studentský turnaj · Česko & Slovensko",
    heroTitle: "ESPORTARENA",
    heroTitleAccent: "TSV",
    heroSubtitle:
      "Sezóna 4 · CS2, LoL, Brawl Stars a FC 26 · Prize pool se oznámí během registrace",
    heroPoweredBy: "Powered by Cougar & EsportArena Plzeň",
    aboutCards: DEFAULT_ABOUT_CARDS,
  },
  pravidla: {
    sections: RULES_SECTIONS.map((s) => ({ title: s.title, body: s.body })),
  },
  oznameni: {
    intro:
      "Hlavní zdroj novinek turnaje. Každé oznámení zveřejníme tady na webu a stejný obsah pošleme i na Discord.",
  },
};
