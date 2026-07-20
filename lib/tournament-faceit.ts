/** 24 h před startem turnaje se zobrazí Faceit hub odkaz (jen přihlášeným týmům). */
export const FACEIT_HUB_UNLOCK_MS_BEFORE = 24 * 60 * 60 * 1000;

export function parseTournamentStartsAtMs(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
}

/** Veřejný web zobrazí turnaj až v okamžiku startu (ne dříve). */
export function isTournamentPubliclyVisible(
  startsAtMs: number | null,
  now: number = Date.now()
): boolean {
  if (startsAtMs == null) return false;
  return now >= startsAtMs;
}

/** Bez data startu považujeme odkaz za dostupný (admin ho může zveřejnit kdykoli). */
export function isFaceitHubUnlocked(
  startsAtMs: number | null,
  now: number = Date.now()
): boolean {
  if (startsAtMs == null) return true;
  return now >= startsAtMs - FACEIT_HUB_UNLOCK_MS_BEFORE;
}

export function resolveFaceitHubUrl(
  tournamentFaceitUrl: unknown,
  envFallback?: string
): string {
  const fromDoc =
    typeof tournamentFaceitUrl === "string" ? tournamentFaceitUrl.trim() : "";
  if (fromDoc) return fromDoc;
  return envFallback?.trim() ?? "";
}

export function formatFaceitUnlockHint(startsAtMs: number | null): string {
  if (startsAtMs == null) {
    return "Link na Faceit turnaj bude zveřejněn organizátorem.";
  }
  const unlockAt = new Date(startsAtMs - FACEIT_HUB_UNLOCK_MS_BEFORE);
  return `Link na Faceit turnaj bude dostupný od ${unlockAt.toLocaleString("cs-CZ")} (24 h před startem).`;
}
