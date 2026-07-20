"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";
import { useAuth } from "@/contexts/auth-context";
import {
  savePasswordRecoveryAccount,
  type PasswordRecoveryAccount,
} from "@/lib/password-recovery";

type Step = "email" | "accounts" | "method";

type LookupAccount = PasswordRecoveryAccount;

function ZapomenuteHesloInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseReady } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [accounts, setAccounts] = useState<LookupAccount[]>([]);
  const [selected, setSelected] = useState<LookupAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firebaseReady) {
      setError("Firebase není nakonfigurováno.");
      return;
    }
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Zadej e-mail.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/lookup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        accounts?: LookupAccount[];
      };
      if (!res.ok || !j.ok) {
        setError(j.error ?? "Vyhledání selhalo.");
        return;
      }
      const list = j.accounts ?? [];
      setAccounts(list);
      if (list.length === 0) {
        setError(
          "K tomuto e-mailu jsme nenašli žádný účet kapitána. Zkontroluj překlepy nebo se zaregistruj."
        );
        setStep("email");
        return;
      }
      setSelected(list[0] ?? null);
      setStep("accounts");
    } catch {
      setError("Vyhledání selhalo. Zkus to znovu.");
    } finally {
      setPending(false);
    }
  }

  function confirmAccount(account: LookupAccount) {
    setSelected(account);
    savePasswordRecoveryAccount(account);
    setStep("method");
  }

  function goReset() {
    if (!selected) return;
    savePasswordRecoveryAccount(selected);
    router.push("/zapomenute-heslo/obnovit");
  }

  function goChange() {
    if (!selected) return;
    savePasswordRecoveryAccount(selected);
    router.push("/zapomenute-heslo/zmena");
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md px-4 py-20 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white">
        Zapomenuté heslo
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Najdi účet podle e-mailu a zvol obnovu odkazem, nebo změnu hesla se
        součým heslem.
      </p>

      <GlassCard className="mt-8">
        {step === "email" ? (
          <form onSubmit={(e) => void onLookup(e)} className="space-y-4">
            <div>
              <label htmlFor="recovery-email">E-mail účtu</label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <GlowButton type="submit" disabled={pending} className="w-full">
              {pending ? "Hledám…" : "Vyhledat účet"}
            </GlowButton>
          </form>
        ) : null}

        {step === "accounts" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Našli jsme {accounts.length === 1 ? "tento účet" : "tyto účty"} —
              vyber, ke kterému chceš změnit heslo:
            </p>
            <ul className="space-y-2">
              {accounts.map((a) => (
                <li key={a.uid}>
                  <button
                    type="button"
                    onClick={() => setSelected(a)}
                    className={`flex w-full flex-col rounded-xl border px-4 py-3 text-left transition-colors ${
                      selected?.uid === a.uid
                        ? "border-[#39FF14]/50 bg-[#39FF14]/10"
                        : "border-white/10 bg-black/30 hover:border-white/25"
                    }`}
                  >
                    <span className="font-medium text-white">{a.displayName}</span>
                    <span className="text-sm text-slate-400">{a.email}</span>
                  </button>
                </li>
              ))}
            </ul>
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <GlowButton
                type="button"
                disabled={!selected}
                onClick={() => selected && confirmAccount(selected)}
              >
                Pokračovat
              </GlowButton>
              <GlowButton
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("email");
                  setError(null);
                }}
              >
                Zpět
              </GlowButton>
            </div>
          </div>
        ) : null}

        {step === "method" && selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Vybraný účet
              </p>
              <p className="mt-1 font-medium text-white">{selected.displayName}</p>
              <p className="text-sm text-slate-400">{selected.email}</p>
            </div>
            <p className="text-sm text-slate-400">Jak chceš heslo upravit?</p>
            <GlowButton type="button" className="w-full" onClick={goReset}>
              Obnovit heslo
            </GlowButton>
            <p className="text-xs text-slate-500">
              Pošleme odkaz na e-mail. Po otevření nastavíš nové heslo (2×).
            </p>
            <GlowButton
              type="button"
              variant="ghost"
              className="w-full"
              onClick={goChange}
            >
              Změna hesla
            </GlowButton>
            <p className="text-xs text-slate-500">
              Zadáš současné heslo a dvakrát nové — bez e-mailu.
            </p>
            <button
              type="button"
              className="text-sm text-slate-500 hover:text-white"
              onClick={() => setStep("accounts")}
            >
              ← Jiný účet
            </button>
          </div>
        ) : null}
      </GlassCard>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/prihlaseni" className="text-[#39FF14] hover:underline">
          Zpět na přihlášení
        </Link>
      </p>
    </motion.main>
  );
}

export function ZapomenuteHesloClient() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-20 text-center text-slate-400">
          Načítání…
        </main>
      }
    >
      <ZapomenuteHesloInner />
    </Suspense>
  );
}
