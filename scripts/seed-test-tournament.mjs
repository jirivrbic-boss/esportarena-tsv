/**
 * Vytvoří jeden zveřejněný testovací turnaj (Firestore: tournaments).
 * Stejné ID při opakovaném spuštění → přepíše obsah (vhodné pro úpravu ukázky).
 *
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' node scripts/seed-test-tournament.mjs
 *
 * Nebo z kořene s načteným .env.local (bez commitu env souborů).
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

const DOC_ID = "demo-turnaj-s4-ukazka";

const payload = {
  name: "TEST · Ukázkový turnaj (CS2) — S4",
  gameId: "cs2",
  prizePoolText: "20 000 Kč (testovací údaj)",
  rulesText: [
    "Toto je **testovací** turnaj vytvořený seed skriptem.",
    "",
    "• Formát a mapy: dle propozic na Discordu",
    "• Kontakt: organizátoři na oficiálním Discordu ESPORTARENA",
    "• Faceit: odkaz níže je ukázkový — nahraď reálným hubem.",
  ].join("\n"),
  faceitUrl: "https://www.faceit.com/",
  published: true,
  updatedAt: FieldValue.serverTimestamp(),
};

const ref = db.collection("tournaments").doc(DOC_ID);
const snap = await ref.get();
if (!snap.exists) {
  payload.createdAt = FieldValue.serverTimestamp();
}

await ref.set(payload, { merge: true });
console.log("Turnaj uložen:", DOC_ID);
console.log("Veřejný výpis: /turnaje →", DOC_ID);
