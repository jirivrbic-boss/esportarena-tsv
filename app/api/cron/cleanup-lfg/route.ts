import { NextResponse } from "next/server";
import {
  deleteDocRest,
  listCollectionDocsRest,
} from "@/lib/firebase/firestore-rest-admin";

const DAYS_60_MS = 60 * 24 * 60 * 60 * 1000;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

async function runCleanup() {
  const cutoffMs = Date.now() - DAYS_60_MS;
  let deleted = 0;
  const docs = await listCollectionDocsRest("free_agents", 1000);
  for (const doc of docs) {
    const createdAtRaw = typeof doc.createdAt === "string" ? doc.createdAt : "";
    const createdAtMs = createdAtRaw ? Date.parse(createdAtRaw) : NaN;
    if (!Number.isFinite(createdAtMs) || createdAtMs >= cutoffMs) continue;
    try {
      const removed = await deleteDocRest(`free_agents/${doc.id}`);
      if (removed) deleted++;
    } catch {
      // nejlepší úsilí, cron má pokračovat
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
