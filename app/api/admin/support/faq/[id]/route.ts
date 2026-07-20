import { NextResponse } from "next/server";
import { deleteDocRest, getDocRest, upsertDocRest } from "@/lib/firebase/firestore-rest-admin";
import { verifyAdminBearer } from "@/lib/server-auth";
import { SUPPORT_CATEGORIES } from "@/lib/support-data";
import type { SupportCategoryId } from "@/lib/support-data";
import { reportSiteAction } from "@/lib/discord-webhook";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "Chybí ID." }, { status: 400 });
  }

  const existing = await getDocRest(`support_faq_items/${id}`);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Položka neexistuje." }, { status: 404 });
  }

  let body: {
    categoryId?: string;
    tag?: string;
    title?: string;
    body?: string;
    sortOrder?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.categoryId !== undefined) {
    const cid = body.categoryId as SupportCategoryId;
    if (!SUPPORT_CATEGORIES.some((c) => c.id === cid)) {
      return NextResponse.json({ ok: false, error: "Neplatná kategorie." }, { status: 400 });
    }
    patch.categoryId = cid;
  }
  if (body.tag !== undefined) {
    patch.tag =
      typeof body.tag === "string" ? body.tag.trim().slice(0, 32) || null : null;
  }
  if (body.title !== undefined) {
    const t = typeof body.title === "string" ? body.title.trim() : "";
    if (!t) return NextResponse.json({ ok: false, error: "Nadpis nesmí být prázdný." }, { status: 400 });
    patch.title = t.slice(0, 300);
  }
  if (body.body !== undefined) {
    const t = typeof body.body === "string" ? body.body.trim() : "";
    if (!t) return NextResponse.json({ ok: false, error: "Text nesmí být prázdný." }, { status: 400 });
    patch.body = t.slice(0, 20000);
  }
  if (body.sortOrder !== undefined && typeof body.sortOrder === "number") {
    patch.sortOrder = body.sortOrder;
  }

  try {
    await upsertDocRest(`support_faq_items/${id}`, patch);
    void reportSiteAction({
      content: "**FAQ** · úprava položky",
      title: String(patch.title ?? existing.title ?? id).slice(0, 256),
      description: `**ID:** \`${id}\`\n**Pole:** ${Object.keys(patch)
        .filter((k) => k !== "updatedAt")
        .join(", ")}`,
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Uložení selhalo";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
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

  await deleteDocRest(`support_faq_items/${id}`);
  void reportSiteAction({
    content: "**FAQ** · smazání položky",
    title: id.slice(0, 256),
    description: `**ID:** \`${id}\``,
    fields: [
      ...(auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : []),
    ],
  });
  return NextResponse.json({ ok: true });
}
