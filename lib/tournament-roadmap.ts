export type RoadmapStageIcon = "grid" | "sixteen" | "trophy";

export type RoadmapStage = {
  title: string;
  description: string;
  dates: string;
  icon: RoadmapStageIcon;
};

/** Fáze turnaje — texty a termíny lze upravit podle skutečného harmonogramu. */
export const TOURNAMENT_ROADMAP_STAGES: RoadmapStage[] = [
  {
    title: "Otevřená kvalifikace",
    description:
      "64 týmů hraje Double Elimination (Bo1) až do rozhodujících zápasů (Bo3). Nejlepších 16 postupuje do hlavní fáze.",
    dates: "31. 10. – 2. 11.",
    icon: "grid",
  },
  {
    title: "Hlavní fáze",
    description:
      "Skupina 16 týmů ve formátu GSL (Bo3). Z každé skupiny postupují 2 nejlepší týmy do play-off.",
    dates: "17. 11. – 18. 11.",
    icon: "sixteen",
  },
  {
    title: "Play-off",
    description:
      "Play-off 8 týmů ve Single Elimination (Bo3). Grand finále hrané na Bo3.",
    dates: "18. 11. – 19. 11.",
    icon: "trophy",
  },
];
