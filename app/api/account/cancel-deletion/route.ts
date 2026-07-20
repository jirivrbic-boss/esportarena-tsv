import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  hashRecoveryToken,
  parseUidFromRecoveryToken,
} from "@/lib/account-recovery-token";
import { adminDb } from "@/lib/firebase/admin";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { reportSiteAction } from "@/lib/discord-webhook";

function pendingExpiryMs(doc: Record<string, unknown>): number | null {
  const v = doc.pendingDeletionExpiresAt;
  if (typeof v !== "string") return null;
  const ms = Date.parse(v);
  return Number.isFinite(ms) ? ms : null;
}

async function clearScheduledDeletion(uid: string): Promise<void> {
  await adminDb().doc(`users/${uid}`).update({
    pendingDeletionExpiresAt: FieldValue.delete(),
    deletionRecoveryTokenHash: FieldValue.delete(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function POST(request: Request) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Chybí FIREBASE_SERVICE_ACCOUNT_JSON na serveru." },
      { status: 503 }
    );
  }

  let recoveryToken = "";
  try {
    const body = (await request.json()) as { recoveryToken?: unknown };
    if (typeof body.recoveryToken === "string") recoveryToken = body.recoveryToken.trim();
  } catch {
    /* prázdné tělo – obnova jen přes Bearer */
  }

  if (recoveryToken) {
    const uid = parseUidFromRecoveryToken(recoveryToken);
    if (!uid) {
      return NextResponse.json({ ok: false, error: "Neplatný odkaz." }, { status: 400 });
    }

    const row = await getDocRest(`users/${uid}`);
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Účet už neexistuje nebo byl smazán." },
        { status: 404 }
      );
    }

    const storedHash =
      typeof row.deletionRecoveryTokenHash === "string"
        ? row.deletionRecoveryTokenHash
        : "";
    if (!storedHash || hashRecoveryToken(recoveryToken) !== storedHash) {
      return NextResponse.json({ ok: false, error: "Neplatný nebo starý odkaz." }, { status: 403 });
    }

    const expMs = pendingExpiryMs(row);
    if (expMs === null) {
      return NextResponse.json(
        { ok: false, error: "Žádné naplánované smazání." },
        { status: 400 }
      );
    }
    if (expMs <= Date.now()) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Lhůta 24 hodin už vypršela. Pokud účet stále existuje, kontaktuj organizátory.",
        },
        { status: 410 }
      );
    }

    await clearScheduledDeletion(uid);
    void reportSiteAction({
      content: "**Smazání účtu** · zrušeno (odkaz z e-mailu)",
      title: uid.slice(0, 256),
      description: `**UID:** \`${uid}\``,
    });
    return NextResponse.json({ ok: true });
  }

  const session = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!session?.uid) {
    return NextResponse.json(
      { ok: false, error: "Přihlas se nebo použij odkaz z e-mailu." },
      { status: 401 }
    );
  }

  const row = await getDocRest(`users/${session.uid}`);
  if (!row) {
    return NextResponse.json({ ok: false, error: "Profil neexistuje." }, { status: 404 });
  }

  const hasScheduled =
    (typeof row.pendingDeletionExpiresAt === "string" &&
      row.pendingDeletionExpiresAt.length > 0) ||
    (typeof row.deletionRecoveryTokenHash === "string" &&
      row.deletionRecoveryTokenHash.length > 0);

  if (!hasScheduled) {
    return NextResponse.json(
      { ok: false, error: "Žádné naplánované smazání k zrušení." },
      { status: 400 }
    );
  }

  await clearScheduledDeletion(session.uid);
  void reportSiteAction({
    content: "**Smazání účtu** · zrušeno (přihlášený)",
    title: (session.email ?? session.uid).slice(0, 256),
    description: `**UID:** \`${session.uid}\``,
  });
  return NextResponse.json({ ok: true });
}
