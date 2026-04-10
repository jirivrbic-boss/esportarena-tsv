/** Identifikátory her v jedné sezóně turnaje (Firestore: teams.gameId). */
export const GAME_IDS = ["cs2", "brawl_stars", "lol", "fc26"] as const;
export type GameId = (typeof GAME_IDS)[number];

export type GameDefinition = {
  id: GameId;
  label: string;
  shortLabel: string;
  /** Popisek pole pro herní identitu hráče (Faceit / Riot ID / tag …). */
  playerNickLabel: string;
  playerNickHint: string;
  /** U CS2 stahujeme ELO z Faceit API. */
  usesFaceitElo: boolean;
};

export const GAMES: GameDefinition[] = [
  {
    id: "cs2",
    label: "Counter-Strike 2",
    shortLabel: "CS2",
    playerNickLabel: "Faceit přezdívka",
    playerNickHint: "Stejný nick jako na FACEIT (kvůli ELO a kvalifikaci).",
    usesFaceitElo: true,
  },
  {
    id: "brawl_stars",
    label: "Brawl Stars",
    shortLabel: "Brawl Stars",
    playerNickLabel: "Herní tag / jméno v Brawl",
    playerNickHint: "Player tag (#…) nebo přezdívka dle pokynů adminů.",
    usesFaceitElo: false,
  },
  {
    id: "lol",
    label: "League of Legends",
    shortLabel: "LoL",
    playerNickLabel: "Summoner name / Riot ID",
    playerNickHint: "Přesný tvar podle pravidel soutěže (Riot ID včetně tagu).",
    usesFaceitElo: false,
  },
  {
    id: "fc26",
    label: "EA SPORTS FC 26",
    shortLabel: "FC 26",
    playerNickLabel: "EA / konzolový účet",
    playerNickHint: "Identifikace hráče ve FC dle pokynů organizátorů.",
    usesFaceitElo: false,
  },
];

export const GAMES_BY_ID: Record<GameId, GameDefinition> = Object.fromEntries(
  GAMES.map((g) => [g.id, g])
) as Record<GameId, GameDefinition>;

export function parseGameId(raw: string | null | undefined): GameId | null {
  if (!raw) return null;
  const n = raw.trim().toLowerCase();
  return (GAME_IDS as readonly string[]).includes(n) ? (n as GameId) : null;
}

export function gameLabel(id: GameId): string {
  return GAMES_BY_ID[id]?.label ?? id;
}
