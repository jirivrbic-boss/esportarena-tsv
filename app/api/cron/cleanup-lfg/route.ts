import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, getAdminApp } from "@/lib/firebase/admin";

const DAYS_60_MS = 60 * 24 * 60 * 60 * 1000;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function runCleanup() {
  try {
    getAdminApp();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin není nakonfigurováno." },
      { status: 503 }
    );
  }

  const cutoff = Timestamp.fromMillis(Date.now() - DAYS_60_MS);
  const db = adminDb();
  let deleted = 0;

  for (;;) {
    const snap = await db
      .collection("free_agents")
      .where("createdAt", "<", cutoff)
      .limit(50)
      .get();
    if (snap.empty) break;
    for (const doc of snap.docs) {
      await doc.ref.delete();
      deleted++;
    }
  }

  return NextResponse.json({ ok: true, deleted });
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }
  return runCleanup();
}

export async function POST(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }
  return runCleanup();
}
