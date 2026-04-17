import { NextResponse } from "next/server";
import { isSuperAdminEmail } from "@/lib/server-auth";
import { autoHighlightImportantText } from "@/lib/announcements";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { createDocRest } from "@/lib/firebase/firestore-rest-admin";

type Body = {
  content: string;
  imageUrls?: string[];
  authorName?: string;
  discordMessageId?: string;
};

async function isAuthorized(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const bearer = authHeader.slice(7);
  const secret = process.env.DISCORD_ANNOUNCEMENTS_SECRET;
  if (secret && bearer === secret) return true;
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  return Boolean(user?.email && isSuperAdminEmail(user.email));
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
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

  const fallbackTitle = content
    .split("\n")
    .map((x) => x.trim())
    .find(Boolean)
    ?.slice(0, 180);
  const ref = await createDocRest("announcements", {
    title: fallbackTitle || "Oznámení z Discordu",
    content: content || "(příloha)",
    highlightedContent: autoHighlightImportantText(content || "(příloha)"),
    imageUrl,
    authorName: (body.authorName ?? "Discord").slice(0, 120),
    category: "general",
    discordMessageId: body.discordMessageId ?? null,
    source: "discord",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, id: ref.id });
}
