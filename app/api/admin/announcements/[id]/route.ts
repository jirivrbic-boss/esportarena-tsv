import { NextResponse } from "next/server";
import { verifyIdTokenFromRequest, isAdminEmail } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";

async function requireAdminAuth(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Chybí nebo neplatný token." },
      { status: 401 }
    );
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, error: "Přístup odepřen." }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdminAuth(request);
  if (deny) return deny;

  const { id } = await ctx.params;
  let body: {
    content?: string;
    imageUrl?: string | null;
    authorName?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const ref = adminDb().collection("announcements").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ ok: false, error: "Nenalezeno." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.content === "string") {
    updates.content = body.content.trim().slice(0, 8000);
  }
  if (body.imageUrl === null) {
    updates.imageUrl = null;
  } else if (typeof body.imageUrl === "string" && body.imageUrl.startsWith("https://")) {
    updates.imageUrl = body.imageUrl;
  }
  if (typeof body.authorName === "string") {
    updates.authorName = body.authorName.slice(0, 120);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Žádná pole k úpravě." }, { status: 400 });
  }

  try {
    await ref.update(updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdminAuth(request);
  if (deny) return deny;

  const { id } = await ctx.params;
  const ref = adminDb().collection("announcements").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ ok: false, error: "Nenalezeno." }, { status: 404 });
  }

  try {
    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
