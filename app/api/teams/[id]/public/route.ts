import { NextResponse } from "next/server";
import type { TeamDocument } from "@/lib/types";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID týmu." }, { status: 400 });
  }

  try {
    const team = (await getDocRest(`teams/${id}`)) as TeamDocument | null;
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
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
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
