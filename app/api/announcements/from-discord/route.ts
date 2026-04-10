import { NextResponse } from "next/server";
import { getAdminApp, adminDb } from "@/lib/firebase/admin";

type Body = {
  content: string;
  imageUrls?: string[];
  authorName?: string;
  discordMessageId?: string;
};

export async function POST(request: Request) {
  const secret = process.env.DISCORD_ANNOUNCEMENTS_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content && !(body.imageUrls?.length ?? 0)) {
    return NextResponse.json(
      { ok: false, error: "Chybí text nebo obrázek." },
      { status: 400 }
    );
  }
  if (content.length > 8000) {
    return NextResponse.json({ ok: false, error: "Text je příliš dlouhý." }, { status: 400 });
  }

  const imageUrl =
    body.imageUrls?.find((u) => typeof u === "string" && u.startsWith("https://")) ??
    null;

  try {
    getAdminApp();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin není nakonfigurováno." },
      { status: 503 }
    );
  }

  const db = adminDb();
  const ref = await db.collection("announcements").add({
    content: content || "(příloha)",
    imageUrl,
    authorName: (body.authorName ?? "Discord").slice(0, 120),
    discordMessageId: body.discordMessageId ?? null,
    source: "discord",
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true, id: ref.id });
}
