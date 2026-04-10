import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";

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
    const snap = await adminDb()
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    content?: string;
    imageUrl?: string | null;
    authorName?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ ok: false, error: "Chybí text." }, { status: 400 });
  }

  try {
    const ref = await adminDb().collection("announcements").add({
      content: content.slice(0, 8000),
      imageUrl:
        body.imageUrl && typeof body.imageUrl === "string" && body.imageUrl.startsWith("https://")
          ? body.imageUrl
          : null,
      authorName: (body.authorName ?? "Administrace").slice(0, 120),
      source: "admin",
      createdAt: new Date(),
    });
    return NextResponse.json({ ok: true, id: ref.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
