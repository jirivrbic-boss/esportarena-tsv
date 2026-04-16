import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminBearer } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { parseGameId } from "@/lib/games";
import { gameLabel } from "@/lib/games";
import type { TournamentDocument } from "@/lib/tournaments";
import { notifyDiscordTournamentCreated } from "@/lib/discord-webhook";

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const db = adminDb();
    const snap = await db
      .collection("tournaments")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const tournaments = snap.docs.map((d) => {
      const x = d.data() as Partial<TournamentDocument>;
      return {
        id: d.id,
        name: x.name ?? "",
        gameId: x.gameId ?? "cs2",
        backgroundImageUrl: x.backgroundImageUrl ?? "",
        startsAtMs: x.startsAt?.toMillis?.() ?? null,
        prizePoolText: x.prizePoolText ?? "",
        rulesText: x.rulesText ?? "",
        faceitUrl: x.faceitUrl ?? "",
        published: Boolean(x.published),
        createdAtMs: x.createdAt?.toMillis?.() ?? null,
        updatedAtMs: x.updatedAt?.toMillis?.() ?? null,
      };
    });
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

  if (!name || !gameId) {
    return NextResponse.json(
      { ok: false, error: "Vyplň název turnaje a hru." },
      { status: 400 }
    );
  }

  try {
    const db = adminDb();
    const ref = db.collection("tournaments").doc();
    await ref.set({
      name,
      gameId,
      backgroundImageUrl,
      startsAt: startsAtRaw ? new Date(startsAtRaw) : null,
      prizePoolText,
      rulesText,
      faceitUrl,
      published,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    await notifyDiscordTournamentCreated({
      tournamentId: ref.id,
      name,
      gameLabel: gameLabel(gameId),
      published,
      startsAt: startsAtRaw
        ? new Date(startsAtRaw).toLocaleString("cs-CZ")
        : null,
    });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
