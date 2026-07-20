"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function ObnovitUcetClient() {
  const searchParams = useSearchParams();
  const t = searchParams.get("t");
  const [phase, setPhase] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!t?.trim()) {
      setPhase("err");
      setMessage("V odkazu chybí platný parametr — použij celý odkaz z e-mailu.");
      return;
    }

    let cancelled = false;

    fetch("/api/account/cancel-deletion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recoveryToken: t.trim() }),
    })
      .then(async (res) => {
        const j = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (cancelled) return;
        if (res.ok && j.ok) {
          setPhase("ok");
          setMessage(
            "Naplánované smazání účtu je zrušené. Můžeš se znovu přihlásit do portálu kapitána."
          );
          return;
        }
        setPhase("err");
        setMessage(j.error ?? `Požadavek selhal (HTTP ${res.status}).`);
      })
      .catch(() => {
        if (!cancelled) {
          setPhase("err");
          setMessage("Síťová chyba — zkus to prosím znovu.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t]);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-bebas)] text-3xl tracking-wide text-white md:text-4xl">
        Obnovení účtu
      </h1>
      {phase === "loading" ? (
        <p className="mt-6 text-slate-400">Zpracovávám odkaz…</p>
      ) : (
        <p
          className={`mt-6 text-sm leading-relaxed ${
            phase === "ok" ? "text-[#39FF14]" : "text-red-400"
          }`}
          role="status"
        >
          {message}
        </p>
      )}
      {phase !== "loading" ? (
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/prihlaseni"
            className="inline-flex items-center justify-center rounded-lg border border-[#39FF14]/40 bg-[#39FF14] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black shadow-[0_0_14px_rgba(57,255,20,0.28)]"
          >
            Přihlásit se
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:border-[#39FF14]/40 hover:bg-white/10"
          >
            Domů
          </Link>
        </div>
      ) : null}
    </main>
  );
}
