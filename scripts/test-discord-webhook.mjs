#!/usr/bin/env node
/**
 * Ověření Discord Incoming Webhook (stejná URL jako DISCORD_WEBHOOK_URL na serveru).
 *
 * Spuštění:
 *   DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...' node scripts/test-discord-webhook.mjs
 *
 * Nebo z .env.local (bez commitu):
 *   set -a && source .env.local 2>/dev/null; set +a; node scripts/test-discord-webhook.mjs
 */

const url = process.env.DISCORD_WEBHOOK_URL?.trim();

if (!url) {
  console.error(
    "Chybí DISCORD_WEBHOOK_URL. Zkopíruj URL z Discord → Kanál → Integrace → Webhooks → URL webhooku."
  );
  process.exit(1);
}

if (!url.startsWith("https://discord.com/api/webhooks/")) {
  console.warn(
    "Varování: URL obvykle začíná https://discord.com/api/webhooks/ — zkontroluj překlep."
  );
}

const body = {
  content: `**Test webhooku** · ESPORTARENA TSV · ${new Date().toISOString()}`,
};

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log("HTTP", res.status, res.statusText);
console.log(text || "(prázdná odpověď = často OK u Discordu)");

if (res.status === 204 || res.ok) {
  console.log("\n→ Pokud zpráva přišla na Discord, webhook funguje.");
  process.exit(0);
}

console.error("\n→ Discord odmítl požadavek. Zkontroluj, jestli webhook nebyl smazán nebo rotován.");
process.exit(1);
