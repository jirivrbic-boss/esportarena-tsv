import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import {
  autoHighlightImportantText,
  parseAnnouncementCategory,
} from "@/lib/announcements";
import { notifyDiscordAnnouncementCreated } from "@/lib/discord-webhook";
import {
  firebaseAdminUnavailableMessage,
  isFirebaseAdminRuntimeError,
} from "@/lib/firebase/runtime-errors";

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
    const { adminDb } = await import("@/lib/firebase/admin");
    const snap = await adminDb()
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    if (isFirebaseAdminRuntimeError(e)) {
      return NextResponse.json({ ok: true, items: [], warning: firebaseAdminUnavailableMessage() });
    }
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
    const { adminDb } = await import("@/lib/firebase/admin");
    const ref = await adminDb().collection("announcements").add({
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
      createdAt: new Date(),
    });
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
