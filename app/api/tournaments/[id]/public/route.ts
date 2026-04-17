import { NextResponse } from "next/server";
import type { TournamentDocument, TournamentRegistrationDocument } from "@/lib/tournaments";
import { adminDb } from "@/lib/firebase/admin";
import { isFirebaseAdminRuntimeError } from "@/lib/firebase/runtime-errors";

type Ctx = { params: Promise<{ id: string }> };

function fmtTs(t: { toDate?: () => Date } | undefined): string {
  if (!t || typeof t.toDate !== "function") return "—";
  try {
    return t.toDate().toLocaleString("cs-CZ");
  } catch {
    return "—";
  }
}

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID." }, { status: 400 });
  }

  try {
    const db = adminDb();
    const tSnap = await db.collection("tournaments").doc(id).get();
    if (!tSnap.exists) {
      return NextResponse.json({ ok: false, error: "Turnaj neexistuje." }, { status: 404 });
    }

    const t = tSnap.data() as TournamentDocument;
    if (!t.published) {
      return NextResponse.json(
        { ok: false, error: "Turnaj není zveřejněný." },
        { status: 404 }
      );
    }

    const rSnap = await db.collection("tournaments").doc(id).collection("registrations").get();
    const registrations = rSnap.docs
      .map((d) => {
        const x = d.data() as TournamentRegistrationDocument;
        return {
          teamId: d.id,
          teamName: x.teamName,
          schoolName: x.schoolName,
          registeredAtLabel: fmtTs(x.registeredAt),
        };
      })
      .sort((a, b) => a.teamName.localeCompare(b.teamName, "cs"));

    return NextResponse.json({
      ok: true,
      tournament: {
        id,
        name: t.name,
        gameId: t.gameId ?? "cs2",
        backgroundImageUrl: t.backgroundImageUrl ?? "",
        startsAtMs: t.startsAt?.toMillis?.() ?? null,
        prizePoolText: t.prizePoolText ?? "",
        rulesText: t.rulesText ?? "",
        faceitUrl: t.faceitUrl ?? "",
      },
      registrations,
    });
  } catch (e) {
    if (isFirebaseAdminRuntimeError(e)) {
      return NextResponse.json(
        { ok: false, error: "Detail turnaje je dočasně nedostupný na tomto hostingu." },
        { status: 503 }
      );
    }
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
