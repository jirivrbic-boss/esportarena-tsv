"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/glow-button";
import { GlassCard } from "@/components/glass-card";
import { useAuth } from "@/contexts/auth-context";
import { toFriendlyAuthError } from "@/lib/firebase-auth-errors";
import {
  clearPasswordRecoveryAccount,
  readPasswordRecoveryAccount,
  type PasswordRecoveryAccount,
} from "@/lib/password-recovery";

export default function ZmenaHeslaPage() {
  const router = useRouter();
  const { firebaseReady, changePasswordWithCurrent } = useAuth();
  const [account, setAccount] = useState<PasswordRecoveryAccount | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setAccount(readPasswordRecoveryAccount());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!account?.email) {
      setError("Nejdřív vyber účet na stránce zapomenutého hesla.");
      return;
    }
    if (!firebaseReady) {
      setError("Firebase není nakonfigurováno.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Nové heslo musí mít alespoň 6 znaků.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Nová hesla se neshodují.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Nové heslo musí být jiné než současné.");
      return;
    }

    setPending(true);
    try {
      await changePasswordWithCurrent(
        account.email,
        currentPassword,
        newPassword
      );
      clearPasswordRecoveryAccount();
      void fetch("/api/notifications/site-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "**Heslo** · změna se starým heslem",
          title: "Změna hesla",
          description: `Účet: ${account.email}`,
        }),
      }).catch(() => {});
      setDone(true);
      window.setTimeout(() => router.push("/prihlaseni"), 1800);
    } catch (err) {
      setError(toFriendlyAuthError(err, "Změna hesla selhala."));
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
        Změna hesla
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Zadej současné heslo a dvakrát nové heslo.
      </p>

      <GlassCard className="mt-8">
        {done ? (
          <p className="text-sm text-[#39FF14]">
            Heslo je změněné. Přesměrováváme na přihlášení…
          </p>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            {account ? (
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Účet
                </p>
                <p className="mt-1 font-medium text-white">
                  {account.displayName}
                </p>
                <p className="text-sm text-slate-400">{account.email}</p>
              </div>
            ) : (
              <p className="text-sm text-amber-300/90">
                Chybí vybraný účet.{" "}
                <Link
                  href="/zapomenute-heslo"
                  className="text-[#39FF14] underline"
                >
                  Začni znovu
                </Link>
                .
              </p>
            )}

            <div>
              <label htmlFor="current-password">Současné heslo</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
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

            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <GlowButton
              type="submit"
              className="w-full"
              disabled={pending || !account}
            >
              {pending ? "Ukládám…" : "Změnit heslo"}
            </GlowButton>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
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
