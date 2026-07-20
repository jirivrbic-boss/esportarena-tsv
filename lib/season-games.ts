import type { GameId } from "@/lib/games";

/** Disciplíny aktivní v Sezóně 4 — ostatní jsou v režimu „připravujeme“. */
export const SEASON_ACTIVE_GAME_IDS = ["cs2", "lol"] as const satisfies readonly GameId[];

export const SEASON_NUMBER = 4;

export function isSeasonActiveGame(gameId: GameId): boolean {
  return (SEASON_ACTIVE_GAME_IDS as readonly string[]).includes(gameId);
}

export function isSeasonComingSoonGame(gameId: GameId): boolean {
  return !isSeasonActiveGame(gameId);
}
