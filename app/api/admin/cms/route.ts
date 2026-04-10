import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import type { CmsSlug } from "@/lib/cms-defaults";

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
  await adminDb().collection("page_content").doc(slug).set(patch, { merge: true });

  return NextResponse.json({ ok: true });
}
