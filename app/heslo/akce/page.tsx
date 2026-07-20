import { Suspense } from "react";
import { HesloAkceClient } from "./heslo-akce-client";

export default function HesloAkcePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-20 text-center text-slate-400">
          Načítání…
        </main>
      }
    >
      <HesloAkceClient />
    </Suspense>
  );
}
