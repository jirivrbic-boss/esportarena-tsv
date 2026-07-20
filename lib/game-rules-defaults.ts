import type { PravidlaCms } from "@/lib/cms-defaults";
import type { GameId } from "@/lib/games";
import { RULES_SECTIONS } from "@/lib/rules-data";

/** Výchozí texty pro hry bez vlastního CMS dokumentu (lze doplnit do Firestore page_content/pravidla_<hra>). */
export const GAME_RULES_DEFAULTS: Record<GameId, PravidlaCms> = {
  cs2: {
    sections: RULES_SECTIONS.map((s) => ({ title: s.title, body: s.body })),
  },

  lol: {
    sections: [
      {
        title: "Registrace a soupiska",
        body: `Drž se společných „Pravidel registrace“ (PDF na této stránce i v Dokumentech). Soupiska musí odpovídat přihlášce — výjimky jen přes administraci (ozve se v Oznámeních nebo e-mailem).\n\nIdentita hráče v soutěži je Riot ID / summoner name přesně ve formě, kterou vyhlásí organizátoři v Oznámeních.`,
      },
      {
        title: "Formát a klient",
        body: `Konkrétní formát zápasů (BO1/BO3), mapové preference, draft a případné výjimky schvaluje hlavní admin před začátkem fáze turnaje. Veškeré změny zveřejníme v Oznámeních na webu (stejný obsah jde i na Discord).`,
      },
      {
        title: "AFK, přechod mezi zápasy a spory",
        body: `Tým musí být připraven v naplánovaný čas. Neomluvená neúčast nebo opakované zpoždění může vést ke kontumu nebo vyloučení. Spory řeš přes Centrum podpory s důkazy (screeny, logy). Rozhodnutí hlavního admina je konečné.`,
      },
      {
        title: "Patch a champion pool",
        body: `Verze klienta a případná omezení šampionů určí organizátor před daným kolem — vždy v Oznámeních. Nesoulad s pokynem = kontumační výhra podle pravidel dané fáze.`,
      },
    ],
  },

  brawl_stars: {
    sections: [
      {
        title: "Registrace a účast",
        body: `Platí společná „Pravidla registrace“ studentů (PDF níže). Každý hráč musí mít ověřený studentský status dle pokynů kapitána.\n\nHerní tag / Player ID vyplň přesně tak, jak organizátoři uvedou v Oznámeních.`,
      },
      {
        title: "Formát zápasů",
        body: `Konkrétní módy (např. 3v3), výběr map, počet kol a případné výjimky stanoví administrace před začátkem bracketu. Harmonogram a pravidla zveřejníme v Oznámeních na webu.`,
      },
      {
        title: "Fair play a výpadky",
        body: `Opakované AFK nebo úmyslné rušení zápasu může vést k penalizaci týmu. Při technickém výpadku řiď se instrukcemi admina v zápase — bez souhlasu admina nelze zápas jednostraně ukončit.`,
      },
      {
        title: "Informace a termíny",
        body: `Veškeré změny termínů a výjimky oznamujeme v sekci Oznámení na webu.`,
      },
    ],
  },

  fc26: {
    sections: [
      {
        title: "Registrace a zařízení",
        body: `Obecná „Pravidla registrace“ studentů platí pro celý projekt (PDF níže). Pro EA SPORTS FC může organizátor stanovit platformu (PC/konzole), verzi klienta a způsob ověření identity hráče — vše v Oznámeních na webu.`,
      },
      {
        title: "Formát soutěže",
        body: `Konkrétní formát (1v1 / tým, délka zápasů, remízy, nastavení pravidel ve hře) vyhlásí organizátor před startem sezóny nebo dané fáze v Oznámeních. Bez potvrzení admina nelze měnit domluvený formát.`,
      },
      {
        title: "Fair play",
        body: `Bugy, úmyslné zpomalování zápasů nebo podvádění vedou k okamžité diskvalifikaci. Rozhodnutí hlavního admina je konečné.`,
      },
      {
        title: "Termíny a dotazy",
        body: `Schvalování přesunů zápasů a řešení sporů — Centrum podpory na webu; změny termínů vždy v Oznámeních.`,
      },
    ],
  },
};
