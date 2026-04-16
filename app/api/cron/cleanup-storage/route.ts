import { NextResponse } from "next/server";
import { adminDb, adminStorage, getAdminApp } from "@/lib/firebase/admin";

const HOURS_48_MS = 48 * 60 * 60 * 1000;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function runStorageCleanup() {
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
  let deleted = 0;
  const errors: string[] = [];
  const deletedPaths = new Set<string>();

  async function cleanupBucketPrefix(prefix: "teams/" | "users/") {
    const [files] = await bucket.getFiles({ prefix });
    for (const file of files) {
      const createdAt = file.metadata.timeCreated
        ? new Date(file.metadata.timeCreated).getTime()
        : 0;
      if (!createdAt || now - createdAt < HOURS_48_MS) continue;
      try {
        await file.delete({ ignoreNotFound: true });
        deleted++;
        deletedPaths.add(file.name);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "err"}`);
      }
    }
  }

  await cleanupBucketPrefix("teams/");
  await cleanupBucketPrefix("users/");

  const snap = await db.collection("teams").get();

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
      if (
        !deletedPaths.has(m.path) &&
        (!uploaded || now - uploaded < HOURS_48_MS)
      ) {
        keep.push(m);
        continue;
      }
      if (deletedPaths.has(m.path)) {
        continue;
      }
      try {
        await bucket.file(m.path).delete({ ignoreNotFound: true });
        deleted++;
        deletedPaths.add(m.path);
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

/**
 * GDPR: maže soubory ve Storage starší než 48 h. Chráněno Bearer CRON_SECRET.
 */
export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }
  return runStorageCleanup();
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }
  return runStorageCleanup();
}
