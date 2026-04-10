/**
 * Na Netlify musí být NEXT_PUBLIC_FIREBASE_* dostupné při buildu (a pro runtime v serverless).
 * NETLIFY=true i NETLIFY_SITE_NAME bývá na všech Netlify buildech včetně deploy preview.
 */
const onNetlify =
  process.env.NETLIFY === "true" || Boolean(process.env.NETLIFY_SITE_NAME);

if (!onNetlify) {
  process.exit(0);
}

const required = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
];

const missing = required.filter((k) => !String(process.env[k] ?? "").trim());

if (missing.length === 0) {
  process.exit(0);
}

console.error(
  "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
);
console.error("[Netlify] Při buildu chybí Firebase proměnné:");
missing.forEach((k) => console.error("  -", k));
console.error(
  "\n→ Site configuration → Environment variables → přidej všechny NEXT_PUBLIC_FIREBASE_*"
);
console.error(
  "→ Deploys → Trigger deploy → „Clear cache and deploy site“\n" +
    "  (proměnné se do Next.js vkládají při buildu, ne až po něm.)\n"
);
console.error(
  "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
);
process.exit(1);
