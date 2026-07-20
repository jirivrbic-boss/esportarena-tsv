import {
  CMS_DEFAULTS,
  type PravidlaCms,
  type RuleSection,
} from "@/lib/cms-defaults";
import { GAME_RULES_DEFAULTS } from "@/lib/game-rules-defaults";
import { getPageContent } from "@/lib/get-cms-page";
import type { GameId } from "@/lib/games";

function mergeSections(base: PravidlaCms, remote?: Record<string, unknown>): PravidlaCms {
  const sections = remote?.sections as RuleSection[] | undefined;
  if (sections?.length) return { sections };
  return base;
}

/**
 * Obsah pravidel pro konkrétní hru.
 * CS2 čte legacy slug `page_content/pravidla` (CMS v administraci).
 * Ostatní hry: výchozí text + volitelný přepis ve `page_content/pravidla_<gameId>`.
 */
export async function getGameRulesCms(gameId: GameId): Promise<PravidlaCms> {
  const fallback = GAME_RULES_DEFAULTS[gameId];

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.USE_REMOTE_CMS_IN_DEV !== "1"
  ) {
    if (gameId === "cs2") {
      return CMS_DEFAULTS.pravidla as PravidlaCms;
    }
    return fallback;
  }

  if (gameId === "cs2") {
    return (await getPageContent("pravidla")) as PravidlaCms;
  }

  try {
    const { getDocRest } = await import("@/lib/firebase/firestore-rest-admin");
    const remote = await getDocRest(`page_content/pravidla_${gameId}`);
    return mergeSections(fallback, remote ?? undefined);
  } catch {
    return fallback;
  }
}
