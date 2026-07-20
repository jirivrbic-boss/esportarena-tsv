import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import type { TeamDocument } from "@/lib/types";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";
import {
  getSeasonEnrollmentRest,
  getSeasonBySlugRest,
  getSeasonRest,
  writeSeasonEnrollmentRest,
} from "@/lib/seasons-firestore";
import {
  disciplineForGame,
  isSeasonRegistrationOpen,
  S4_SEASON_SLUG,
  type SeasonDocument,
} from "@/lib/seasons";
import { isSeasonActiveGame } from "@/lib/season-games";
import { reportSiteAction } from "@/lib/discord-webhook";
import { gameLabel } from "@/lib/games";

type Ctx = { params: Promise<{ id: string }> };

async function resolveSeason(idOrSlug: string): Promise<SeasonDocument | null> {
  if (idOrSlug === S4_SEASON_SLUG) {
    return getSeasonBySlugRest(S4_SEASON_SLUG);
  }
  return ((await getSeasonRest(idOrSlug)) ?? getSeasonBySlugRest(idOrSlug)) as SeasonDocument | null;
}

export async function POST(request: Request, ctx: Ctx) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json({ ok: false, error: "Nepřihlášen." }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: { teamId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const teamId = body.teamId?.trim();
  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Vyber tým." }, { status: 400 });
  }

  try {
    const season = await resolveSeason(id);
    if (!season?.published) {
      return NextResponse.json({ ok: false, error: "Sezóna není k dispozici." }, { status: 404 });
    }
    const seasonId = String(season.id ?? id);

    const team = (await getDocRest(`teams/${teamId}`)) as TeamDocument | null;
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }
    if (team.captainId !== user.uid) {
      return NextResponse.json({ ok: false, error: "Tento tým není pod tvým účtem." }, { status: 403 });
    }
    if (team.status !== "approved") {
      return NextResponse.json(
        {
          ok: false,
          error: "Tým musí být schválený administrátorem, než ho zapíšeš do sezóny.",
        },
        { status: 400 }
      );
    }

    const gameId = team.gameId ?? "cs2";
    if (!isSeasonActiveGame(gameId)) {
      return NextResponse.json(
        { ok: false, error: "Tato hra není v aktuální sezóně aktivní." },
        { status: 400 }
      );
    }

    const discipline = disciplineForGame(season, gameId);
    if (!discipline) {
      return NextResponse.json(
        { ok: false, error: "Hra není v harmonogramu sezóny." },
        { status: 400 }
      );
    }
    if (!isSeasonRegistrationOpen(discipline.registration)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Registrace do sezóny pro tuto hru právě neběží.",
        },
        { status: 400 }
      );
    }

    const existing = await getSeasonEnrollmentRest(seasonId, teamId);
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Tým je v sezóně už zapsaný." },
        { status: 409 }
      );
    }

    await writeSeasonEnrollmentRest(seasonId, {
      teamId,
      teamName: team.teamName ?? "",
      schoolName: team.schoolName ?? "",
      captainId: team.captainId,
      gameId,
      enrolledAt: new Date().toISOString(),
    });

    void reportSiteAction({
      content: "**Zápis do sezóny** · kapitán",
      title: (team.teamName ?? "Tým").slice(0, 256),
      description: [
        `**Sezóna:** ${season.label ?? seasonId}`,
        `**Hra:** ${gameLabel(gameId)}`,
        team.schoolName ? `**Škola:** ${team.schoolName}` : null,
        user.email ? `**Kapitán:** ${user.email}` : null,
        `**Team ID:** \`${teamId}\``,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chyba serveru" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, ctx: Ctx) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json({ ok: false, error: "Nepřihlášen." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId")?.trim();
  if (!teamId) {
    return NextResponse.json({ ok: false, error: "Chybí teamId." }, { status: 400 });
  }

  const season = await resolveSeason(id);
  if (!season) {
    return NextResponse.json({ ok: false, error: "Sezóna nenalezena." }, { status: 404 });
  }
  const seasonId = String(season.id ?? id);
  const enrollment = await getSeasonEnrollmentRest(seasonId, teamId);
  return NextResponse.json({ ok: true, enrolled: Boolean(enrollment), enrollment });
}
