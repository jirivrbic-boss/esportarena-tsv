/**
 * Jednorázově přidá 2 ukázkové inzeráty (looking_team + looking_player).
 * Spusť z kořene projektu:
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' node scripts/seed-free-agents.mjs
 */

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
if (!raw) {
  console.error("Chybí FIREBASE_SERVICE_ACCOUNT_JSON.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert(JSON.parse(raw)) });
}

const db = getFirestore();

const demos = [
  {
    type: "looking_team",
    discordUsername: "demo_hledam_tym",
    hoursPlayed: 2400,
    faceitLevel: 8,
    description:
      "TESTOVACÍ INZERÁT — Hledám tým na ESPORTARENA TSV (solo, main rifle). " +
      "Kontakt na Discordu, slušné chování.",
  },
  {
    type: "looking_player",
    discordUsername: "demo_skola_hleda_hrace",
    hoursPlayed: 900,
    faceitLevel: 5,
    description:
      "TESTOVACÍ INZERÁT — Tým ze školy hledá jednoho hráče (stand-in). " +
      "Ideálně lvl 5+ Faceit, ochota trénovat o víkendech.",
  },
];

for (const d of demos) {
  const ref = await db.collection("free_agents").add({
    ...d,
    createdAt: FieldValue.serverTimestamp(),
  });
  console.log("Přidáno", d.type, "→", ref.id);
}

console.log("Hotovo.");
