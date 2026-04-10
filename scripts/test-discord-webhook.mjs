#!/usr/bin/env node
/**
 * Ověření Discord Incoming Webhook.
 *
 * 1) Celá URL jako argument (nejjednodušší — žádné zkracování):
 *    npm run test:discord-webhook -- 'https://discord.com/api/webhooks/ID/TOKEN'
 *
 * 2) Nebo proměnná prostředí:
 *    DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/ID/TOKEN' npm run test:discord-webhook
 *
 * POZOR: V příkazu musí být skutečná dlouhá URL z Discordu, NE text „…“ ani „...“ z nápovědy.
 */

const argUrl = process.argv[2];
const envUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
const url = (argUrl ?? envUrl)?.trim();

if (!url) {
  console.error(
    "Chybí URL. Použij např.:\n" +
      "  npm run test:discord-webhook -- 'https://discord.com/api/webhooks/ČÍSLO/DLOUHÝ_TOKEN'\n" +
      "nebo nastav DISCORD_WEBHOOK_URL (celá adresa z Discord → Integrace → Webhooks)."
  );
  process.exit(1);
}

if (/…|\.\.\.|webhooks\/\.\.\./u.test(url)) {
  console.error(
    "URL vypadá jako zkrácený příklad (obsahuje … nebo ...).\n" +
      "Zkopíruj z Discordu celou adresu webhooku — končí dlouhým náhodným řetězcem."
  );
  process.exit(1);
}

const okPrefix =
  url.startsWith("https://discord.com/api/webhooks/") ||
  url.startsWith("https://discordapp.com/api/webhooks/");

if (!okPrefix) {
  console.warn(
    "Varování: očekává se https://discord.com/api/webhooks/... (nebo discordapp.com)."
  );
}

const body = {
  content: `**Test webhooku** · ESPORTARENA TSV · ${new Date().toISOString()}`,
};

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "ESPORTARENA-tsv-webhook-test (Node)",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log("HTTP", res.status, res.statusText);
console.log(text || "(prázdná odpověď = často OK u Discordu)");

if (res.status === 204 || res.ok) {
  console.log("\n→ Pokud zpráva přišla na Discord, webhook funguje.");
  process.exit(0);
}

if (res.status === 405) {
  console.error(
    "\n→ HTTP 405 u webhooku casem znamená neplatnou / zkrácenou URL (např. doslova „…“ v adrese),\n" +
      "  nebo že v proměnné není kompletní odkaz. Znovu zkopíruj „Copy Webhook URL“ z Discordu."
  );
}

console.error(
  "\n→ Discord odmítl požadavek. Zkontroluj celou URL, případně vytvoř nový webhook."
);
process.exit(1);
