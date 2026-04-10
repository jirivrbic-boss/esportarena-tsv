"use client";

import { isFirebaseConfigured } from "@/lib/firebase/config";

export function FirebaseNotice() {
  if (isFirebaseConfigured()) return null;
  return (
    <div className="border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-xs text-amber-200">
      Chybí proměnné prostředí Firebase. Zkopíruj{" "}
      <code className="rounded bg-black/30 px-1">.env.example</code> do{" "}
      <code className="rounded bg-black/30 px-1">.env.local</code> a doplň
      údaje projektu.
    </div>
  );
}
