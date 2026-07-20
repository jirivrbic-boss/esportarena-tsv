import { Suspense } from "react";
import { ObnovitUcetClient } from "./obnovit-ucet-client";

export default function ObnovitUcetPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-16 text-center text-slate-400">
          Načítání…
        </main>
      }
    >
      <ObnovitUcetClient />
    </Suspense>
  );
}
