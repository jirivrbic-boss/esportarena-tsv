"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";
import { useAuth } from "@/contexts/auth-context";
import { toFriendlyAuthError } from "@/lib/firebase-auth-errors";
import {
  readPasswordRecoveryAccount,
  type PasswordRecoveryAccount,
} from "@/lib/password-recovery";

export default function ObnovitHesloPage() {
  const { firebaseReady, sendPasswordReset } = useAuth();
  const [account, setAccount] = useState<PasswordRecoveryAccount | null>(null);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAccount(readPasswordRecoveryAccount());
  }, []);

  async function onSend() {
    setError(null);
    setMsg(null);
    if (!account?.email) {
      setError("Nejdřív vyber účet na stránce zapomenutého hesla.");
      return;
    }
    if (!firebaseReady) {
      setError("Firebase není nakonfigurováno.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/auth/send-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: account.email }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        clientFallback?: boolean;
      };

      if (res.ok && j.ok) {
        setMsg(
          "Odkaz jsme poslali na e-mail účtu. Otevři ho a nastav nové heslo (zkontroluj i spam)."
        );
        return;
      }

      if (j.clientFallback) {
        await sendPasswordReset(account.email);
        setMsg(
          "Odkaz jsme poslali přes Firebase na e-mail účtu. Otevři ho a nastav nové heslo (zkontroluj i spam)."
        );
        return;
      }

      setError(j.error ?? "Odeslání selhalo.");
    } catch (err) {
      try {
        await sendPasswordReset(account.email);
        setMsg(
          "Odkaz jsme poslali na e-mail účtu. Otevři ho a nastav nové heslo."
        );
      } catch (fallbackErr) {
        setError(toFriendlyAuthError(fallbackErr ?? err, "Odeslání selhalo."));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-md px-4 py-20 sm:px-6"
    >
      <h1 className="font-[family-name:var(--font-bebas)] text-4xl tracking-wide text-white">
        Obnovit heslo
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Pošleme odkaz na e-mail. Po kliknutí zadáš dvakrát nové heslo.
      </p>

      <GlassCard className="mt-8 space-y-4">
        {account ? (
          <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Účet
            </p>
            <p className="mt-1 font-medium text-white">{account.displayName}</p>
            <p className="text-sm text-slate-400">{account.email}</p>
          </div>
        ) : (
          <p className="text-sm text-amber-300/90">
            Chybí vybraný účet.{" "}
            <Link href="/zapomenute-heslo" className="text-[#39FF14] underline">
              Začni znovu
            </Link>
            .
          </p>
        )}

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {msg ? <p className="text-sm text-[#39FF14]">{msg}</p> : null}

        <GlowButton
          type="button"
          className="w-full"
          disabled={pending || !account}
          onClick={() => void onSend()}
        >
          {pending ? "Odesílám…" : "Poslat odkaz na e-mail"}
        </GlowButton>

        <p className="text-center text-sm text-slate-500">
          <Link
            href="/zapomenute-heslo"
            className="text-slate-400 hover:text-white"
          >
            ← Zpět
          </Link>
          {" · "}
          <Link href="/prihlaseni" className="text-[#39FF14] hover:underline">
            Přihlášení
          </Link>
        </p>
      </GlassCard>
    </motion.main>
  );
}
