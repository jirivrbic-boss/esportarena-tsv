import type { Timestamp } from "firebase/firestore";
import type { GameId } from "@/lib/games";

/** Dokument `tournaments/{id}` ve Firestore. */
export type TournamentDocument = {
  name: string;
  gameId: GameId;
  /** Zobrazení (např. „20 000 Kč“). */
  prizePoolText: string;
  /** Pravidla turnaje (prostý text / markdown-style). */
  rulesText: string;
  faceitUrl: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/** `tournaments/{tid}/registrations/{teamId}` */
export type TournamentRegistrationDocument = {
  teamName: string;
  schoolName: string;
  captainId: string;
  gameId: GameId;
  registeredAt: Timestamp;
};

export type TournamentListItem = {
  id: string;
  name: string;
  gameId: GameId;
  prizePoolText: string;
  published: boolean;
  createdAtMs: number | null;
};
