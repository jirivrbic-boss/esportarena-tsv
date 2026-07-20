import { NextResponse } from "next/server";
import { isSuperAdminEmail } from "@/lib/server-auth";
import { autoHighlightImportantText } from "@/lib/announcements";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { createDocRest } from "@/lib/firebase/firestore-rest-admin";
import { notifyCaptainsAboutAnnouncement } from "@/lib/resend-announcement";
import { getSitePublicUrl } from "@/lib/site-public-url";
import { reportSiteAction } from "@/lib/discord-webhook";

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
  const title = fallbackTitle || "Oznámení z Discordu";
  const authorName = (body.authorName ?? "Discord").slice(0, 120);
  const category = "general" as const;

  const ref = await createDocRest("announcements", {
    title,
    content: content || "(příloha)",
    highlightedContent: autoHighlightImportantText(content || "(příloha)"),
    imageUrl,
    authorName,
    category,
    discordMessageId: body.discordMessageId ?? null,
    source: "discord",
    createdAt: new Date().toISOString(),
  });

  const publicUrl = `${getSitePublicUrl(request)}/oznameni/${ref.id}`;
  const email = await notifyCaptainsAboutAnnouncement({
    title,
    content: content || "(příloha)",
    category,
    authorName,
    publicUrl,
  });
  if (email.error || email.failed > 0 || email.skippedNoResend) {
    console.warn("[announcement-email:discord]", email);
  }

  void reportSiteAction({
    content: "**Oznámení** · z Discordu",
    title: title.slice(0, 256),
    description: [
      content.slice(0, 1200) || "_Bez textu_",
      "",
      `**Autor:** ${authorName}`,
      `**ID:** \`${ref.id}\``,
      `**Na webu:** ${publicUrl}`,
    ].join("\n"),
  });

  return NextResponse.json({ ok: true, id: ref.id, email });
}
