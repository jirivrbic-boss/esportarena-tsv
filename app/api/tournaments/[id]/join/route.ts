import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { adminDb } from "@/lib/firebase/admin";
import type { TeamDocument } from "@/lib/types";
import type { TournamentDocument } from "@/lib/tournaments";

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
    const db = adminDb();
    const tRef = db.collection("tournaments").doc(tournamentId);
    const tSnap = await tRef.get();
    if (!tSnap.exists) {
      return NextResponse.json({ ok: false, error: "Turnaj neexistuje." }, { status: 404 });
    }
    const tournament = tSnap.data() as TournamentDocument;
    if (!tournament.published) {
      return NextResponse.json(
        { ok: false, error: "Turnaj není zveřejněný." },
        { status: 403 }
      );
    }

    const teamSnap = await db.collection("teams").doc(teamId).get();
    if (!teamSnap.exists) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
    const team = teamSnap.data() as TeamDocument;
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

    const regRef = tRef.collection("registrations").doc(teamId);
    const existing = await regRef.get();
    if (existing.exists) {
      return NextResponse.json(
        { ok: false, error: "Tým je v tomto turnaji už přihlášený." },
        { status: 409 }
      );
    }

    await regRef.set({
      teamName: team.teamName,
      schoolName: team.schoolName,
      captainId: team.captainId,
      gameId: teamGame,
      registeredAt: FieldValue.serverTimestamp(),
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
