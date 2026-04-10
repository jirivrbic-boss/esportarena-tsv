/**
 * Discord bot: posílá zprávy z vybraného kanálu na web jako oznámení.
 *
 * Nastavení v Discord Developer Portal:
 * - Bot: zapni Privileged Gateway Intents → "Message Content Intent"
 * - Pozvi bota na server a dej mu práva číst kanál + číst zprávy
 *
 * Env:
 *   DISCORD_BOT_TOKEN=...
 *   DISCORD_ANNOUNCE_CHANNEL_ID=id kanálu (číselný)
 *   DISCORD_ANNOUNCEMENTS_SECRET=stejná hodnota jako na serveru (.env.local)
 *   ANNOUNCEMENTS_INGEST_URL=https://tvoje-domena.cz  (bez koncového lomítka)
 *
 * Spuštění: node scripts/discord-announce-bot.mjs
 */

import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_ANNOUNCE_CHANNEL_ID;
const secret = process.env.DISCORD_ANNOUNCEMENTS_SECRET;
const baseUrl = (process.env.ANNOUNCEMENTS_INGEST_URL ?? "").replace(/\/$/, "");

if (!token || !channelId || !secret || !baseUrl) {
  console.error(
    "Chybí DISCORD_BOT_TOKEN, DISCORD_ANNOUNCE_CHANNEL_ID, DISCORD_ANNOUNCEMENTS_SECRET nebo ANNOUNCEMENTS_INGEST_URL."
  );
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`Přihlášen jako ${client.user?.tag}, kanál ${channelId}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channelId !== channelId) return;

  const content = (message.content ?? "").trim();
  const imageUrls = message.attachments
    .filter((a) => {
      const ct = a.contentType ?? "";
      return ct.startsWith("image/");
    })
    .map((a) => a.url);

  if (!content && imageUrls.length === 0) return;

  const authorName =
    message.member?.displayName ??
    message.author.globalName ??
    message.author.username;

  try {
    const res = await fetch(`${baseUrl}/api/announcements/from-discord`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        content: content || "",
        imageUrls,
        authorName,
        discordMessageId: message.id,
      }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Ingest selhal:", res.status, j);
      return;
    }
    console.log("Oznámení uloženo:", j.id);
  } catch (e) {
    console.error(e);
  }
});

client.login(token);
