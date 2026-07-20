import { NextResponse } from "next/server";
import { listPublishedTournamentsRest } from "@/lib/firebase/firestore-rest-admin";
import { displayPrizePoolText } from "@/lib/prize-pool";
import {
  formatTournamentStartsAt,
  isTournamentActive,
} from "@/lib/tournament-list";

export async function GET() {
  try {
    const tournaments = (await listPublishedTournamentsRest())
      .map((t) => ({
        id: t.id,
        name: t.name || "Bez názvu",
        gameId: t.gameId || "cs2",
        prizePoolText: t.prizePoolText,
        createdAtMs: t.createdAtMs ?? 0,
        startsAtMs: t.startsAtMs ?? null,
      }))
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 100)
      .map((t) => ({
        id: t.id,
        name: t.name,
        gameId: t.gameId,
        prizePoolText: displayPrizePoolText(t.prizePoolText),
        startsAtMs: t.startsAtMs,
        isActive: isTournamentActive(t.startsAtMs),
        startsAtLabel: formatTournamentStartsAt(t.startsAtMs),
      }));

    return NextResponse.json({ ok: true, tournaments });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
