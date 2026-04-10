import { NextResponse } from "next/server";

type Body = {
  title: string;
  teamName: string;
  schoolName: string;
  captainDiscord: string;
  captainEmail: string;
  playerSummary: string;
  documentLinks: { label: string; url: string }[];
  event: "team_created" | "roster_updated";
};

export async function POST(request: Request) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "DISCORD_WEBHOOK_URL není nastaveno." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const linksText =
    body.documentLinks?.length > 0
      ? body.documentLinks.map((l) => `• ${l.label}: ${l.url}`).join("\n")
      : "Žádné odkazy";

  const content = `**${body.title}**\n${body.event === "team_created" ? "Nová registrace" : "Aktualizace soupisky"}`;

  const embed = {
    title: body.teamName,
    description: `**Škola:** ${body.schoolName}\n**Kapitán Discord:** ${body.captainDiscord}\n**E-mail kapitána:** ${body.captainEmail}\n\n**Hráči:**\n${body.playerSummary}\n\n**Dokumenty:**\n${linksText.slice(0, 3500)}`,
    color: 0x39ff14,
    footer: { text: "ESPORTARENA TSV · Admin" },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, embeds: [embed] }),
  });

  if (!res.ok) {
    const t = await res.text();
    return NextResponse.json(
      { ok: false, error: "Discord webhook selhal.", detail: t.slice(0, 200) },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
