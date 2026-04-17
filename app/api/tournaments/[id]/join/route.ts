import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import type { TeamDocument } from "@/lib/types";
import type { TournamentDocument } from "@/lib/tournaments";
import { gameLabel } from "@/lib/games";
import { notifyDiscordTournamentJoin } from "@/lib/discord-webhook";
import {
  getDocRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid || !user.email) {
    return NextResponse.json(
      { ok: false, error: "Nepřihlášen nebo neplatný token." },
      { status: 401 }
    );
  }

  const { id: tournamentId } = await ctx.params;

  let body: { teamId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const teamId = body.teamId?.trim();
  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Chybí výběr týmu (teamId)." }, { status: 400 });
  }

  try {
    const tournament = (await getDocRest(`tournaments/${tournamentId}`)) as TournamentDocument | null;
    if (!tournament) {
      return NextResponse.json({ ok: false, error: "Turnaj neexistuje." }, { status: 404 });
    }
    if (!tournament.published) {
      return NextResponse.json(
        { ok: false, error: "Turnaj není zveřejněný." },
        { status: 403 }
      );
    }

    const team = (await getDocRest(`teams/${teamId}`)) as TeamDocument | null;
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
    if (team.captainId !== user.uid) {
      return NextResponse.json(
        { ok: false, error: "Tento tým není pod tvým účtem." },
        { status: 403 }
      );
    }
    const teamGame = team.gameId ?? "cs2";
    if (teamGame !== tournament.gameId) {
      return NextResponse.json(
        { ok: false, error: "Hra tvého týmu musí odpovídat turnaji." },
        { status: 400 }
      );
    }
    if (team.status !== "approved") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Tým musí být nejdřív schválen. Po schválení ho můžeš přihlásit do turnaje.",
        },
        { status: 400 }
      );
    }

    const existing = await getDocRest(`tournaments/${tournamentId}/registrations/${teamId}`);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Tým je v tomto turnaji už přihlášený." },
        { status: 409 }
      );
    }

    await upsertDocRest(`tournaments/${tournamentId}/registrations/${teamId}`, {
      teamName: team.teamName,
      schoolName: team.schoolName,
      captainId: team.captainId,
      gameId: teamGame,
      registeredAt: new Date().toISOString(),
    });

    await notifyDiscordTournamentJoin({
      tournamentId,
      tournamentName: tournament.name ?? "Turnaj",
      teamId,
      teamName: team.teamName ?? "Tým",
      schoolName: team.schoolName,
      captainEmail: team.captainEmail,
      gameLabel: gameLabel(teamGame),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    if (msg.includes("FIREBASE_SERVICE_ACCOUNT_JSON")) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Na serveru chybí FIREBASE_SERVICE_ACCOUNT_JSON — přihlášení týmu do turnaje teď nejde.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
