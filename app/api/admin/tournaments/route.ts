import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { parseGameId } from "@/lib/games";
import { gameLabel } from "@/lib/games";
import { notifyDiscordTournamentCreated } from "@/lib/discord-webhook";
import { createTournamentRest, listTournamentsAdminRest } from "@/lib/firebase/firestore-rest-admin";
import { parseTournamentPhase } from "@/lib/tournaments";
import { parseTournamentAccessMode } from "@/lib/seasons";
import { syncTournamentInvitations } from "@/lib/tournament-invitations";
import { getSitePublicUrl } from "@/lib/site-public-url";

function parseInvitedTeamIds(body: Record<string, unknown>): string[] {
  if (!Array.isArray(body.invitedTeamIds)) return [];
  return body.invitedTeamIds
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const tournaments = await listTournamentsAdminRest();
    return NextResponse.json({ ok: true, tournaments });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const gameId = parseGameId(String(body.gameId ?? ""));
  const backgroundImageUrl = String(body.backgroundImageUrl ?? "").trim();
  const prizePoolText = String(body.prizePoolText ?? "").trim();
  const rulesText = String(body.rulesText ?? "").trim();
  const faceitUrl = String(body.faceitUrl ?? "").trim();
  const startsAtRaw = String(body.startsAt ?? "").trim();
  const published = Boolean(body.published);
  const phase = parseTournamentPhase(body.phase);
  const invitedTeamIds = parseInvitedTeamIds(body);
  const seasonId = typeof body.seasonId === "string" ? body.seasonId.trim() : "";
  const accessMode = parseTournamentAccessMode(body.accessMode);
  const qualificationRound =
    body.qualificationRound != null && body.qualificationRound !== ""
      ? Number(body.qualificationRound)
      : undefined;

  if (!name || !gameId) {
    return NextResponse.json(
      { ok: false, error: "Vyplň název turnaje a hru." },
      { status: 400 }
    );
  }

  try {
    const { id } = await createTournamentRest({
      name,
      gameId,
      phase,
      backgroundImageUrl,
      startsAt: startsAtRaw,
      prizePoolText,
      rulesText,
      faceitUrl,
      published,
      seasonId: seasonId || undefined,
      accessMode,
      qualificationRound:
        qualificationRound && qualificationRound > 0 ? qualificationRound : undefined,
    });

    let inviteSummary: { emailed: number; skipped: number } | null = null;
    if (phase === "playoff" && invitedTeamIds.length > 0) {
      inviteSummary = await syncTournamentInvitations({
        tournamentId: id,
        tournamentName: name,
        gameId,
        invitedTeamIds,
        tournamentUrl: `${getSitePublicUrl(request)}/turnaje/${id}`,
      });
    }

    await notifyDiscordTournamentCreated({
      tournamentId: id,
      name,
      gameLabel: gameLabel(gameId),
      published,
      startsAt: startsAtRaw
        ? new Date(startsAtRaw).toLocaleString("cs-CZ")
        : null,
    });
    return NextResponse.json({ ok: true, id, inviteSummary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
