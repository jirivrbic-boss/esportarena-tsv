import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { Resend } from "resend";
import {
  createRecoveryToken,
  hashRecoveryToken,
} from "@/lib/account-recovery-token";
import { accountDeletionScheduledEmailHtml } from "@/lib/emails/captain-templates";
import { adminDb } from "@/lib/firebase/admin";
import { upsertDocRest } from "@/lib/firebase/firestore-rest-admin";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { getSitePublicUrl } from "@/lib/site-public-url";
import { reportSiteAction } from "@/lib/discord-webhook";

const GRACE_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.email) {
    return NextResponse.json(
      { ok: false, error: "Nepřihlášen nebo neplatný token." },
      { status: 401 }
    );
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Na serveru chybí FIREBASE_SERVICE_ACCOUNT_JSON — odklad smazání nelze nastavit.",
      },
      { status: 503 }
    );
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Resend není nakonfigurováno — e-mail s odkazem na obnovení nepošleme.",
      },
      { status: 503 }
    );
  }

  const uid = user.uid;
  const expiresAt = new Date(Date.now() + GRACE_MS);
  const recoveryPlain = createRecoveryToken(uid);
  const hash = hashRecoveryToken(recoveryPlain);

  await upsertDocRest(`users/${uid}`, {
    pendingDeletionExpiresAt: expiresAt,
    deletionRecoveryTokenHash: hash,
    updatedAt: new Date(),
  });

  const base = getSitePublicUrl(request);
  const restoreUrl = `${base}/obnovit-ucet?t=${encodeURIComponent(recoveryPlain)}`;

  const expiresLabel = expiresAt.toLocaleString("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Prague",
  });

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: user.email,
    subject: "Účet ESPORTARENA — 24 h na obnovení po žádosti o smazání",
    html: accountDeletionScheduledEmailHtml(restoreUrl, expiresLabel),
  });

  if (error) {
    try {
      await adminDb().doc(`users/${uid}`).update({
        pendingDeletionExpiresAt: FieldValue.delete(),
        deletionRecoveryTokenHash: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch {
      /* best-effort vrácení bez naplánování */
    }
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 502 }
    );
  }

  void reportSiteAction({
    content: "**Smazání účtu** · naplánováno (24 h)",
    title: user.email.slice(0, 256),
    description: [
      `**UID:** \`${uid}\``,
      `**Vyprší:** ${expiresAt.toISOString()}`,
    ].join("\n"),
  });

  return NextResponse.json({
    ok: true,
    expiresAt: expiresAt.toISOString(),
  });
}
