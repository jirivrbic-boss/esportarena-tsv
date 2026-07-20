import { NextResponse } from "next/server";
import { listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";
import { purgeCaptainAccount } from "@/lib/purge-captain-account";
import { reportSiteAction } from "@/lib/discord-webhook";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  return Boolean(secret && auth === `Bearer ${secret}`);
}

function pendingExpiryMs(doc: Record<string, unknown>): number | null {
  const v = doc.pendingDeletionExpiresAt;
  if (typeof v !== "string") return null;
  const ms = Date.parse(v);
  return Number.isFinite(ms) ? ms : null;
}

async function runPurge(request: Request) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ ok: false, error: "Nepovoleno." }, { status: 401 });
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) {
    return NextResponse.json(
      { ok: false, error: "Chybí FIREBASE_SERVICE_ACCOUNT_JSON." },
      { status: 503 }
    );
  }

  const now = Date.now();
  let purged = 0;
  const errors: string[] = [];

  try {
    const users = await listCollectionDocsRest("users", 1200);
    for (const u of users) {
      const expMs = pendingExpiryMs(u as Record<string, unknown>);
      if (expMs === null) continue;
      if (expMs > now) continue;

      const hash = (u as { deletionRecoveryTokenHash?: unknown })
        .deletionRecoveryTokenHash;
      if (typeof hash !== "string" || !hash) continue;

      const uid = u.id as string;
      try {
        await purgeCaptainAccount(uid);
        purged += 1;
      } catch (e) {
        errors.push(`${uid}: ${e instanceof Error ? e.message : "chyba"}`);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba výpisu uživatelů";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }

  void reportSiteAction({
    content: "**Cron** · purge naplánovaných smazání",
    title: "Purge scheduled deletions",
    description: [
      `**Smazáno účtů:** ${purged}`,
      errors.length ? `**Chyby:** ${errors.length}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return NextResponse.json({
    ok: true,
    purged,
    errors: errors.length ? errors : undefined,
  });
}

export async function POST(request: Request) {
  return runPurge(request);
}

/** Některé external cron joby volají GET. */
export async function GET(request: Request) {
  return runPurge(request);
}
