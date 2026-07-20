import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { getDocRest, listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";
import { parseGameId } from "@/lib/games";
import {
  getSeasonBracketRest,
  getSeasonRest,
  listQualificationAdvancementsRest,
  upsertQualificationAdvancementRest,
  upsertSeasonBracketRest,
} from "@/lib/seasons-firestore";
import type { BracketMatch } from "@/lib/seasons";
import { applyQualificationSeeding } from "@/lib/season-bracket";
import type { TeamDocument } from "@/lib/types";
import { reportSiteAction } from "@/lib/discord-webhook";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: seasonId } = await ctx.params;
  const url = new URL(request.url);
  const gameId = parseGameId(url.searchParams.get("gameId"));
  const tournamentId = url.searchParams.get("tournamentId")?.trim();
  if (!gameId && !tournamentId) {
    return NextResponse.json({ ok: false, error: "Chybí gameId." }, { status: 400 });
  }

  const [season, bracket, advancements] = await Promise.all([
    getSeasonRest(seasonId),
    gameId ? getSeasonBracketRest(seasonId, gameId) : Promise.resolve(null),
    gameId
      ? listQualificationAdvancementsRest(seasonId, gameId)
      : Promise.resolve([]),
  ]);

  let registrations: Array<{
    teamId: string;
    teamName: string;
    schoolName: string;
  }> = [];
  if (tournamentId) {
    const rows = await listCollectionDocsRest(
      `tournaments/${tournamentId}/registrations`,
      300
    );
    registrations = rows.map((r) => ({
      teamId: String(r.id),
      teamName: String(r.teamName ?? ""),
      schoolName: String(r.schoolName ?? ""),
    }));
  }

  return NextResponse.json({
    ok: true,
    season,
    bracket,
    advancements,
    registrations,
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: seasonId } = await ctx.params;
  let body: {
    tournamentId?: string;
    advances?: { teamId: string; placement: number }[];
    autoBracket?: boolean;
    gameId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const tournamentId = body.tournamentId?.trim();
  const advances = body.advances ?? [];
  if (!tournamentId || advances.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Vyplň tournamentId a seznam postupujících (placement 1–4)." },
      { status: 400 }
    );
  }

  const tournament = await getDocRest(`tournaments/${tournamentId}`);
  if (!tournament) {
    return NextResponse.json({ ok: false, error: "Turnaj neexistuje." }, { status: 404 });
  }

  const gameId = parseGameId(String(tournament.gameId ?? body.gameId ?? ""));
  const qualRound = Number(tournament.qualificationRound ?? 0);
  if (!gameId || !qualRound) {
    return NextResponse.json(
      { ok: false, error: "Turnaj nemá hru nebo číslo kvalifikace." },
      { status: 400 }
    );
  }

  const saved = [];
  for (const row of advances) {
    const placement = Number(row.placement);
    if (placement < 1 || placement > 4) continue;
    const team = (await getDocRest(`teams/${row.teamId}`)) as TeamDocument | null;
    if (!team) continue;
    const entry = {
      tournamentId,
      teamId: row.teamId,
      teamName: team.teamName ?? "",
      schoolName: team.schoolName ?? "",
      gameId,
      qualificationRound: qualRound,
      placement,
    };
    await upsertQualificationAdvancementRest(seasonId, entry);
    saved.push(entry);
  }

  if (body.autoBracket) {
    const bracket = await getSeasonBracketRest(seasonId, gameId);
    if (bracket) {
      const all = await listQualificationAdvancementsRest(seasonId, gameId);
      const seeded = applyQualificationSeeding(bracket, all);
      await upsertSeasonBracketRest(seasonId, seeded);
    }
  }

  void reportSiteAction({
    content: "**Kvalifikace** · výsledky uloženy",
    title: `Sezóna ${seasonId} · ${gameId}`,
    description: [
      `**Turnaj:** \`${tournamentId}\``,
      `**Kolo:** ${qualRound}`,
      `**Uloženo postupů:** ${saved.length}`,
      body.autoBracket ? "**Auto bracket:** ano" : null,
    ]
      .filter(Boolean)
      .join("\n"),
    fields: [
      ...(auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : []),
    ],
  });

  return NextResponse.json({ ok: true, saved });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id: seasonId } = await ctx.params;
  let body: {
    gameId?: string;
    matches?: BracketMatch[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const gameId = parseGameId(body.gameId ?? "");
  if (!gameId || !Array.isArray(body.matches)) {
    return NextResponse.json({ ok: false, error: "Chybí gameId nebo matches." }, { status: 400 });
  }

  await upsertSeasonBracketRest(seasonId, {
    gameId,
    matches: body.matches,
    updatedAt: new Date().toISOString(),
  });

  void reportSiteAction({
    content: "**Bracket** · aktualizace zápasů",
    title: `Sezóna ${seasonId} · ${gameId}`,
    description: `**Zápasů:** ${body.matches.length}`,
    fields: [
      ...(auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : []),
    ],
  });

  return NextResponse.json({ ok: true });
}
