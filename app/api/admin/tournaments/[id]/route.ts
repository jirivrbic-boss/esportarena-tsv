import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAdminBearer } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import { parseGameId } from "@/lib/games";

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
    const db = adminDb();
    const ref = db.collection("tournaments").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Turnaj nenalezen." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (body.gameId !== undefined) {
      const g = parseGameId(String(body.gameId));
      if (!g) {
        return NextResponse.json({ ok: false, error: "Neplatná hra." }, { status: 400 });
      }
      patch.gameId = g;
    }
    if (typeof body.prizePoolText === "string") {
      patch.prizePoolText = body.prizePoolText.trim();
    }
    if (typeof body.rulesText === "string") patch.rulesText = body.rulesText.trim();
    if (typeof body.faceitUrl === "string") patch.faceitUrl = body.faceitUrl.trim();
    if (typeof body.published === "boolean") patch.published = body.published;

    await ref.update(patch);
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
    const db = adminDb();
    const tRef = db.collection("tournaments").doc(id);
    const snap = await tRef.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Turnaj nenalezen." }, { status: 404 });
    }

    const regs = await tRef.collection("registrations").get();
    const batch = db.batch();
    for (const d of regs.docs) {
      batch.delete(d.ref);
    }
    batch.delete(tRef);
    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
