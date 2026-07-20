import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { parseGameId } from "@/lib/games";
import {
  deleteDocRest,
  getDocRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";
import type { FreeAgentType } from "@/lib/types";
import { reportSiteAction } from "@/lib/discord-webhook";

type Ctx = { params: Promise<{ id: string }> };

function parseType(value: unknown): FreeAgentType | null {
  return value === "looking_team" || value === "looking_player" ? value : null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Chybí ID." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  try {
    const existing = await getDocRest(`free_agents/${id}`);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Inzerát nenalezen." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.type !== undefined) {
      const type = parseType(body.type);
      if (!type) {
        return NextResponse.json({ ok: false, error: "Neplatný typ." }, { status: 400 });
      }
      patch.type = type;
    }
    if (body.gameId !== undefined) {
      const gameId = parseGameId(String(body.gameId));
      if (!gameId) {
        return NextResponse.json({ ok: false, error: "Neplatná hra." }, { status: 400 });
      }
      patch.gameId = gameId;
    }
    if (typeof body.discordUsername === "string") {
      const discordUsername = body.discordUsername.trim().slice(0, 120);
      if (!discordUsername) {
        return NextResponse.json({ ok: false, error: "Discord je povinný." }, { status: 400 });
      }
      patch.discordUsername = discordUsername;
    }
    if (typeof body.description === "string") {
      const description = body.description.trim().slice(0, 4000);
      if (!description) {
        return NextResponse.json({ ok: false, error: "Popis je povinný." }, { status: 400 });
      }
      patch.description = description;
    }
    if (body.hoursPlayed !== undefined) {
      patch.hoursPlayed = Math.max(0, Math.min(50000, Number(body.hoursPlayed) || 0));
    }
    if (body.faceitLevel !== undefined) {
      patch.faceitLevel = Math.max(0, Math.min(10, Number(body.faceitLevel) || 0));
    }

    const nextGameId =
      (typeof patch.gameId === "string" ? patch.gameId : String(existing.gameId ?? "cs2")) ||
      "cs2";
    if (nextGameId !== "cs2") {
      patch.faceitLevel = 0;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "Žádná pole k úpravě." }, { status: 400 });
    }

    await upsertDocRest(`free_agents/${id}`, patch);
    void reportSiteAction({
      content: "**LFG (admin)** · úprava inzerátu",
      title: `Inzerát \`${id}\``,
      description: Object.keys(patch).join(", "),
      fields: auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : [],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chyba" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Chybí ID." }, { status: 400 });
  }

  try {
    const existing = await getDocRest(`free_agents/${id}`);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Inzerát nenalezen." }, { status: 404 });
    }
    await deleteDocRest(`free_agents/${id}`);
    void reportSiteAction({
      content: "**LFG (admin)** · smazání inzerátu",
      title: `Inzerát \`${id}\``,
      description: `Discord: ${String(existing.discordUsername ?? "—")}`,
      fields: auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : [],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chyba" },
      { status: 500 }
    );
  }
}
