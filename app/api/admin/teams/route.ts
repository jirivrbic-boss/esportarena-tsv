import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase/admin";
import {
  firebaseAdminUnavailableMessage,
  isFirebaseAdminRuntimeError,
} from "@/lib/firebase/runtime-errors";

export async function GET(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  try {
    const db = adminDb();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const query =
      scope === "all"
        ? db.collection("teams").limit(300)
        : db.collection("teams").where("status", "==", "pending").limit(100);
    const snapshot = await query.get();

    type Row = { id: string; createdAt?: { toMillis?: () => number } };
    const teams = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Row)
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
    return NextResponse.json({ ok: true, teams });
  } catch (e) {
    if (isFirebaseAdminRuntimeError(e)) {
      return NextResponse.json({ ok: true, teams: [], warning: firebaseAdminUnavailableMessage() });
    }
    const msg = e instanceof Error ? e.message : "Chyba";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
