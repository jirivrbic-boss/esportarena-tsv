import type { GameId } from "@/lib/games";
import { GAMES_BY_ID } from "@/lib/games";

export type LfgGameFieldConfig = {
  showFaceit: boolean;
  hoursLabel: string;
  hoursPlaceholder: string;
  faceitLabel: string;
  descriptionPlaceholder: string;
};

const LFG_GAME_FIELDS: Record<GameId, LfgGameFieldConfig> = {
  cs2: {
    showFaceit: true,
    hoursLabel: "Hodiny v CS2 (orientačně)",
    hoursPlaceholder: "např. 800",
    faceitLabel: "Faceit level (1–10)",
    descriptionPlaceholder: "Role (entry, AWP…), časové možnosti, škola…",
  },
  lol: {
    showFaceit: false,
    hoursLabel: "Hodiny v LoL / zkušenost (orientačně)",
    hoursPlaceholder: "např. 500",
    faceitLabel: "",
    descriptionPlaceholder: "Role (top, jg, mid…), rank, dostupnost, škola…",
  },
  brawl_stars: {
    showFaceit: false,
    hoursLabel: "Hodiny ve hře / zkušenost (volitelně)",
    hoursPlaceholder: "např. 200",
    faceitLabel: "",
    descriptionPlaceholder: "Player tag, oblíbený mód, kdy můžeš hrát…",
  },
  fc26: {
    showFaceit: false,
    hoursLabel: "Hodiny ve hře / zkušenost (volitelně)",
    hoursPlaceholder: "např. 150",
    faceitLabel: "",
    descriptionPlaceholder: "Platforma, styl hry, dostupnost…",
  },
};

export function lfgGameFields(gameId: GameId): LfgGameFieldConfig {
  return LFG_GAME_FIELDS[gameId];
}

export function lfgGameLabel(gameId: GameId): string {
  return GAMES_BY_ID[gameId]?.shortLabel ?? gameId;
}

/** Starší inzeráty bez gameId považuj za CS2. */
export function parseLfgGameId(raw: unknown): GameId {
  const s = String(raw ?? "").trim().toLowerCase();
  if (s === "lol" || s === "brawl_stars" || s === "fc26" || s === "cs2") {
    return s;
  }
  return "cs2";
}
