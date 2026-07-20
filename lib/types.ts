import type { Timestamp } from "firebase/firestore";
import type { GameId } from "@/lib/games";

export type TeamStatus = "pending" | "approved" | "rejected";

export type FreeAgentType = "looking_team" | "looking_player";

export interface RosterPlayer {
  firstName: string;
  lastName: string;
  faceitNickname: string;
  isAdult: boolean;
  studentCertUrl?: string;
  parentConsentUrl?: string;
  faceitElo?: number | null;
}

export interface CoachRoster {
  firstName: string;
  lastName: string;
}

export interface TeamDocument {
  captainId: string;
  /** Hra turnaje; chybějící u starších záznamů = považovat za CS2. */
  gameId?: GameId;
  /** Zkratka školy (např. SPŠ MV Sokolov) používaná ve výpisech. */
  schoolName: string;
  /** Plný název školy. */
  schoolFullName?: string;
  teamName: string;
  status: TeamStatus;
  faceitHubUrl?: string;
  captainPlayer?: RosterPlayer;
  teammates: RosterPlayer[];
  substitutes: RosterPlayer[];
  coach: CoachRoster;
  captainEmail: string;
  captainDiscord: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rejectionReason?: string;
  /** Cesty v Storage + čas nahrání (GDPR cron 48 h) */
  storageMeta: { path: string; uploadedAt: number }[];
}

export interface CaptainProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  discordUsername: string;
  faceitNickname: string;
  steamNickname: string;
  /** LoL — Riot ID včetně tagu (např. Jméno#EUNE). */
  riotId?: string;
  /** Brawl Stars — player tag. */
  brawlPlayerTag?: string;
  /** FC 26 — EA / konzolový účet. */
  eaAccount?: string;
  isAdult: boolean;
  parentConsentUrl?: string;
  studentCertUrl?: string;
  profileComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** Platnost odkladu smazání účtu (Firestore Timestamp). Pouze Admin / server API mění.*/
  pendingDeletionExpiresAt?: Timestamp | null;
  /** SHA-256 celého recovery tokenu (nikdy neukládá plaintext). */
  deletionRecoveryTokenHash?: string | null;
}

export interface FreeAgentDocument {
  type: FreeAgentType;
  gameId: GameId;
  discordUsername: string;
  hoursPlayed: number;
  faceitLevel: number;
  description: string;
  createdAt: Timestamp;
}
