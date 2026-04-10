import { NextResponse } from "next/server";
import { verifyIdTokenFromRequest, isAdminEmail } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import type { CmsSlug } from "@/lib/cms-defaults";

const SLUGS: CmsSlug[] = ["home", "pravidla", "oznameni"];

export async function PUT(request: Request) {
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
  await adminDb().collection("page_content").doc(slug).set(patch, { merge: true });

  return NextResponse.json({ ok: true });
}
