/** Normalizace e-mailu pro ban list (doc ID). */
export function normalizeBanEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Firestore doc ID — tečky v e-mailu jsou v ID povolené. */
export function bannedEmailDocPath(email: string): string {
  return `bannedEmails/${normalizeBanEmail(email)}`;
}

export const CAPTAIN_BAN_REASONS = [
  { id: "cheating", label: "Podvádění / unfair play" },
  { id: "toxicity", label: "Toxické chování / urážky" },
  { id: "fake_docs", label: "Falešné nebo neplatné dokumenty" },
  { id: "spam", label: "Spam / zneužití účtu" },
  { id: "rules", label: "Porušení pravidel turnaje" },
  { id: "other", label: "Jiný důvod" },
] as const;

export type CaptainBanReasonId = (typeof CAPTAIN_BAN_REASONS)[number]["id"];

export function banReasonLabel(id: string, custom?: string): string {
  const known = CAPTAIN_BAN_REASONS.find((r) => r.id === id);
  if (id === "other" && custom?.trim()) return custom.trim();
  return known?.label ?? custom?.trim() ?? id;
}

export function isValidBanReasonId(id: string): id is CaptainBanReasonId {
  return CAPTAIN_BAN_REASONS.some((r) => r.id === id);
}
