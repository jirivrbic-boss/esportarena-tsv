import type { GameId } from "@/lib/games";
import { SEASON_ACTIVE_GAME_IDS } from "@/lib/season-games";
import { PRIZE_POOL_TBD_MESSAGE } from "@/lib/prize-pool";

export const S4_SEASON_ID = "s4";
export const S4_SEASON_SLUG = "sezona-4";

/** Kdo se může přihlásit do turnaje. */
export type TournamentAccessMode = "public" | "season_enrolled";

export type SeasonRegistrationWindow = {
  opensAt: string;
  closesAt: string;
};

export type SeasonQualificationSlot = {
  round: number;
  label: string;
  startsAt: string;
  tournamentId?: string | null;
};

export type SeasonPlayoffSlot = {
  id: string;
  label: string;
  startsAt: string;
  note?: string;
};

export type SeasonDisciplineSchedule = {
  gameId: GameId;
  registration: SeasonRegistrationWindow;
  qualifications: SeasonQualificationSlot[];
  playoffs: SeasonPlayoffSlot[];
};

export type SeasonDocument = {
  id: string;
  slug: string;
  number: number;
  label: string;
  published: boolean;
  prizePoolText?: string;
  intro?: string;
  disciplines: SeasonDisciplineSchedule[];
  createdAt?: string;
  updatedAt?: string;
};

export type SeasonEnrollmentDocument = {
  teamId: string;
  teamName: string;
  schoolName: string;
  captainId: string;
  gameId: GameId;
  enrolledAt: string;
};

export type QualificationAdvancement = {
  tournamentId: string;
  teamId: string;
  teamName: string;
  schoolName: string;
  gameId: GameId;
  qualificationRound: number;
  placement: number;
};

export type BracketTeamRef = {
  teamId: string;
  teamName: string;
  schoolName: string;
  /** Zobrazení TBA slotu před doplněním týmu z kvalifikace. */
  isPlaceholder?: boolean;
};

export type BracketMatch = {
  id: string;
  round: "r16" | "qf" | "sf" | "final" | "third";
  label: string;
  teamA: BracketTeamRef | null;
  teamB: BracketTeamRef | null;
  winnerTeamId: string | null;
  scheduledAt: string | null;
};

export type SeasonBracketDocument = {
  gameId: GameId;
  matches: BracketMatch[];
  updatedAt: string;
};

function prague(isoLocal: string): string {
  return isoLocal;
}

/** Výchozí harmonogram Sezóny 4 (CET). */
export const S4_DEFAULT_SCHEDULE: SeasonDisciplineSchedule[] = [
  {
    gameId: "cs2",
    registration: {
      opensAt: prague("2026-09-01T17:00:00+02:00"),
      closesAt: prague("2026-11-04T23:59:59+01:00"),
    },
    qualifications: [
      { round: 1, label: "Kvalifikace 1", startsAt: prague("2026-11-06T18:00:00+01:00") },
      { round: 2, label: "Kvalifikace 2", startsAt: prague("2026-11-14T18:00:00+01:00") },
      { round: 3, label: "Kvalifikace 3", startsAt: prague("2026-11-20T18:00:00+01:00") },
      { round: 4, label: "Kvalifikace 4", startsAt: prague("2026-11-28T18:00:00+01:00") },
    ],
    playoffs: [
      { id: "r16", label: "Osmifinále", startsAt: prague("2026-12-04T18:00:00+01:00") },
      { id: "qf", label: "Čtvrtfinále", startsAt: prague("2026-12-12T18:00:00+01:00") },
      {
        id: "lan",
        label: "Semifinále, finále, zápas o 3. místo",
        startsAt: prague("2026-12-16T10:00:00+01:00"),
        note: "Sraz a přípravy účastníků v 9:00",
      },
    ],
  },
  {
    gameId: "lol",
    registration: {
      opensAt: prague("2026-09-01T00:00:00+02:00"),
      closesAt: prague("2026-11-04T23:59:59+01:00"),
    },
    qualifications: [
      { round: 1, label: "Kvalifikace 1", startsAt: prague("2026-11-07T18:00:00+01:00") },
      { round: 2, label: "Kvalifikace 2", startsAt: prague("2026-11-13T18:00:00+01:00") },
      { round: 3, label: "Kvalifikace 3", startsAt: prague("2026-11-21T18:00:00+01:00") },
      { round: 4, label: "Kvalifikace 4", startsAt: prague("2026-11-27T18:00:00+01:00") },
    ],
    playoffs: [
      { id: "r16", label: "Osmifinále", startsAt: prague("2026-12-05T18:00:00+01:00") },
      { id: "qf", label: "Čtvrtfinále", startsAt: prague("2026-12-11T18:00:00+01:00") },
      {
        id: "lan",
        label: "Semifinále, finále, zápas o 3. místo",
        startsAt: prague("2026-12-17T10:00:00+01:00"),
        note: "Sraz a přípravy účastníků v 9:00",
      },
    ],
  },
];

export const S4_DEFAULT_SEASON: Omit<SeasonDocument, "createdAt" | "updatedAt"> = {
  id: S4_SEASON_ID,
  slug: S4_SEASON_SLUG,
  number: 4,
  label: "Sezóna 4",
  published: true,
  prizePoolText: PRIZE_POOL_TBD_MESSAGE,
  intro:
    "Školní turnaj ESPORTARENA TSV pro české a slovenské školy. Nejdřív se kapitán přihlásí týmem do sezóny, poté do jednotlivých kvalifikací. Z každé kvalifikace postupují 4 nejlepší týmy do pavouka.",
  disciplines: S4_DEFAULT_SCHEDULE,
};

export function disciplineForGame(
  season: Pick<SeasonDocument, "disciplines">,
  gameId: GameId
): SeasonDisciplineSchedule | null {
  return season.disciplines.find((d) => d.gameId === gameId) ?? null;
}

export function isSeasonRegistrationOpen(
  window: SeasonRegistrationWindow,
  now = new Date()
): boolean {
  const t = now.getTime();
  return t >= Date.parse(window.opensAt) && t <= Date.parse(window.closesAt);
}

export function formatSeasonDateTime(iso: string): string {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Prague",
  });
}

export function seasonActiveGameIds(): GameId[] {
  return [...SEASON_ACTIVE_GAME_IDS];
}

export function parseTournamentAccessMode(value: unknown): TournamentAccessMode {
  return value === "season_enrolled" ? "season_enrolled" : "public";
}

export const TOURNAMENT_ACCESS_MODES: {
  id: TournamentAccessMode;
  label: string;
  hint: string;
}[] = [
  {
    id: "public",
    label: "Všichni (schválený tým)",
    hint: "Každý schválený tým dané hry se může přihlásit.",
  },
  {
    id: "season_enrolled",
    label: "Jen týmy v sezóně",
    hint: "Tým musí být zapsaný v příslušné sezóně (např. Sezóna 4) a schválený.",
  },
];
