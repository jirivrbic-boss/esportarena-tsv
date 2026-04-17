import { NextResponse } from "next/server";
import {
  getGoogleAccessToken,
  listCollectionDocsRest,
  upsertDocRest,
} from "@/lib/firebase/firestore-rest-admin";

const HOURS_48_MS = 48 * 60 * 60 * 1000;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function runStorageCleanup() {
  const now = Date.now();
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucket) {
    return NextResponse.json(
      { ok: false, error: "Chybí NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET." },
      { status: 503 }
    );
  }
  const token = await getGoogleAccessToken();
  let deleted = 0;
  const errors: string[] = [];
  const deletedPaths = new Set<string>();

  async function deleteObject(path: string) {
    const res = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.status === 404) return;
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`delete ${res.status}: ${txt.slice(0, 200)}`);
    }
  }

  async function cleanupBucketPrefix(prefix: "teams/" | "users/") {
    const listRes = await fetch(
      `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o?prefix=${encodeURIComponent(prefix)}&maxResults=1000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!listRes.ok) {
      const txt = await listRes.text().catch(() => "");
      errors.push(`list ${prefix}: ${listRes.status} ${txt.slice(0, 120)}`);
      return;
    }
    const list = (await listRes.json()) as { items?: Array<{ name?: string; timeCreated?: string }> };
    for (const file of list.items ?? []) {
      if (!file.name) continue;
      const createdAt = file.timeCreated ? new Date(file.timeCreated).getTime() : 0;
      if (!createdAt || now - createdAt < HOURS_48_MS) continue;
      try {
        await deleteObject(file.name);
        deleted++;
        deletedPaths.add(file.name);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "err"}`);
      }
    }
  }

  await cleanupBucketPrefix("teams/");
  await cleanupBucketPrefix("users/");

  const teams = await listCollectionDocsRest("teams", 500);
  for (const team of teams) {
    const meta = Array.isArray(team.storageMeta)
      ? (team.storageMeta as Array<{ path?: string; uploadedAt?: string | number }>)
      : [];
    if (!meta?.length) continue;

    const keep: typeof meta = [];
    for (const m of meta) {
      if (!m.path) continue;
      const raw = m.uploadedAt;
      const uploaded =
        typeof raw === "number"
          ? raw
          : typeof raw === "string"
            ? Date.parse(raw) || 0
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
        await deleteObject(m.path);
        deleted++;
        deletedPaths.add(m.path);
      } catch (e) {
        errors.push(`${m.path}: ${e instanceof Error ? e.message : "err"}`);
      }
    }
    if (keep.length !== meta.length) {
      await upsertDocRest(`teams/${team.id}`, {
        storageMeta: keep,
        updatedAt: new Date().toISOString(),
      });
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
