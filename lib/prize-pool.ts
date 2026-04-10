/**
 * Údaje o prize poolu (úvodní stránka). Později lze napojit na CMS nebo rozšířit per hra.
 */
export type PrizePlace = {
  rankShort: string;
  amount: number;
  /** Relativní šířka baru 0–100 (vizuál). */
  barPct: number;
};

export const PRIZE_POOL = {
  currency: "Kč",
  total: 20_000,
  /** Zvýrazněná částka v překryvu (stejná jako total, nebo jiná část textu). */
  overlayAmountHighlight: 20_000,
  /** Věta za zelenou částkou (jedna souvislá věta). */
  overlaySentenceAfter:
    "bylo rozděleno mezi týmy na prvních třech místech.",
  registrationNote:
    "Startovné a přesné podmínky najdeš v propozicích na Discordu.",
  places: [
    { rankShort: "1.", amount: 6_000, barPct: 100 },
    { rankShort: "2.", amount: 2_500, barPct: 52 },
    { rankShort: "3.", amount: 750, barPct: 22 },
  ] satisfies PrizePlace[],
} as const;

export function formatMoney(n: number, currency: string) {
  return `${n.toLocaleString("cs-CZ")} ${currency}`;
}
