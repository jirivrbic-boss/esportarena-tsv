import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import type { CmsSlug } from "@/lib/cms-defaults";
import { upsertDocRest } from "@/lib/firebase/firestore-rest-admin";
import { reportSiteAction } from "@/lib/discord-webhook";

const SLUGS: CmsSlug[] = ["home", "pravidla", "oznameni"];

export async function PUT(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const slug = body.slug;
  if (typeof slug !== "string" || !SLUGS.includes(slug as CmsSlug)) {
    return NextResponse.json({ ok: false, error: "Neplatný slug." }, { status: 400 });
  }

  const { slug: _s, ...patch } = body;
  await upsertDocRest(`page_content/${slug}`, patch);

  void reportSiteAction({
    content: "**CMS** · uložení stránky",
    title: `page_content/${slug}`,
    description: `**Pole:** ${Object.keys(patch).slice(0, 25).join(", ") || "—"}`,
    fields: [
      ...(auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : []),
    ],
  });

  return NextResponse.json({ ok: true });
}
