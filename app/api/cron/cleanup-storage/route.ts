import { NextResponse } from "next/server";
import { adminDb, adminStorage, getAdminApp } from "@/lib/firebase/admin";

const HOURS_48_MS = 48 * 60 * 60 * 1000;

/**
 * GDPR: smaže soubory ve Storage starší než 48 h podle záznamů v teams.storageMeta
 * Volání: POST s hlavičkou Authorization: Bearer CRON_SECRET
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }

  try {
    getAdminApp();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin není nakonfigurováno." },
      { status: 503 }
    );
  }

  const now = Date.now();
  const db = adminDb();
  const bucket = adminStorage().bucket();

  const snap = await db.collection("teams").get();
  let deleted = 0;
  const errors: string[] = [];

  for (const doc of snap.docs) {
    const data = doc.data() as {
      storageMeta?: { path: string; uploadedAt: { toMillis?: () => number } | Date }[];
    };
    const meta = data.storageMeta;
    if (!meta?.length) continue;

    const keep: typeof meta = [];
    for (const m of meta) {
      const raw = m.uploadedAt as
        | number
        | Date
        | { toMillis?: () => number }
        | undefined;
      const uploaded =
        typeof raw === "number"
          ? raw
          : raw instanceof Date
            ? raw.getTime()
            : typeof raw?.toMillis === "function"
              ? raw.toMillis()
              : 0;
      if (!uploaded || now - uploaded < HOURS_48_MS) {
        keep.push(m);
        continue;
      }
      try {
        await bucket.file(m.path).delete({ ignoreNotFound: true });
        deleted++;
      } catch (e) {
        errors.push(`${m.path}: ${e instanceof Error ? e.message : "err"}`);
      }
    }
    if (keep.length !== meta.length) {
      await doc.ref.update({ storageMeta: keep, updatedAt: new Date() });
    }
  }

  return NextResponse.json({ ok: true, deleted, errors: errors.slice(0, 20) });
}
