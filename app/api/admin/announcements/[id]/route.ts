import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import {
  autoHighlightImportantText,
  parseAnnouncementCategory,
} from "@/lib/announcements";
import { deleteDocRest, getDocRest, upsertDocRest } from "@/lib/firebase/firestore-rest-admin";

async function requireAdminAuth(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
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
    title?: string;
    content?: string;
    imageUrl?: string | null;
    authorName?: string;
    category?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const existing = await getDocRest(`announcements/${id}`);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Nenalezeno." }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.title === "string") {
    updates.title = body.title.trim().slice(0, 180);
  }
  if (typeof body.content === "string") {
    const trimmed = body.content.trim().slice(0, 8000);
    updates.content = trimmed;
    updates.highlightedContent = autoHighlightImportantText(trimmed);
  }
  if (body.imageUrl === null) {
    updates.imageUrl = null;
  } else if (typeof body.imageUrl === "string" && body.imageUrl.startsWith("https://")) {
    updates.imageUrl = body.imageUrl;
  }
  if (typeof body.authorName === "string") {
    updates.authorName = body.authorName.slice(0, 120);
  }
  if (body.category !== undefined) {
    updates.category = parseAnnouncementCategory(body.category);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, error: "Žádná pole k úpravě." }, { status: 400 });
  }

  try {
    await upsertDocRest(`announcements/${id}`, updates);
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
  const exists = await getDocRest(`announcements/${id}`);
  if (!exists) {
    return NextResponse.json({ ok: false, error: "Nenalezeno." }, { status: 404 });
  }

  try {
    await deleteDocRest(`announcements/${id}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
