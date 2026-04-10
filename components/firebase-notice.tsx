"use client";

import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseNotice() {
  if (isFirebaseConfigured()) return null;

  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-xs leading-relaxed text-amber-200">
      {isProd ? (
        <>
          <strong className="text-amber-100">Produkce:</strong> v tomhle buildu
          chyběly nebo byly prázdné{" "}
          <code className="rounded bg-black/30 px-1">
            NEXT_PUBLIC_FIREBASE_*
          </code>
          . V{" "}
          <strong className="text-amber-100">
            Netlify → Environment variables
          </strong>{" "}
          je musíš mít <strong className="text-amber-100">před</strong> buildem —
          pak{" "}
          <strong className="text-amber-100">
            Deploys → Trigger deploy → Clear cache and deploy site
          </strong>
          . Samotné uložení proměnných po posledním deployi nestačí; musí proběhnout
          nový build. Hodnoty z Firebase → Project settings → Your apps.
        </>
      ) : (
        <>
          Chybí proměnné prostředí Firebase. Zkopíruj{" "}
          <code className="rounded bg-black/30 px-1">.env.example</code> do{" "}
          <code className="rounded bg-black/30 px-1">.env.local</code> a doplň
          údaje projektu.
        </>
      )}
    </div>
  );
}
