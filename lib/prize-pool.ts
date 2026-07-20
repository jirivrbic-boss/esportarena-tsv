import type { GameId } from "@/lib/games";

/** Zobrazení, dokud organizátor neoznámí částku (mezi startem a koncem registrace). */
export const PRIZE_POOL_TBD_MESSAGE =
  "Prize pool zatím neznáme — dozvíš se ho mezi začátkem a koncem registrace.";

export const PRIZE_POOL_TBD_CHIP = "Zatím neznámo";

const LEGACY_PLACEHOLDER_AMOUNTS = ["120 000 Kč", "120000"];

export function hasAnnouncedPrizePool(value?: string | null): boolean {
  const v = value?.trim();
  if (!v) return false;
  if (v === PRIZE_POOL_TBD_MESSAGE) return false;
  if (LEGACY_PLACEHOLDER_AMOUNTS.some((x) => v.includes(x))) return false;
  return true;
}

/** Text prize poolu pro veřejné zobrazení. */
export function displayPrizePoolText(value?: string | null): string {
  return hasAnnouncedPrizePool(value) ? value!.trim() : PRIZE_POOL_TBD_MESSAGE;
}

/**
 * Údaje o prize poolu (úvodní stránka).
 * `announced: false` — částky zatím nejsou zveřejněné (zobrazí se otazník / TBA).
 */
export type PrizePlace = {
  rankShort: string;
  amount: number | null;
  /** Relativní šířka baru 0–100 (vizuál). */
  barPct: number;
};

export type PrizePoolGame = {
  gameId: GameId;
  label: string;
  shortLabel: string;
  note: string;
};

export const PRIZE_POOL = {
  season: 4,
  /** Po zveřejnění částek nastav na true a doplň total + places[].amount */
  announced: false,
  currency: "Kč",
  total: null as number | null,
  overlayAmountHighlight: null as number | null,
  /** Krátký text v překryvu u agenta (TBA režim). */
  overlayTbdLine: PRIZE_POOL_TBD_MESSAGE,
  /** Věta za zelenou částkou po oznámení poolu. */
  overlaySentenceAfter:
    "bylo rozděleno mezi týmy na prvních třech místech.",
  registrationNote: PRIZE_POOL_TBD_MESSAGE,
  /** Disciplíny s prize poolem v letošní sezóně */
  games: [
    {
      gameId: "cs2",
      label: "Counter-Strike 2",
      shortLabel: "CS2",
      note: "Kvalifikace a play-off · offline finále v Plzni",
    },
    {
      gameId: "lol",
      label: "League of Legends",
      shortLabel: "LoL",
      note: "Studentský turnaj · formát dle propozic sezóny",
    },
  ] satisfies PrizePoolGame[],
  places: [
    { rankShort: "1.", amount: null, barPct: 100 },
    { rankShort: "2.", amount: null, barPct: 52 },
    { rankShort: "3.", amount: null, barPct: 22 },
  ] satisfies PrizePlace[],
} as const;

export function formatMoney(n: number, currency: string) {
  return `${n.toLocaleString("cs-CZ")} ${currency}`;
}

/** Zobrazení částky — u neoznámeného poolu vrátí otazník. */
export function formatPrizeAmount(
  amount: number | null,
  currency: string,
  tbd = "?"
): string {
  if (amount == null) return tbd;
  return formatMoney(amount, currency);
}
