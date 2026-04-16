import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { adminDb } from "@/lib/firebase/admin";
import type { TeamDocument } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, ctx: Ctx) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json(
      { ok: false, error: "Nepřihlášen nebo neplatný token." },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID týmu." }, { status: 400 });
  }

  try {
    const db = adminDb();
    const teamRef = db.collection("teams").doc(id);
    const teamSnap = await teamRef.get();
    if (!teamSnap.exists) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
    const team = teamSnap.data() as TeamDocument;
    if (team.captainId !== user.uid) {
      return NextResponse.json({ ok: false, error: "Nemáš právo smazat tento tým." }, { status: 403 });
    }

    // Smaž i registrace týmu ze všech turnajů, aby nezůstaly sirotčí záznamy.
    const tournaments = await db.collection("tournaments").get();
    const batch = db.batch();
    tournaments.docs.forEach((t) => {
      batch.delete(t.ref.collection("registrations").doc(id));
    });
    batch.delete(teamRef);
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
