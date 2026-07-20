"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";
import { useAuth } from "@/contexts/auth-context";
import { toFriendlyAuthError } from "@/lib/firebase-auth-errors";
import { clearPasswordRecoveryAccount } from "@/lib/password-recovery";

export function HesloAkceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseReady, verifyResetCode, confirmResetPassword } = useAuth();

  const oobCode = searchParams.get("oobCode") ?? "";
  const mode = searchParams.get("mode") ?? "";

  const [email, setEmail] = useState<string | null>(null);
  const [loadingCode, setLoadingCode] = useState(true);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!firebaseReady) {
        setCodeError("Firebase není nakonfigurováno.");
        setLoadingCode(false);
        return;
      }
      if (!oobCode || (mode && mode !== "resetPassword")) {
        setCodeError(
          "Chybí platný odkaz pro obnovu hesla. Požádej o nový e-mail."
        );
        setLoadingCode(false);
        return;
      }
      try {
        const resolvedEmail = await verifyResetCode(oobCode);
        if (!cancelled) {
          setEmail(resolvedEmail);
          setLoadingCode(false);
        }
      } catch (err) {
        if (!cancelled) {
          setCodeError(
            toFriendlyAuthError(err, "Odkaz pro obnovu hesla není platný.")
          );
          setLoadingCode(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [firebaseReady, oobCode, mode, verifyResetCode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (newPassword.length < 6) {
      setFormError("Heslo musí mít alespoň 6 znaků.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Hesla se neshodují.");
      return;
    }
    setPending(true);
    try {
      await confirmResetPassword(oobCode, newPassword);
      clearPasswordRecoveryAccount();
      void fetch("/api/notifications/site-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "**Heslo** · nastaveno z e-mailového odkazu",
          title: "Nové heslo (obnova)",
          description: email ? `Účet: ${email}` : undefined,
        }),
      }).catch(() => {});
      setDone(true);
      window.setTimeout(() => router.push("/prihlaseni"), 1800);
    } catch (err) {
      setFormError(toFriendlyAuthError(err, "Nastavení hesla selhalo."));
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
        Nové heslo
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Odkaz z e-mailu je přiřazený k účtu — zadej dvakrát nové heslo.
      </p>

      <GlassCard className="mt-8">
        {loadingCode ? (
          <p className="text-sm text-slate-400">Ověřuji odkaz…</p>
        ) : codeError ? (
          <div className="space-y-4">
            <p className="text-sm text-red-400" role="alert">
              {codeError}
            </p>
            <GlowButton href="/zapomenute-heslo" className="w-full">
              Požádat o nový odkaz
            </GlowButton>
          </div>
        ) : done ? (
          <p className="text-sm text-[#39FF14]">
            Heslo je nastavené. Přesměrováváme na přihlášení…
          </p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            {email ? (
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Účet
                </p>
                <p className="mt-1 text-sm text-slate-300">{email}</p>
              </div>
            ) : null}

            <div>
              <label htmlFor="new-password">Nové heslo</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="confirm-password">Nové heslo znovu</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            {formError ? (
              <p className="text-sm text-red-400" role="alert">
                {formError}
              </p>
            ) : null}

            <GlowButton type="submit" className="w-full" disabled={pending}>
              {pending ? "Ukládám…" : "Nastavit heslo"}
            </GlowButton>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/prihlaseni" className="text-[#39FF14] hover:underline">
            Přihlášení
          </Link>
        </p>
      </GlassCard>
    </motion.main>
  );
}
