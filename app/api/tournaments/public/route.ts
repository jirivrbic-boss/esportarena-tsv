import { NextResponse } from "next/server";
import { listPublishedTournamentsRest } from "@/lib/firebase/firestore-rest-admin";

export async function GET() {
  try {
    const tournaments = (await listPublishedTournamentsRest())
      .map((t) => ({
        id: t.id,
        name: t.name || "Bez názvu",
        gameId: t.gameId || "cs2",
        prizePoolText: t.prizePoolText,
        createdAtMs: t.createdAtMs ?? 0,
      }))
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 100)
      .map((t) => ({
        id: t.id,
        name: t.name,
        gameId: t.gameId,
        prizePoolText: t.prizePoolText,
      }));

    return NextResponse.json({ ok: true, tournaments });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
