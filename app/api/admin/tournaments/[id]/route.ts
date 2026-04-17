import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { parseGameId } from "@/lib/games";
import {
  deleteDocRest,
  getDocRest,
  listCollectionDocsRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";

type Ctx = { params: Promise<{ id: string }> };

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

    await upsertDocRest(`tournaments/${id}`, patch);
    return NextResponse.json({ ok: true });
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
    await deleteDocRest(`tournaments/${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
