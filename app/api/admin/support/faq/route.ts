import { NextResponse } from "next/server";
import {
  createDocRest,
  listCollectionDocsRest,
} from "@/lib/firebase/firestore-rest-admin";
import { verifyAdminBearer } from "@/lib/server-auth";
import { SUPPORT_CATEGORIES } from "@/lib/support-data";
import type { SupportCategoryId } from "@/lib/support-data";
import { rowToSupportArticle } from "@/lib/support-firestore";
import { reportSiteAction } from "@/lib/discord-webhook";

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  try {
    const rows = await listCollectionDocsRest("support_faq_items", 500);
    const items = rows
      .map((r) => rowToSupportArticle(r as Record<string, unknown> & { id: string }))
      .filter(Boolean);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
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

  const categoryId = body.categoryId as SupportCategoryId | undefined;
  if (
    !categoryId ||
    !SUPPORT_CATEGORIES.some((c) => c.id === categoryId)
  ) {
    return NextResponse.json({ ok: false, error: "Vyber platnou kategorii." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!title || !text) {
    return NextResponse.json({ ok: false, error: "Vyplň nadpis a text." }, { status: 400 });
  }

  const tag =
    typeof body.tag === "string" ? body.tag.trim().slice(0, 32) : "";
  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? body.sortOrder
      : 0;

  const now = new Date().toISOString();

  try {
    const { id } = await createDocRest("support_faq_items", {
      categoryId,
      tag: tag || null,
      title: title.slice(0, 300),
      body: text.slice(0, 20000),
      sortOrder,
      createdAt: now,
      updatedAt: now,
    });
    void reportSiteAction({
      content: "**FAQ** · nová položka",
      title: title.slice(0, 256),
      description: [
        `**Kategorie:** ${categoryId}`,
        `**ID:** \`${id}\``,
      ].join("\n"),
      fields: [
        ...(auth.user.email
          ? [{ name: "Admin", value: auth.user.email, inline: true }]
          : []),
      ],
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Uložení selhalo";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
