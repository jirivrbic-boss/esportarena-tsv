import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Přístup odepřen." }, { status: 403 });
  }

  const { id } = await ctx.params;
  let reason = "";
  try {
    const j = await request.json();
    reason = typeof j.reason === "string" ? j.reason : "";
  } catch {
    /* prázdné */
  }

  try {
    const ref = adminDb().collection("teams").doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Tým nenalezen." }, { status: 404 });
    }
    await ref.update({
      status: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
