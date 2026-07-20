import type { GameId } from "@/lib/games";

/** Kvalifikace = otevřené přihlášení; play-off/LAN = jen pozvané týmy. */
export type TournamentPhase = "qualification" | "playoff";

export const TOURNAMENT_PHASES: { id: TournamentPhase; label: string; hint: string }[] = [
  {
    id: "qualification",
    label: "Kvalifikace",
    hint: "Schválený tým se může přihlásit sám — bez výběru administrátorem.",
  },
  {
    id: "playoff",
    label: "Play-off / LAN",
    hint: "Pouze týmy vybrané v adminu; kapitán musí pozvánku přijmout.",
  },
];

export function parseTournamentPhase(value: unknown): TournamentPhase {
  return value === "playoff" ? "playoff" : "qualification";
}

export function tournamentPhaseLabel(phase: TournamentPhase): string {
  return phase === "playoff" ? "Play-off / LAN" : "Kvalifikace";
}

/** Dokument `tournaments/{id}` ve Firestore. */
export type TournamentDocument = {
  name: string;
  gameId: GameId;
  /** Typ turnaje — chybí u starších záznamů (= kvalifikace). */
  phase?: TournamentPhase;
  backgroundImageUrl?: string;
  startsAt?: import("firebase/firestore").Timestamp;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  published: boolean;
  /** Sezóna (např. s4) — volitelné. */
  seasonId?: string;
  /** Kdo se může přihlásit; výchozí public. */
  accessMode?: import("@/lib/seasons").TournamentAccessMode;
  /** Pořadí kvalifikace v sezóně (1–4). */
  qualificationRound?: number;
  createdAt: import("firebase/firestore").Timestamp;
  updatedAt: import("firebase/firestore").Timestamp;
};

/** `tournaments/{tid}/registrations/{teamId}` */
export type TournamentRegistrationDocument = {
  teamName: string;
  schoolName: string;
  captainId: string;
  gameId: GameId;
  registeredAt: import("firebase/firestore").Timestamp;
};

/** `tournaments/{tid}/invitations/{teamId}` — jen u play-off / LAN. */
export type TournamentInvitationDocument = {
  teamName: string;
  schoolName: string;
  captainId: string;
  captainEmail: string;
  gameId: GameId;
  invitedAt: string;
  status: "invited" | "accepted" | "declined";
  respondedAt?: string;
};

export type TournamentListItem = {
  id: string;
  name: string;
  gameId: GameId;
  phase: TournamentPhase;
  prizePoolText: string;
  published: boolean;
  createdAtMs: number | null;
};
