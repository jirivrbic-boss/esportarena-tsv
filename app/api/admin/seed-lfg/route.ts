import { NextResponse } from "next/server";
import { verifyIdTokenFromRequest, isSuperAdminEmail } from "@/lib/server-auth";
import { adminDb, getAdminApp } from "@/lib/firebase/admin";

const DEMOS = [
  {
    type: "looking_team" as const,
    discordUsername: "demo_hledam_tym",
    hoursPlayed: 2400,
    faceitLevel: 8,
    description:
      "TESTOVACÍ INZERÁT — Hledám tým na ESPORTARENA TSV (solo, main rifle). " +
      "Kontakt na Discordu.",
  },
  {
    type: "looking_player" as const,
    discordUsername: "demo_skola_hleda_hrace",
    hoursPlayed: 900,
    faceitLevel: 5,
    description:
      "TESTOVACÍ INZERÁT — Tým ze školy hledá jednoho hráče. Ideálně lvl 5+ Faceit.",
  },
];

export async function POST(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }
  if (!isSuperAdminEmail(user.email)) {
    return NextResponse.json({ ok: false, error: "Přístup odepřen." }, { status: 403 });
  }

  try {
    getAdminApp();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Firebase Admin není nakonfigurováno." },
      { status: 503 }
    );
  }

  const db = adminDb();
  let added = 0;

  for (const d of DEMOS) {
    const snap = await db
      .collection("free_agents")
      .where("discordUsername", "==", d.discordUsername)
      .limit(1)
      .get();
    if (!snap.empty) continue;
    await db.collection("free_agents").add({
      ...d,
      createdAt: new Date(),
    });
    added++;
  }

  return NextResponse.json({
    ok: true,
    added,
    skipped: DEMOS.length - added,
    message:
      added === 0
        ? "Ukázky už v databázi jsou (stejný Discord nick)."
        : `Přidáno ${added} ukázkových inzerátů.`,
  });
}
