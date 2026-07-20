/** Aktivní = nadcházející turnaj (lze se přihlásit). Neaktivní = už proběhl. */
export function isTournamentActive(
  startsAtMs: number | null | undefined,
  now: number = Date.now()
): boolean {
  if (startsAtMs == null || !Number.isFinite(startsAtMs)) return true;
  return startsAtMs >= now;
}

export function formatTournamentStartsAt(
  startsAtMs: number | null | undefined
): string | null {
  if (startsAtMs == null || !Number.isFinite(startsAtMs)) return null;
  return new Date(startsAtMs).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Prague",
  });
}

export type TournamentListRow = {
  id: string;
  name: string;
  gameId: string;
  prizePoolText: string;
  startsAtMs: number | null;
  isActive: boolean;
  startsAtLabel: string | null;
};

export function partitionTournamentsByActivity<T extends { isActive: boolean; startsAtMs?: number | null }>(
  rows: T[]
): { active: T[]; inactive: T[] } {
  const active = rows
    .filter((r) => r.isActive)
    .sort((a, b) => (a.startsAtMs ?? 0) - (b.startsAtMs ?? 0));
  const inactive = rows
    .filter((r) => !r.isActive)
    .sort((a, b) => (b.startsAtMs ?? 0) - (a.startsAtMs ?? 0));
  return { active, inactive };
}
