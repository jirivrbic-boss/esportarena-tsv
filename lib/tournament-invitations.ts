import { gameLabel, type GameId } from "@/lib/games";
import { sendPlayoffInvitationEmail } from "@/lib/resend-tournament-invite";
import type { TournamentInvitationDocument } from "@/lib/tournaments";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";
import type { TeamDocument } from "@/lib/types";

function asInvitation(
  row: Record<string, unknown> & { id: string }
): TournamentInvitationDocument & { id: string } {
  return {
    id: row.id,
    teamName: String(row.teamName ?? ""),
    schoolName: String(row.schoolName ?? ""),
    captainId: String(row.captainId ?? ""),
    captainEmail: String(row.captainEmail ?? ""),
    gameId: (row.gameId ?? "cs2") as GameId,
    invitedAt: String(row.invitedAt ?? ""),
    status:
      row.status === "accepted" || row.status === "declined" ? row.status : "invited",
    respondedAt: typeof row.respondedAt === "string" ? row.respondedAt : undefined,
  };
}

export async function listTournamentInvitationsRest(
  tournamentId: string
): Promise<Array<TournamentInvitationDocument & { id: string }>> {
  const rows = await listCollectionDocsRest(`tournaments/${tournamentId}/invitations`, 500);
  return rows.map(asInvitation);
}

export async function syncTournamentInvitations(params: {
  tournamentId: string;
  tournamentName: string;
  gameId: GameId;
  invitedTeamIds: string[];
  tournamentUrl: string;
}): Promise<{ emailed: number; skipped: number }> {
  const { tournamentId, tournamentName, gameId, invitedTeamIds, tournamentUrl } = params;
  const uniqueIds = [...new Set(invitedTeamIds.map((id) => id.trim()).filter(Boolean))];
  const nextSet = new Set(uniqueIds);

  const existing = await listTournamentInvitationsRest(tournamentId);
  const existingMap = new Map(existing.map((row) => [row.id, row]));

  for (const inv of existing) {
    if (nextSet.has(inv.id)) continue;
    if (inv.status === "accepted") continue;
    await deleteDocRest(`tournaments/${tournamentId}/invitations/${inv.id}`);
  }

  let emailed = 0;
  let skipped = 0;

  for (const teamId of uniqueIds) {
    const team = (await getDocRest(`teams/${teamId}`)) as TeamDocument | null;
    if (!team || team.status !== "approved") {
      skipped += 1;
      continue;
    }
    const teamGame = (team.gameId ?? "cs2") as GameId;
    if (teamGame !== gameId) {
      skipped += 1;
      continue;
    }

    const prev = existingMap.get(teamId);
    if (prev?.status === "accepted") {
      continue;
    }

    const shouldEmail = !prev || prev.status === "declined";

    await upsertDocRest(`tournaments/${tournamentId}/invitations/${teamId}`, {
      teamName: team.teamName,
      schoolName: team.schoolName,
      captainId: team.captainId,
      captainEmail: team.captainEmail,
      gameId: teamGame,
      invitedAt: prev?.invitedAt ?? new Date().toISOString(),
      status: "invited",
      respondedAt: null,
    });

    if (shouldEmail && team.captainEmail?.trim()) {
      const result = await sendPlayoffInvitationEmail({
        to: team.captainEmail.trim(),
        teamName: team.teamName,
        tournamentName,
        gameLabel: gameLabel(gameId),
        tournamentUrl,
      });
      if (result.ok) emailed += 1;
    }
  }

  return { emailed, skipped };
}

export async function clearTournamentInvitations(tournamentId: string): Promise<void> {
  const rows = await listTournamentInvitationsRest(tournamentId);
  await Promise.all(
    rows.map((row) => deleteDocRest(`tournaments/${tournamentId}/invitations/${row.id}`))
  );
}

export async function markInvitationAccepted(
  tournamentId: string,
  teamId: string
): Promise<void> {
  await upsertDocRest(`tournaments/${tournamentId}/invitations/${teamId}`, {
    status: "accepted",
    respondedAt: new Date().toISOString(),
  });
}
