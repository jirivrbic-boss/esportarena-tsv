import { NextResponse } from "next/server";
import { verifyIdTokenFromRequest, isAdminEmail } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: Request) {
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

  try {
    const db = adminDb();
    const pending = await db
      .collection("teams")
      .where("status", "==", "pending")
      .limit(100)
      .get();

    type Row = { id: string; createdAt?: { toMillis?: () => number } };
    const teams = pending.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Row)
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
    return NextResponse.json({ ok: true, teams });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
