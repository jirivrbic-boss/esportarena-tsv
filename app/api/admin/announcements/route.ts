import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import {
  autoHighlightImportantText,
  parseAnnouncementCategory,
} from "@/lib/announcements";
import { notifyDiscordAnnouncementCreated } from "@/lib/discord-webhook";
import { createDocRest, listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";

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

export async function GET(request: Request) {
  const deny = await requireAdminAuth(request);
  if (deny) return deny;

  try {
    const items = (await listCollectionDocsRest("announcements", 200))
      .sort((a, b) => {
        const ta = typeof a.createdAt === "string" ? Date.parse(a.createdAt) || 0 : 0;
        const tb = typeof b.createdAt === "string" ? Date.parse(b.createdAt) || 0 : 0;
        return tb - ta;
      })
      .slice(0, 100);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const deny = await requireAdminAuth(request);
  if (deny) return deny;

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

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const authorName = typeof body.authorName === "string" ? body.authorName.trim() : "";
  if (!title || !content || !authorName) {
    return NextResponse.json(
      { ok: false, error: "Vyplň název, autora a obsah oznámení." },
      { status: 400 }
    );
  }

  try {
    const data = {
      title: title.slice(0, 180),
      content: content.slice(0, 8000),
      highlightedContent: autoHighlightImportantText(content.slice(0, 8000)),
      imageUrl:
        body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.startsWith("https://")
          ? body.imageUrl
          : null,
      authorName: authorName.slice(0, 120),
      category: parseAnnouncementCategory(body.category),
      source: "admin",
      createdAt: new Date().toISOString(),
    };
    const ref = await createDocRest("announcements", data);
    await notifyDiscordAnnouncementCreated({
      title: title.slice(0, 180),
      authorName: authorName.slice(0, 120),
      category: parseAnnouncementCategory(body.category),
      announcementId: ref.id,
    });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
