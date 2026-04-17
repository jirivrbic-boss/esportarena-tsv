import { NextResponse } from "next/server";
import type { TournamentDocument, TournamentRegistrationDocument } from "@/lib/tournaments";
import { getDocRest, listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";

type Ctx = { params: Promise<{ id: string }> };

function fmtTs(t: string | undefined): string {
  if (!t) return "—";
  try {
    return new Date(t).toLocaleString("cs-CZ");
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
    const t = (await getDocRest(`tournaments/${id}`)) as (TournamentDocument & { startsAt?: string }) | null;
    if (!t) {
      return NextResponse.json({ ok: false, error: "Turnaj neexistuje." }, { status: 404 });
    }

    if (!t.published) {
      return NextResponse.json(
        { ok: false, error: "Turnaj není zveřejněný." },
        { status: 404 }
      );
    }

    const registrations = (await listCollectionDocsRest(`tournaments/${id}/registrations`, 300))
      .map((x) => {
        const row = x as TournamentRegistrationDocument & { id: string; registeredAt?: string };
        return {
          teamId: row.id,
          teamName: row.teamName,
          schoolName: row.schoolName,
          registeredAtLabel: fmtTs(row.registeredAt),
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
        startsAtMs: t.startsAt ? Date.parse(t.startsAt) || null : null,
        prizePoolText: t.prizePoolText ?? "",
        rulesText: t.rulesText ?? "",
        faceitUrl: t.faceitUrl ?? "",
      },
      registrations,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
