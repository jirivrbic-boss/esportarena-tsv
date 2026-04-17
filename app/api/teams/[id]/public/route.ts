import { NextResponse } from "next/server";
import type { TeamDocument } from "@/lib/types";
import { adminDb } from "@/lib/firebase/admin";
import { isFirebaseAdminRuntimeError } from "@/lib/firebase/runtime-errors";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID týmu." }, { status: 400 });
  }

  try {
    const db = adminDb();
    const snap = await db.collection("teams").doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
    const team = snap.data() as TeamDocument;
    const legacy = team as TeamDocument & {
      players?: TeamDocument["teammates"];
      reserves?: TeamDocument["substitutes"];
    };
    const teammates = team.teammates ?? legacy.players ?? [];
    const substitutes = team.substitutes ?? legacy.reserves ?? [];

    return NextResponse.json({
      ok: true,
      team: {
        id,
        teamName: team.teamName,
        schoolName: team.schoolName,
        schoolFullName: team.schoolFullName ?? "",
        gameId: team.gameId ?? "cs2",
        captainPlayer: team.captainPlayer ?? null,
        teammates,
        substitutes,
      },
    });
  } catch (e) {
    if (isFirebaseAdminRuntimeError(e)) {
      return NextResponse.json(
        { ok: false, error: "Detail týmu je dočasně nedostupný na tomto hostingu." },
        { status: 503 }
      );
    }
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
