import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import type { TeamDocument } from "@/lib/types";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
} from "@/lib/firebase/firestore-rest-admin";

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
    const teamData = await getDocRest(`teams/${id}`);
    if (!teamData) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
    const team = teamData as unknown as TeamDocument;
    if (team.captainId !== user.uid) {
      return NextResponse.json({ ok: false, error: "Nemáš právo smazat tento tým." }, { status: 403 });
    }

    // Smaž i registrace týmu ze všech turnajů, aby nezůstaly sirotčí záznamy.
    const tournaments = await listCollectionDocsRest("tournaments", 300);
    await Promise.all(
      tournaments.map((t) =>
        deleteDocRest(`tournaments/${t.id}/registrations/${id}`).catch(() => false)
      )
    );
    await deleteDocRest(`teams/${id}`);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
