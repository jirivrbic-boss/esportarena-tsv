import { NextResponse } from "next/server";
import type { TournamentDocument } from "@/lib/tournaments";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  try {
    const db = adminDb();
    const snap = await db.collection("tournaments").where("published", "==", true).get();

    const tournaments = snap.docs
      .map((d) => {
      const x = d.data() as Partial<TournamentDocument>;
      return {
        id: d.id,
        name: x.name ?? "Bez názvu",
        gameId: x.gameId ?? "cs2",
        prizePoolText: x.prizePoolText ?? "",
        createdAtMs: x.createdAt?.toMillis?.() ?? 0,
      };
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 100)
      .map(({ createdAtMs: _createdAtMs, ...rest }) => rest);

    return NextResponse.json({ ok: true, tournaments });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
