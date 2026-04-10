import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord-webhook";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";

type Body = {
  title: string;
  teamName: string;
  schoolName: string;
  captainDiscord: string;
  captainEmail: string;
  playerSummary: string;
  documentLinks: { label: string; url: string }[];
  event: "team_created" | "roster_updated";
  gameLabel?: string;
  /** Firestore document id — pro adminy v Discordu */
  teamId?: string;
};

function normEmail(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.email) {
    return NextResponse.json(
      { ok: false, error: "Chybí nebo neplatný Firebase ID token (nebo e-mail v tokenu)." },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  if (normEmail(body.captainEmail) !== normEmail(user.email)) {
    return NextResponse.json(
      { ok: false, error: "E-mail v těle požadavku musí odpovídat přihlášenému účtu." },
      { status: 403 }
    );
  }

  const linksText =
    body.documentLinks?.length > 0
      ? body.documentLinks.map((l) => `• ${l.label}: ${l.url}`).join("\n")
      : "Žádné odkazy";

  const content = `**${body.title}**\n${
    body.event === "team_created"
      ? "Nová přihláška týmu do turnaje — dokumenty níže."
      : "Úprava soupisky / dokumentů — aktuální odkazy níže."
  }`;

  const gameLine = body.gameLabel
    ? `**Hra:** ${body.gameLabel}\n`
    : "";
  const idLine = body.teamId?.trim()
    ? `**Team ID:** \`${body.teamId.trim()}\`\n\n`
    : "";

  const sent = await sendDiscordWebhook({
    content,
    embeds: [
      {
        title: body.teamName.slice(0, 256),
        description: `${idLine}${gameLine}**Škola:** ${body.schoolName}\n**Kapitán Discord:** ${body.captainDiscord}\n**E-mail kapitána:** ${body.captainEmail}\n\n**Hráči:**\n${body.playerSummary}\n\n**Dokumenty:**\n${linksText.slice(0, 3500)}`,
      },
    ],
  });

  if (!sent.ok) {
    return NextResponse.json(
      { ok: false, error: sent.error },
      { status: sent.status }
    );
  }

  return NextResponse.json({ ok: true });
}
