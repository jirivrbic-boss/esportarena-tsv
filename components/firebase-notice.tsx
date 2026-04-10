"use client";

import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseNotice() {
  if (isFirebaseConfigured()) return null;

  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-xs leading-relaxed text-amber-200">
      {isProd ? (
        <>
          <strong className="text-amber-100">Produkce:</strong> chybí proměnné{" "}
          <code className="rounded bg-black/30 px-1">
            NEXT_PUBLIC_FIREBASE_*
          </code>
          . V hostingu je nastav:{" "}
          <strong className="text-amber-100">
            Netlify → Site → Environment variables
          </strong>{" "}
          (nebo Vercel → Settings → Environment Variables) — hodnoty zkopíruj z
          Firebase → Project settings → Your apps. Ulož a spusť{" "}
          <strong className="text-amber-100">nový deploy / Clear cache and deploy</strong>
          : proměnné <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_*</code>{" "}
          se vkládají při buildu, ne za běhu.
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
