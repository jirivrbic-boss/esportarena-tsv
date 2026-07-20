import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";
import { listTournamentInvitationsRest } from "@/lib/tournament-invitations";
import { parseTournamentPhase } from "@/lib/tournaments";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json(
      { ok: false, error: "Nepřihlášen nebo neplatný token." },
      { status: 401 }
    );
  }

  const { id: tournamentId } = await ctx.params;

  try {
    const tournament = await getDocRest(`tournaments/${tournamentId}`);
    if (!tournament || !tournament.published) {
      return NextResponse.json({ ok: false, error: "Turnaj není dostupný." }, { status: 404 });
    }

    const phase = parseTournamentPhase(tournament.phase);
    if (phase !== "playoff") {
      return NextResponse.json({ ok: true, phase, invitations: [] });
    }

    const all = await listTournamentInvitationsRest(tournamentId);
    const mine = all.filter((inv) => inv.captainId === user.uid);

    return NextResponse.json({
      ok: true,
      phase,
      invitations: mine.map((inv) => ({
        teamId: inv.id,
        teamName: inv.teamName,
        schoolName: inv.schoolName,
        status: inv.status,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
