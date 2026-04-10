/**
 * Na Netlify musí být NEXT_PUBLIC_FIREBASE_* dostupné už při `npm run build`.
 * Jinak se klientovi v bundlu objeví „prázdná“ konfigurace a Firebase nejde.
 */
if (process.env.NETLIFY !== "true") {
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
