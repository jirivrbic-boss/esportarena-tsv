/**
 * Server → Discord Incoming Webhook (jednotné místo pro „Command Center“).
 */

const BRAND = "ESPORTARENA TSV · Admin";
const EMBED_COLOR = 0x39ff14;

export type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
};

export async function sendDiscordWebhook(input: {
  content?: string;
  embeds: DiscordEmbed[];
}): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const url = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!url) {
    return { ok: false, error: "DISCORD_WEBHOOK_URL není nastaveno.", status: 503 };
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(input.content ? { content: input.content } : {}),
      embeds: input.embeds.map((e) => ({
        color: EMBED_COLOR,
        footer: { text: BRAND },
        ...e,
        timestamp: e.timestamp ?? new Date().toISOString(),
      })),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    return {
      ok: false,
      error: t.slice(0, 200) || "Webhook selhal.",
      status: 502,
    };
  }
  return { ok: true };
}

/** Akce A: nová registrace kapitána (Auth). */
export async function notifyDiscordCaptainRegistered(input: {
  email: string;
  uid: string;
}): Promise<void> {
  const r = await sendDiscordWebhook({
    content: "**Registrace kapitána** · nový účet (e-mail/heslo)",
    embeds: [
      {
        title: "Nový kapitán",
        description: `Účet byl založen v Auth.`,
        fields: [
          { name: "E-mail", value: input.email.slice(0, 250), inline: true },
          { name: "UID", value: `\`${input.uid}\``, inline: true },
        ],
      },
    ],
  });
  if (!r.ok && r.status !== 503) {
    console.warn("[discord] captain_registered:", r.error);
  }
}

/** Akce D: klik na vstup do Faceit kvalifikace (schválený tým). */
export async function notifyDiscordFaceitHubEntry(input: {
  teamName: string;
  schoolName?: string;
  captainEmail: string;
  gameLabel?: string;
  teamId: string;
}): Promise<void> {
  const r = await sendDiscordWebhook({
    content:
      "**Přihlášení týmu do kvalifikace** · kapitán otevřel Faceit hub",
    embeds: [
      {
        title: input.teamName.slice(0, 256),
        description: [
          input.gameLabel ? `**Hra:** ${input.gameLabel}` : null,
          input.schoolName ? `**Škola:** ${input.schoolName}` : null,
          `**Kapitán:** ${input.captainEmail}`,
          `**Team ID:** \`${input.teamId}\``,
        ]
          .filter(Boolean)
          .join("\n"),
      },
    ],
  });
  if (!r.ok && r.status !== 503) {
    console.warn("[discord] faceit_entry:", r.error);
  }
}
