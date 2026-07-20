import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { parseGameId } from "@/lib/games";
import {
  createDocRest,
  listCollectionDocsRest,
} from "@/lib/firebase/firestore-rest-admin";
import type { FreeAgentType } from "@/lib/types";
import { reportSiteAction } from "@/lib/discord-webhook";

function parseType(value: unknown): FreeAgentType | null {
  return value === "looking_team" || value === "looking_player" ? value : null;
}

function normalizePayload(body: Record<string, unknown>) {
  const type = parseType(body.type);
  const gameId = parseGameId(String(body.gameId ?? ""));
  const discordUsername = String(body.discordUsername ?? "").trim().slice(0, 120);
  const description = String(body.description ?? "").trim().slice(0, 4000);
  const hoursPlayed = Math.max(
    0,
    Math.min(50000, Number(body.hoursPlayed ?? 0) || 0)
  );
  let faceitLevel = Math.max(0, Math.min(10, Number(body.faceitLevel ?? 0) || 0));
  if (gameId !== "cs2") faceitLevel = 0;

  if (!type || !gameId || !discordUsername || !description) {
    return {
      error: "Vyplň typ, hru, Discord a popis inzerátu.",
    } as const;
  }

  return {
    data: {
      type,
      gameId,
      discordUsername,
      hoursPlayed,
      faceitLevel,
      description,
    },
  } as const;
}

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const items = (await listCollectionDocsRest("free_agents", 500))
      .map((row) => ({
        id: String(row.id),
        type: parseType(row.type) ?? "looking_team",
        gameId: parseGameId(String(row.gameId ?? "")) ?? "cs2",
        discordUsername: String(row.discordUsername ?? ""),
        hoursPlayed: Number(row.hoursPlayed ?? 0) || 0,
        faceitLevel: Number(row.faceitLevel ?? 0) || 0,
        description: String(row.description ?? ""),
        createdAt: typeof row.createdAt === "string" ? row.createdAt : null,
      }))
      .sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) || 0 : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) || 0 : 0;
        return tb - ta;
      });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chyba" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const parsed = normalizePayload(body);
  if ("error" in parsed) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  try {
    const { id } = await createDocRest("free_agents", {
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });
    void reportSiteAction({
      content: "**LFG (admin)** · nový inzerát",
      title: parsed.data.type === "looking_team" ? "Hledám tým" : "Hledám hráče",
      description: [
        `**Discord:** ${parsed.data.discordUsername}`,
        `**Hra:** ${parsed.data.gameId}`,
        parsed.data.description.slice(0, 500),
      ].join("\n"),
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
        { name: "ID", value: `\`${id}\``, inline: true },
      ],
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chyba" },
      { status: 500 }
    );
  }
}
