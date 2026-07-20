import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { GAME_IDS } from "@/lib/games";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";
import { reportSiteAction } from "@/lib/discord-webhook";

const TEAM_PATCH_KEYS = [
  "teamName",
  "schoolName",
  "schoolFullName",
  "captainEmail",
  "captainDiscord",
  "faceitHubUrl",
  "gameId",
  "status",
  "rejectionReason",
  "teammates",
  "substitutes",
  "coach",
  "captainPlayer",
] as const;

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID týmu." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  try {
    const team = await getDocRest(`teams/${id}`);
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    for (const key of TEAM_PATCH_KEYS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        patch[key] = body[key];
      }
    }

    if (patch.status !== undefined) {
      const s = String(patch.status);
      if (!["pending", "approved", "rejected"].includes(s)) {
        return NextResponse.json(
          { ok: false, error: "Neplatný stav týmu." },
          { status: 400 }
        );
      }
      patch.status = s;
    }

    if (patch.gameId !== undefined) {
      const g = String(patch.gameId);
      if (!GAME_IDS.includes(g as (typeof GAME_IDS)[number])) {
        return NextResponse.json(
          { ok: false, error: "Neplatná hra (gameId)." },
          { status: 400 }
        );
      }
      patch.gameId = g;
    }

    await upsertDocRest(`teams/${id}`, patch);
    const updated = await getDocRest(`teams/${id}`);
    const teamName = String(
      (updated as { teamName?: string } | null)?.teamName ??
        (team as { teamName?: string }).teamName ??
        "Tým"
    );
    const changedKeys = Object.keys(patch).filter((k) => k !== "updatedAt");
    void reportSiteAction({
      content: "**Tým upraven** · admin PATCH",
      title: teamName.slice(0, 256),
      description: [
        `**Team ID:** \`${id}\``,
        changedKeys.length
          ? `**Pole:** ${changedKeys.slice(0, 20).join(", ")}`
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
    return NextResponse.json({ ok: true, team: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Neplatné ID týmu." }, { status: 400 });
  }

  try {
    const team = await getDocRest(`teams/${id}`);
    if (!team) {
      return NextResponse.json({ ok: false, error: "Tým neexistuje." }, { status: 404 });
    }

    const tournaments = await listCollectionDocsRest("tournaments", 300);
    await Promise.all(
      tournaments.map((t) =>
        deleteDocRest(`tournaments/${t.id}/registrations/${id}`).catch(() => false)
      )
    );
    await deleteDocRest(`teams/${id}`);

    const teamName = String((team as { teamName?: string }).teamName ?? "Tým");
    void reportSiteAction({
      content: "**Tým smazán** · admin DELETE",
      title: teamName.slice(0, 256),
      description: `**Team ID:** \`${id}\``,
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba serveru";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
