import { NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/server-auth";
import { createDocRest, listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";
import { reportSiteAction } from "@/lib/discord-webhook";

const DEMOS = [
  {
    type: "looking_team" as const,
    gameId: "cs2" as const,
    discordUsername: "demo_hledam_tym",
    hoursPlayed: 2400,
    faceitLevel: 8,
    description:
      "TESTOVACÍ INZERÁT — Hledám tým na ESPORTARENA TSV (solo, main rifle). " +
      "Kontakt na Discordu.",
  },
  {
    type: "looking_player" as const,
    gameId: "cs2" as const,
    discordUsername: "demo_skola_hleda_hrace",
    hoursPlayed: 900,
    faceitLevel: 5,
    description:
      "TESTOVACÍ INZERÁT — Tým ze školy hledá jednoho hráče. Ideálně lvl 5+ Faceit.",
  },
];

export async function POST(request: Request) {
  const auth = await verifyAdminBearer(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status }
    );
  }

  let added = 0;
  const existing = await listCollectionDocsRest("free_agents", 500);

  for (const d of DEMOS) {
    if (existing.some((item) => item.discordUsername === d.discordUsername)) continue;
    await createDocRest("free_agents", {
      ...d,
      createdAt: new Date().toISOString(),
    });
    added++;
  }

  void reportSiteAction({
    content: "**LFG** · seed ukázkových inzerátů",
    title: `Přidáno ${added}`,
    description: `Přeskočeno: ${DEMOS.length - added}`,
    fields: [
      ...(auth.user.email
        ? [{ name: "Admin", value: auth.user.email, inline: true }]
        : []),
    ],
  });

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
