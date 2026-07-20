import type { GameId } from "@/lib/games";
import { publicFotky } from "@/lib/public-assets";

/** Loga her v `public/fotky` pro běžící lištu na detailu turnaje. */
export const TOURNAMENT_GAME_LOGOS: Record<GameId, string> = {
  cs2: publicFotky("Counter-Strike_2_logo.svg.png"),
  lol: publicFotky("League_of_Legends_2019_vector.svg.png"),
  brawl_stars: publicFotky("Brawl_Stars_Logo_2025-s5120.png"),
  fc26: publicFotky("FC_26_Logo.svg.png"),
};

export const TOURNAMENT_BRAND_LOGO = publicFotky("tournament logo.png");

export function getTournamentGameLogo(gameId: GameId): string {
  return TOURNAMENT_GAME_LOGOS[gameId] ?? TOURNAMENT_GAME_LOGOS.cs2;
}
