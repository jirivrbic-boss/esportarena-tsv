import type { GameId } from "@/lib/games";
import { GAMES_BY_ID } from "@/lib/games";
import type { CaptainProfile, RosterPlayer } from "@/lib/types";

export const GAME_NICK_PROFILE_FIELDS = {
  cs2: "faceitNickname",
  lol: "riotId",
  brawl_stars: "brawlPlayerTag",
  fc26: "eaAccount",
} as const satisfies Record<GameId, keyof CaptainProfile>;

export function getGameNickProfileField(gameId: GameId): keyof CaptainProfile {
  return GAME_NICK_PROFILE_FIELDS[gameId];
}

export function getGameNickFromProfile(
  profile: Pick<
    CaptainProfile,
    "faceitNickname" | "riotId" | "brawlPlayerTag" | "eaAccount"
  >,
  gameId: GameId
): string {
  const key = GAME_NICK_PROFILE_FIELDS[gameId];
  const value = profile[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getRosterGameNick(player: RosterPlayer): string {
  return player.faceitNickname.trim();
}

export function rosterGameNickLabel(gameId: GameId): string {
  return GAMES_BY_ID[gameId].playerNickLabel;
}

export function gameNickPlaceholder(gameId: GameId): string {
  switch (gameId) {
    case "cs2":
      return "např. PlayerNick123";
    case "lol":
      return "např. SummonerName#EUNE";
    case "brawl_stars":
      return "např. #2ABC123";
    case "fc26":
      return "např. EA ID nebo PSN";
  }
}

export function validateGameNick(gameId: GameId, value: string): string | null {
  const v = value.trim();
  const label = GAMES_BY_ID[gameId].playerNickLabel;
  if (!v) {
    return `Vyplň ${label.toLowerCase()}.`;
  }
  if (gameId === "lol" && !v.includes("#")) {
    return "Riot ID musí obsahovat # a tag (např. Jméno#EUNE).";
  }
  if (gameId === "brawl_stars" && !v.startsWith("#")) {
    return "Herní tag v Brawl Stars obvykle začíná znakem #.";
  }
  return null;
}

export function getFaceitPlayerUrl(nick?: string): string | null {
  const trimmed = nick?.trim();
  if (!trimmed) return null;
  return `https://www.faceit.com/en/players/${encodeURIComponent(trimmed)}`;
}

export function getGameNickExternalUrl(gameId: GameId, nick: string): string | null {
  if (gameId === "cs2") return getFaceitPlayerUrl(nick);
  return null;
}
