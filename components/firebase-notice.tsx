"use client";

import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseNotice() {
  if (isFirebaseConfigured()) return null;

  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-xs leading-relaxed text-amber-200">
      {isProd ? (
        <>
          <strong className="text-amber-100">Produkce:</strong> na serveru chybí
          nebo jsou prázdné{" "}
          <code className="rounded bg-black/30 px-1">
            NEXT_PUBLIC_FIREBASE_API_KEY
          </code>
          ,{" "}
          <code className="rounded bg-black/30 px-1">
            NEXT_PUBLIC_FIREBASE_PROJECT_ID
          </code>
          ,{" "}
          <code className="rounded bg-black/30 px-1">
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          </code>
          . Doplň v{" "}
          <strong className="text-amber-100">Netlify → Environment variables</strong>{" "}
          (zkontroluj překlep: písmeno{" "}
          <strong className="text-amber-100">O</strong> vs. číslice{" "}
          <strong className="text-amber-100">0</strong> v API klíči) a dej{" "}
          <strong className="text-amber-100">Clear cache and deploy</strong>. Používej
          hlavní URL webu, ne starý odkaz z konkrétního deploye v historii.
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
