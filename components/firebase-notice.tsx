"use client";

import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseNotice() {
  if (isFirebaseConfigured()) return null;

  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-xs leading-relaxed text-amber-200">
      {isProd ? (
        <>
          <strong className="text-amber-100">Produkce:</strong> aplikaci chybí
          proměnné{" "}
          <code className="rounded bg-black/30 px-1">
            NEXT_PUBLIC_FIREBASE_*
          </code>
          . V{" "}
          <strong className="text-amber-100">
            Vercel → Project → Settings → Environment Variables
          </strong>{" "}
          je doplň (stejné hodnoty jako v Firebase → Project settings → Your
          apps). Poté spusť{" "}
          <strong className="text-amber-100">Redeploy</strong> — u proměnných
          začínajících na{" "}
          <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_</code> musí
          proběhnout nový build.
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
