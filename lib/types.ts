import type { Timestamp } from "firebase/firestore";

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
  schoolName: string;
  teamName: string;
  status: TeamStatus;
  faceitHubUrl?: string;
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
  phone: string;
  discordUsername: string;
  faceitNickname: string;
  steamNickname: string;
  isAdult: boolean;
  parentConsentUrl?: string;
  studentCertUrl?: string;
  profileComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FreeAgentDocument {
  type: FreeAgentType;
  discordUsername: string;
  hoursPlayed: number;
  faceitLevel: number;
  description: string;
  createdAt: Timestamp;
}
