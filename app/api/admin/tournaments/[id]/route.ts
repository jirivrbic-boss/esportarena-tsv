import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { parseGameId, type GameId } from "@/lib/games";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";
import { parseTournamentPhase } from "@/lib/tournaments";
import { parseTournamentAccessMode } from "@/lib/seasons";
import {
  clearTournamentInvitations,
  listTournamentInvitationsRest,
  syncTournamentInvitations,
} from "@/lib/tournament-invitations";
import { getSitePublicUrl } from "@/lib/site-public-url";
import { reportSiteAction } from "@/lib/discord-webhook";

type Ctx = { params: Promise<{ id: string }> };

function parseInvitedTeamIds(body: Record<string, unknown>): string[] | undefined {
  if (!Array.isArray(body.invitedTeamIds)) return undefined;
  return body.invitedTeamIds
    .filter((id): id is string => typeof id === "string")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  try {
    const existing = await getDocRest(`tournaments/${id}`);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Turnaj nenalezen." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (body.gameId !== undefined) {
      const g = parseGameId(String(body.gameId));
      if (!g) {
        return NextResponse.json({ ok: false, error: "Neplatná hra." }, { status: 400 });
      }
      patch.gameId = g;
    }
    if (typeof body.backgroundImageUrl === "string") {
      patch.backgroundImageUrl = body.backgroundImageUrl.trim();
    }
    if (typeof body.startsAt === "string") {
      const raw = body.startsAt.trim();
      patch.startsAt = raw ? new Date(raw).toISOString() : null;
    }
    if (typeof body.prizePoolText === "string") {
      patch.prizePoolText = body.prizePoolText.trim();
    }
    if (typeof body.rulesText === "string") patch.rulesText = body.rulesText.trim();
    if (typeof body.faceitUrl === "string") patch.faceitUrl = body.faceitUrl.trim();
    if (typeof body.published === "boolean") patch.published = body.published;
    if (body.phase !== undefined) patch.phase = parseTournamentPhase(body.phase);
    if (body.seasonId !== undefined) {
      patch.seasonId = typeof body.seasonId === "string" ? body.seasonId.trim() : null;
    }
    if (body.accessMode !== undefined) {
      patch.accessMode = parseTournamentAccessMode(body.accessMode);
    }
    if (body.qualificationRound !== undefined) {
      const n = Number(body.qualificationRound);
      patch.qualificationRound = Number.isFinite(n) && n > 0 ? n : null;
    }

    await upsertDocRest(`tournaments/${id}`, patch);

    const nextPhase = parseTournamentPhase(
      typeof body.phase === "string" ? body.phase : existing.phase ?? "qualification"
    );
    const nextGameId = (patch.gameId ?? existing.gameId ?? "cs2") as GameId;
    const nextName = String(patch.name ?? existing.name ?? "Turnaj");
    const invitedTeamIds = parseInvitedTeamIds(body);

    let inviteSummary: { emailed: number; skipped: number } | null = null;
    if (nextPhase === "qualification") {
      await clearTournamentInvitations(id);
    } else if (invitedTeamIds !== undefined) {
      inviteSummary = await syncTournamentInvitations({
        tournamentId: id,
        tournamentName: nextName,
        gameId: nextGameId,
        invitedTeamIds,
        tournamentUrl: `${getSitePublicUrl(request)}/turnaje/${id}`,
      });
    }

    void reportSiteAction({
      content: "**Turnaj upraven** · admin PATCH",
      title: nextName.slice(0, 256),
      description: [
        `**Tournament ID:** \`${id}\``,
        `**Fáze:** ${nextPhase}`,
        inviteSummary
          ? `**Pozvánky:** odesláno ${inviteSummary.emailed}, přeskočeno ${inviteSummary.skipped}`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });

    return NextResponse.json({ ok: true, inviteSummary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;

  try {
    const exists = await getDocRest(`tournaments/${id}`);
    if (!exists) {
      return NextResponse.json({ ok: false, error: "Turnaj nenalezen." }, { status: 404 });
    }

    const regs = await listCollectionDocsRest(`tournaments/${id}/registrations`, 500);
    await Promise.all(
      regs.map((r) => deleteDocRest(`tournaments/${id}/registrations/${r.id}`))
    );
    const invitations = await listTournamentInvitationsRest(id);
    await Promise.all(
      invitations.map((inv) =>
        deleteDocRest(`tournaments/${id}/invitations/${inv.id}`)
      )
    );
    await deleteDocRest(`tournaments/${id}`);
    void reportSiteAction({
      content: "**Turnaj smazán** · admin DELETE",
      title: String(exists.name ?? "Turnaj").slice(0, 256),
      description: `**Tournament ID:** \`${id}\``,
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
